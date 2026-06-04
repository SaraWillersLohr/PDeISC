// Renderizador AAA — Cable Rush
// Cabeza (conector) + segmentos cola (cuerpo/cola) con glow tecnológico

const _snakeImgCache = {};
const _particles = [];
let _frameTick = 0;
let _lastRenderState = null;
let _lastStateTime = 0;

function _loadImg(src) {
  if (!_snakeImgCache[src]) {
    const img = new Image();
    img.onload = () => { _snakeImgCache[src]._ready = true; };
    img.src = src;
    _snakeImgCache[src] = img;
  }
  return _snakeImgCache[src];
}

function _preloadCableAssets() {
  CABLE_LIST.forEach((c) => {
    _loadImg(c.cabeza);
    _loadImg(c.cola);
  });
}

(function preload() {
  if (typeof CABLE_LIST !== 'undefined') _preloadCableAssets();
  else document.addEventListener('DOMContentLoaded', _preloadCableAssets);
})();

function _isImgReady(img) {
  return img && (img._ready || (img.complete && img.naturalWidth > 0));
}

function _drawRotatedSprite(ctx, img, cx, cy, size, angle, glowColor, glowIntensity) {
  ctx.save();
  if (glowColor && glowIntensity > 0) {
    ctx.shadowBlur = 8 + glowIntensity * 10;
    ctx.shadowColor = glowColor;
  }
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  let dw = size;
  let dh = size;
  if (img.naturalWidth && img.naturalHeight) {
    const aspect = img.naturalWidth / img.naturalHeight;
    if (aspect > 1) {
      dh = size / aspect;
    } else {
      dw = size * aspect;
    }
  }

  ctx.drawImage(img, -dw / 2, -dw / 2, dw, dh);
  ctx.restore();
}

function _segmentCenter(seg, tileW, tileH) {
  return { x: seg.x * tileW + tileW / 2, y: seg.y * tileH + tileH / 2 };
}

function getCableColorName(characterId) {
  if (characterId === 'USB') return 'azul';
  if (characterId === 'HDMI') return 'violeta';
  if (characterId === 'Ethernet') return 'verde';
  return 'azul';
}

function getRelativeDir(p1, p2, width, height) {
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;
  if (dx > width / 2) dx -= width;
  else if (dx < -width / 2) dx += width;
  if (dy > height / 2) dy -= height;
  else if (dy < -height / 2) dy += height;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'RIGHT' : 'LEFT';
  } else {
    return dy > 0 ? 'DOWN' : 'UP';
  }
}

function _drawCableSegment(ctx, prev, curr, next, cable, tileW, tileH, alpha, isTail, glowBoost, width, height) {
  const center = _segmentCenter(curr, tileW, tileH);
  const size = Math.max(tileW, tileH) * 1.70;
  const glow = (isTail ? 1 : 0.65) + (glowBoost || 0);

  // Grosor visual del cable = lado corto de la imagen de cola.
  // Las imágenes de cola son verticales (aspect < 1), así que dw = size * aspect.
  // Las imágenes de giro son cuadradas (aspect ≈ 1) y deben usar ese mismo grosor
  // como su tamaño, para que las curvas no se vean más gruesas que el cuerpo.
  const colaImg = _loadImg(cable.cola);
  const colaAspect = (colaImg && colaImg.naturalWidth && colaImg.naturalHeight)
    ? colaImg.naturalWidth / colaImg.naturalHeight
    : 0.51; // fallback medido: ~47/92
  // grosorPx = ancho efectivo que ocupa la cola dibujada (su lado corto)
  const grosorPx = size * Math.min(colaAspect, 1);
  // Las curvas son cuadradas → para que su lado visible = grosorPx, usamos grosorPx como size
  const sizeTurn = grosorPx;

  ctx.save();
  ctx.globalAlpha = alpha;

  if (isTail) {
    const segImg = colaImg;
    // La cola apunta hacia el cuerpo (hacia prev = hacia la cabeza).
    // Rotamos 180° para que la parte oscura quede en el extremo final.
    const dir = getRelativeDir(curr, prev, width, height);
    const angle = dirToAngle(dir) + Math.PI;
    if (_isImgReady(segImg)) {
      _drawRotatedSprite(ctx, segImg, center.x, center.y, size, angle, cable.glow || cable.color, glow);
    }
  } else {
    const dirToHead = getRelativeDir(curr, prev, width, height);
    const dirToTail = getRelativeDir(curr, next, width, height);

    const isStraight = (dirToHead === 'UP' && dirToTail === 'DOWN') ||
                       (dirToHead === 'DOWN' && dirToTail === 'UP') ||
                       (dirToHead === 'LEFT' && dirToTail === 'RIGHT') ||
                       (dirToHead === 'RIGHT' && dirToTail === 'LEFT');

    if (isStraight) {
      const segImg = colaImg;
      // dirToHead apunta hacia la cabeza. El sprite tiene la parte brillante
      // hacia "adelante" (hacia la cabeza), así que rotamos 180° para que
      // la parte oscura quede atrás (hacia la cola).
      const angle = dirToAngle(dirToHead) + Math.PI;
      if (_isImgReady(segImg)) {
        _drawRotatedSprite(ctx, segImg, center.x, center.y, size, angle, cable.glow || cable.color, glow);
      }
    } else {
      const vDir = (dirToHead === 'UP' || dirToHead === 'DOWN') ? dirToHead : dirToTail;
      const hDir = (dirToHead === 'LEFT' || dirToHead === 'RIGHT') ? dirToHead : dirToTail;

      const vMap = { 'UP': 'up', 'DOWN': 'down' };
      // Los sprites están espejados horizontalmente respecto a su nombre:
      // el archivo "der" contiene la apertura en el lado izquierdo, y viceversa.
      // Se invierte el mapeo para que cada trayectoria reciba la imagen correcta.
      const hMap = { 'LEFT': 'der', 'RIGHT': 'izq' };

      const colorName = getCableColorName(cable.id);
      const spriteUrl = `/assets/characters/doblar-${vMap[vDir]}-${hMap[hDir]}-${colorName}.png?v=4`;
      const turnImg = _loadImg(spriteUrl);

      if (_isImgReady(turnImg)) {
        // Usar sizeTurn para que el grosor de la curva coincida con el del cuerpo
        _drawRotatedSprite(ctx, turnImg, center.x, center.y, sizeTurn, 0, cable.glow || cable.color, glow);
      } else {
        const angle = dirToAngle(dirToHead);
        if (_isImgReady(colaImg)) {
          _drawRotatedSprite(ctx, colaImg, center.x, center.y, size, angle, cable.glow || cable.color, glow);
        }
      }
    }
  }
  ctx.restore();
}

function _drawCableHead(ctx, seg, dir, cable, tileW, tileH, alpha, glowBoost) {
  const center = _segmentCenter(seg, tileW, tileH);
  const size = Math.max(tileW, tileH) * 1.85;
  const headImg = _loadImg(cable.cabeza);
  const angle = dirToAngle(dir);

  ctx.save();
  ctx.globalAlpha = alpha;

  if (_isImgReady(headImg)) {
    _drawRotatedSprite(ctx, headImg, center.x, center.y, size, angle, cable.glow || cable.color, 1.2 + (glowBoost || 0));
    ctx.globalAlpha = alpha * 0.4;
    ctx.globalCompositeOperation = 'lighter';
    _drawRotatedSprite(ctx, headImg, center.x, center.y, size * 1.06, angle, cable.glow || cable.color, 0.3);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = cable.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 18;
    ctx.shadowColor = cable.color;
    ctx.fillRect(seg.x * tileW + 1, seg.y * tileH + 1, tileW - 2, tileH - 2);
    ctx.strokeRect(seg.x * tileW + 1, seg.y * tileH + 1, tileW - 2, tileH - 2);
  }
  ctx.restore();
}

function _drawPlayerLabel(ctx, seg, name, cable, tileW, tileH) {
  const cx = seg.x * tileW + tileW / 2;
  const cy = seg.y * tileH - 4;
  ctx.save();
  ctx.font = `bold ${Math.max(7, tileH * 0.32)}px Orbitron, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillText(name, cx + 1, cy + 1);
  ctx.fillStyle = cable.color;
  ctx.shadowBlur = 6;
  ctx.shadowColor = cable.color;
  ctx.fillText(name, cx, cy);
  ctx.restore();
}

function _drawPlayerCable(ctx, player, tileW, tileH, showLabels, width, height) {
  const cable = getCable(player.character);
  const segments = player.segments;
  if (!segments || !segments.length) return;

  const baseAlpha = player.ghost ? 0.5 : 1;
  const glowBoost = player.overclock ? 0.5 : 0;

  // ── Paso 1: dibujar cuerpo de atrás hacia adelante (sin cabeza) ──────────
  // Dibujamos desde el último segmento hasta el índice 1 (excluye cabeza).
  // Así el segmento más cercano a la cabeza queda encima del resto del cuerpo.
  for (let index = segments.length - 1; index >= 1; index--) {
    const seg  = segments[index];
    const prev = segments[index - 1]; // más cerca de la cabeza
    const next = segments[index + 1]; // más cerca de la cola (puede ser undefined)
    const isTail = index === segments.length - 1;
    if (prev) {
      _drawCableSegment(ctx, prev, seg, next, cable, tileW, tileH, baseAlpha, isTail, glowBoost, width, height);
    }
  }

  // ── Paso 2: dibujar cabeza encima de todo ────────────────────────────────
  const headSeg = segments[0];
  const nextSeg = segments[1];
  const headDir = player.dir || (nextSeg ? vecToDir(nextSeg.x - headSeg.x, nextSeg.y - headSeg.y) : 'RIGHT');
  _drawCableHead(ctx, headSeg, headDir, cable, tileW, tileH, baseAlpha, glowBoost);
  if (showLabels && player.name) {
    _drawPlayerLabel(ctx, headSeg, player.name.split(' ')[0], cable, tileW, tileH);
  }

  const head = segments[0];
  const hx = head.x * tileW + tileW / 2;
  const hy = head.y * tileH + tileH / 2;

  if (player.firewall) {
    ctx.save();
    ctx.strokeStyle = '#db2777';
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#db2777';
    ctx.lineWidth = Math.max(2, tileW * 0.08);
    ctx.beginPath();
    ctx.arc(hx, hy, tileW * 0.65 + Math.sin(_frameTick / 8) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (player.emp) {
    ctx.save();
    ctx.fillStyle = 'rgba(14,165,233,0.35)';
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = Math.max(1.5, tileW * 0.06);
    ctx.fillRect(head.x * tileW, head.y * tileH, tileW, tileH);
    ctx.strokeRect(head.x * tileW, head.y * tileH, tileW, tileH);
    ctx.restore();
  }

  if (player.overclock) {
    const sparkCount = 3;
    const sparkRadius = Math.max(1.5, tileW * 0.08);
    const orbitRadius = Math.max(10, tileW * 0.5);
    for (let i = 0; i < sparkCount; i++) {
      const t = (_frameTick + i * 7) % 20;
      const angle = (t / 20) * Math.PI * 2;
      const r = orbitRadius + (t % 5);
      ctx.save();
      ctx.fillStyle = '#ffaa00';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(hx + Math.cos(angle) * r, hy + Math.sin(angle) * r, sparkRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

function _spawnAmbientParticle(w, h, level) {
  if (_particles.length > 40) return;
  _particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -0.2 - Math.random() * 0.4,
    life: 80 + Math.random() * 60,
    maxLife: 140,
    size: 1 + Math.random() * 2,
    color: level >= 3
      ? `rgba(255,0,127,${0.2 + Math.random() * 0.3})`
      : `rgba(0,240,255,${0.15 + Math.random() * 0.25})`
  });
}

function _updateParticles(w, h, level) {
  if (_frameTick % 8 === 0) _spawnAmbientParticle(w, h, level);
  for (let i = _particles.length - 1; i >= 0; i--) {
    const p = _particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0 || p.y < 0) _particles.splice(i, 1);
  }
}

function _drawParticles(ctx, w, h) {
  _particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = (p.life / p.maxLife) * 0.8;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.restore();
  });
}

function _drawBackground(ctx, level) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const g = ctx.createLinearGradient(0, 0, w, h);
  if (level >= 3) {
    g.addColorStop(0, '#0a0510');
    g.addColorStop(0.5, '#120818');
    g.addColorStop(1, '#080410');
  } else {
    g.addColorStop(0, '#030610');
    g.addColorStop(0.5, '#060a16');
    g.addColorStop(1, '#040810');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.strokeStyle = level >= 3 ? 'rgba(255,0,127,0.04)' : 'rgba(0,240,255,0.04)';
  ctx.lineWidth = 1;
  const step = 28;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();
}

function _drawGrid(ctx, width, height, tileW, tileH, level) {
  // Grid estático — sin desplazamiento para que el tablero no se mueva
  ctx.save();
  ctx.strokeStyle = level >= 3 ? 'rgba(255,0,127,0.06)' : 'rgba(0,240,255,0.06)';
  ctx.lineWidth = 1;
  for (let c = 0; c <= width; c++) {
    ctx.beginPath();
    const x = c * tileW;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }
  for (let r = 0; r <= height; r++) {
    ctx.beginPath();
    const y = r * tileH;
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function _drawScanlines(ctx) {
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#000';
  for (let y = 0; y < ctx.canvas.height; y += 3) {
    ctx.fillRect(0, y, ctx.canvas.width, 1);
  }
  ctx.restore();
}

const _powerupImgCache = {};
const POWERUP_SPRITES = {
  overclock: '/assets/items/energy.png',
  firewall: '/assets/items/escudo.png',
  emp: '/assets/items/iman.png'
};

function _loadPowerupImg(src) {
  if (!_powerupImgCache[src]) {
    const img = new Image();
    img.onload = () => { _powerupImgCache[src]._ready = true; };
    img.src = src;
    _powerupImgCache[src] = img;
  }
  return _powerupImgCache[src];
}

(function preloadPowerups() {
  Object.values(POWERUP_SPRITES).forEach((src) => _loadPowerupImg(src));
})();

function _drawItem(ctx, item, tileW, tileH, frame) {
  const ix = item.x * tileW;
  const iy = item.y * tileH;
  const cx = ix + tileW / 2;
  const cy = iy + tileH / 2;
  ctx.save();

  if (item.type === 'datos') {
    const pulse = 0.85 + Math.sin(frame / 6) * 0.15;
    ctx.fillStyle = '#00f0ff';
    ctx.shadowBlur = 12 * pulse;
    ctx.shadowColor = '#00f0ff';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(ix + 3, iy + 3, tileW - 6, tileH - 6, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#001a22';
    ctx.font = `bold ${Math.max(7, tileH * 0.42)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(Math.floor(frame / 10) % 2 === 0 ? '1' : '0', cx, cy);
  } else if (item.type === 'energia') {
    ctx.fillStyle = '#ffaa00';
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(cx, iy + 3);
    ctx.lineTo(ix + tileW - 4, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(ix + tileW * 0.65, iy + tileH - 3);
    ctx.lineTo(ix + tileW * 0.35, cy);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fill();
  } else if (item.type === 'nodo') {
    const blink = Math.floor(frame / 12) % 2 === 0;
    ctx.fillStyle = blink ? '#39ff14' : '#ff007f';
    ctx.shadowBlur = 16;
    ctx.shadowColor = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(5, tileW * 0.32), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = blink ? '#ff007f' : '#39ff14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(7, tileW * 0.42), 0, Math.PI * 2);
    ctx.stroke();
  } else if (item.type === 'bonus') {
    // Item bonus temporal: estrella pulsante en color dorado intenso con barra de vida
    const pulse  = 0.9 + Math.sin(frame / 4) * 0.1;
    const spin   = (frame / 15) % (Math.PI * 2);
    const r      = Math.max(6, tileW * 0.38) * pulse;
    const spikes = 5;

    ctx.shadowBlur  = 20;
    ctx.shadowColor = '#ffd700';

    // Dibujar estrella
    ctx.beginPath();
    for (let s = 0; s < spikes * 2; s++) {
      const angle  = spin + (s * Math.PI) / spikes;
      const radius = s % 2 === 0 ? r : r * 0.45;
      const px     = cx + Math.cos(angle) * radius;
      const py     = cy + Math.sin(angle) * radius;
      s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle   = '#ffd700';
    ctx.strokeStyle = '#fff8b0';
    ctx.lineWidth   = 1.5;
    ctx.fill();
    ctx.stroke();

    // Barra de tiempo restante (si expiresAt disponible)
    if (item.expiresAt) {
      const remaining = Math.max(0, item.expiresAt - Date.now());
      const total     = 12000; // max TTL aprox
      const ratio     = Math.min(1, remaining / total);
      const barW      = tileW - 4;
      const barH      = Math.max(2, tileH * 0.1);
      const barX      = ix + 2;
      const barY      = iy + tileH - barH - 2;
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = 'rgba(0,0,0,0.5)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle   = ratio > 0.4 ? '#ffd700' : '#ff4400';
      ctx.fillRect(barX, barY, barW * ratio, barH);
    }
  }
  ctx.restore();
}

function _drawObstacle(ctx, obs, tileW, tileH, level) {
  const ox = obs.x * tileW;
  const oy = obs.y * tileH;
  ctx.save();

  const col = level >= 4 ? '#ff2244' : '#446688';
  const glo = level >= 4 ? 'rgba(255,34,68,0.5)' : 'rgba(40,100,160,0.4)';

  ctx.shadowBlur  = 10;
  ctx.shadowColor = glo;
  ctx.fillStyle   = col;
  ctx.strokeStyle = level >= 4 ? '#ff6688' : '#88aacc';
  ctx.lineWidth   = 1.5;

  // Forma: rectángulo con muescas en las esquinas (aspecto de bloque de servidor)
  const m  = Math.max(2, tileW * 0.12); // muesca
  const w  = tileW - 2;
  const h  = tileH - 2;
  ctx.beginPath();
  ctx.moveTo(ox + 1 + m,  oy + 1);
  ctx.lineTo(ox + 1 + w - m, oy + 1);
  ctx.lineTo(ox + 1 + w,  oy + 1 + m);
  ctx.lineTo(ox + 1 + w,  oy + 1 + h - m);
  ctx.lineTo(ox + 1 + w - m, oy + 1 + h);
  ctx.lineTo(ox + 1 + m,  oy + 1 + h);
  ctx.lineTo(ox + 1,      oy + 1 + h - m);
  ctx.lineTo(ox + 1,      oy + 1 + m);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cruz interior
  ctx.shadowBlur  = 0;
  ctx.strokeStyle = level >= 4 ? 'rgba(255,150,150,0.6)' : 'rgba(180,220,255,0.5)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(ox + tileW / 2, oy + 4);
  ctx.lineTo(ox + tileW / 2, oy + tileH - 4);
  ctx.moveTo(ox + 4, oy + tileH / 2);
  ctx.lineTo(ox + tileW - 4, oy + tileH / 2);
  ctx.stroke();

  ctx.restore();
}

function _drawPowerup(ctx, pu, tileW, tileH, frame) {
  const px = pu.x * tileW + tileW / 2;
  const py = pu.y * tileH + tileH / 2;
  const bob = Math.sin(frame / 8 + pu.x) * 3;
  const size = Math.max(tileW, tileH) * 1.65;
  ctx.save();

  const styles = {
    overclock: { color: '#ffaa00', label: 'OC' },
    firewall:  { color: '#db2777', label: 'FW' },
    emp:       { color: '#0ea5e9', label: 'EM' }
  };
  const s = styles[pu.type] || { color: '#fff', label: '?' };
  const spriteSrc = POWERUP_SPRITES[pu.type];
  const img = spriteSrc ? _loadPowerupImg(spriteSrc) : null;

  ctx.shadowBlur = 18;
  ctx.shadowColor = s.color;

  if (img && _isImgReady(img)) {
    ctx.drawImage(img, px - size / 2, py + bob - size / 2, size, size);
  } else {
    const r = Math.max(12, tileW * 0.45);
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py + bob, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = s.color;
    ctx.font = `bold ${Math.max(8, tileH * 0.38)}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(s.label, px, py + bob);
  }
  ctx.restore();
}

function drawSnakeGame(canvas, ctx, state) {
  _frameTick++;
  const width = state.width || 30;
  const height = state.height || 20;
  const level = state.level || 1;
  const tileW = canvas.width / width;
  const tileH = canvas.height / height;
  const is2P = state.players && state.players.filter((p) => !p.isDead).length > 1;

  if (!_lastRenderState || _lastRenderState.tickId !== state.tickId || _lastRenderState.players.length !== state.players.length) {
    _lastRenderState = JSON.parse(JSON.stringify(state));
    _lastStateTime = Date.now();
  }

  const timeElapsed = Date.now() - _lastStateTime;

  _drawBackground(ctx, level);
  _updateParticles(canvas.width, canvas.height, level);
  _drawParticles(ctx, canvas.width, canvas.height);
  _drawGrid(ctx, width, height, tileW, tileH, level);

  if (state.eatFlash && Date.now() - state.eatFlash < 200) {
    ctx.save();
    const alpha = 1 - (Date.now() - state.eatFlash) / 200;
    ctx.fillStyle = `rgba(0, 240, 255, ${0.18 * alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  state.items.forEach((item) => _drawItem(ctx, item, tileW, tileH, _frameTick));
  state.powerups.forEach((pu) => _drawPowerup(ctx, pu, tileW, tileH, _frameTick));

  // Obstáculos fijos
  if (state.obstacles && state.obstacles.length > 0) {
    state.obstacles.forEach((obs) => _drawObstacle(ctx, obs, tileW, tileH, level));
  }

  const interpolatedPlayers = state.players.map((player) => {
    if (player.isDead) return player;
    const lastPlayer = _lastRenderState.players.find((lp) => lp.playerIndex === player.playerIndex);
    if (!lastPlayer || lastPlayer.isDead) return player;

    // Intervalo de movimiento real según nivel y overclock
    // SNAKE_LEVELS está disponible en client-snake.js (mismo scope de página)
    const lvlIdx = Math.min((state.level || 1) - 1, 7);
    const baseTick = (typeof SNAKE_LEVELS !== 'undefined')
      ? SNAKE_LEVELS[lvlIdx].tickInterval
      : 200;
    // Overclock mueve 2 celdas por tick → el intervalo visual es la mitad
    const playerInterval = player.overclock ? baseTick / 2 : baseTick;

    let t = timeElapsed / playerInterval;
    if (isNaN(t) || !isFinite(t)) t = 1;
    if (t > 1) t = 1;
    if (t < 0) t = 0;

    const currSegs = player.segments;
    const prevSegs = lastPlayer.segments;
    const interpolatedSegments = [];

    const len = currSegs.length;
    for (let i = 0; i < len; i++) {
      const currSeg = currSegs[i];
      const prevSeg = (prevSegs && prevSegs[i]) ? prevSegs[i] : (prevSegs ? prevSegs[prevSegs.length - 1] : currSeg);

      let dx = currSeg.x - prevSeg.x;
      let dy = currSeg.y - prevSeg.y;
      if (dx > width / 2) dx -= width;
      else if (dx < -width / 2) dx += width;
      if (dy > height / 2) dy -= height;
      else if (dy < -height / 2) dy += height;

      const interpX = prevSeg.x + dx * t;
      const interpY = prevSeg.y + dy * t;
      interpolatedSegments.push({ x: interpX, y: interpY });
    }

    return {
      ...player,
      segments: interpolatedSegments
    };
  });

  interpolatedPlayers.forEach((p) => {
    if (p.isDead) return;
    ctx.save();
    _drawPlayerCable(ctx, p, tileW, tileH, is2P, width, height);
    ctx.restore();

    if (p.magnet) {
      const head = p.segments[0];
      const hx = head.x * tileW + tileW / 2;
      const hy = head.y * tileH + tileH / 2;
      const radius = 5.5;

      ctx.save();
      state.items.forEach((item) => {
        let dx = head.x - item.x;
        let dy = head.y - item.y;
        if (dx > width / 2) dx -= width;
        else if (dx < -width / 2) dx += width;
        if (dy > height / 2) dy -= height;
        else if (dy < -height / 2) dy += height;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist <= radius) {
          const ix = item.x * tileW + tileW / 2;
          const iy = item.y * tileH + tileH / 2;
          ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)';
          ctx.lineWidth = 1.5 + Math.sin(_frameTick / 4) * 0.5;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#0ea5e9';
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          const segments = 4;
          for (let i = 1; i < segments; i++) {
            const ratio = i / segments;
            const px = hx + (ix - hx) * ratio + (Math.random() - 0.5) * 6;
            const py = hy + (iy - hy) * ratio + (Math.random() - 0.5) * 6;
            ctx.lineTo(px, py);
          }
          ctx.lineTo(ix, iy);
          ctx.stroke();
        }
      });
      ctx.restore();
    }
  });

  ctx.save();
  const borderColor = level >= 3 ? '#ff007f' : '#00f0ff';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = Math.max(2, tileW * 0.08);
  ctx.shadowBlur = 12;
  ctx.shadowColor = borderColor;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  ctx.restore();

  _drawScanlines(ctx);
}

function resetSnakeRenderer() {
  _particles.length = 0;
  _frameTick = 0;
}
