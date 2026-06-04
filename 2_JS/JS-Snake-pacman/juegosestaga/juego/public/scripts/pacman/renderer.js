// ================================================================
// renderer.js - Escape Escolar (Pac-Man Escolar) con Sprites
// ================================================================

// ── Partículas flotantes ───────────────────────────────────────────
const _pxp = []; // particle pool

function _pxpAdd(x, y, text, color) {
  _pxp.push({ x, y, text, color, age: 0, maxAge: 70, vy: -1.3 });
}

// ── Caché de imágenes ───────────────────────────────────────────
const _pxCache = {};
function _pxImg(src) {
  if (!_pxCache[src]) {
    const img = new Image();
    img.src = src;
    _pxCache[src] = img;
  }
  return _pxCache[src];
}

// Preload all assets — img-pacman prioritario
const spritePaths = typeof PACMAN_ASSETS !== 'undefined' ? { ...PACMAN_ASSETS } : {
  saraLeft: '/assets/characters/sarapix.png',
  saraRight: '/assets/characters/sarapix.png',
  maleLeft: '/assets/characters/malepix.png',
  maleRight: '/assets/characters/malepix.png',
  saraCelebrateLeft: '/assets/characters/festejo-sara.png',
  saraCelebrateRight: '/assets/characters/festejo-sara.png',
  maleCelebrateLeft: '/assets/characters/festejo-male.png',
  maleCelebrateRight: '/assets/characters/festejo-male.png',
  esteban: '/assets/characters/orange.png',
  lorena: '/assets/characters/pink.png',
  scaglione: '/assets/characters/violeta.png',
  estebanWeak: '/assets/characters/azul.png',
  lorenaWeak: '/assets/characters/azul.png',
  scaglioneWeak: '/assets/characters/azul.png',
  guardapolvo: '/assets/items/guarda.png',
  cuaderno: '/assets/items/cuaderno.png',
  computadora: '/assets/items/compu.png',
  mapa1: '/assets/maps/mapa1.png',
  mapa2: '/assets/maps/mapa2.png',
  mapa3: '/assets/maps/mapa3.png',
  mapa4: '/assets/maps/mapa4.png',
  mapa5: '/assets/maps/mapa5.png',
  mapa6: '/assets/maps/mapa6.png'
};

// Preload all sprites
for (const path of Object.values(spritePaths)) {
  _pxImg(path);
}

// ── Track de puntaje para partículas ─────────────────────────────
let _pxLastScore = -1;

// ================================================================
// FUNCIÓN PRINCIPAL
// ================================================================
function drawPacmanGame(canvas, ctx, state) {
  const map = state.map;
  if (!map || !map.length) return;

  const rows = map.length;
  const cols = map[0].length;
  const tW = canvas.width / cols;
  const tH = canvas.height / rows;
  const level = state.level || 1;

  // Partículas por cambio de puntaje
  if (_pxLastScore >= 0 && state.score > _pxLastScore && state.players[0] && !state.players[0].isDead) {
    const p0 = state.players[0];
    const diff = state.score - _pxLastScore;
    const col = diff >= 50 ? '#ff007f' : '#fbbf24';
    _pxpAdd(p0.x * tW + tW / 2, p0.y * tH - tH / 2, `+${diff}`, col);
  }
  _pxLastScore = state.score;

  // ── 1. Fondo ───────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#0a0f1a');
  bgGrad.addColorStop(0.5, '#0e1320');
  bgGrad.addColorStop(1, '#0a0f1a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Baldosas sutiles
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  const bSize = Math.max(tW, 32);
  for (let cx2 = 0; cx2 <= canvas.width; cx2 += bSize) {
    ctx.beginPath(); ctx.moveTo(cx2, 0); ctx.lineTo(cx2, canvas.height); ctx.stroke();
  }
  for (let cy2 = 0; cy2 <= canvas.height; cy2 += bSize) {
    ctx.beginPath(); ctx.moveTo(0, cy2); ctx.lineTo(canvas.width, cy2); ctx.stroke();
  }
  ctx.restore();

  // Mapa ilustrado superpuesto
  const mapKey = `mapa${Math.min(level, 6)}`;
  const mapImg = _pxImg(spritePaths[mapKey]);
  if (mapImg.complete && mapImg.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // ── 2. CELDAS DEL MAPA ────────────────────────────────────────
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = map[r][c];
      const x = c * tW;
      const y = r * tH;
      if      (cell === 1) _drawLocker(ctx, x, y, tW, tH);
      else if (cell === 2) _drawDot(ctx, x, y, tW, tH);
      else if (cell === 3) _drawApple(ctx, x, y, tW, tH);
    }
  }

  // ── 3. OBJETO ESPECIAL ─────────────────────────────────────────
  if (state.fruit) {
    _drawSpecialItem(ctx, state.fruit.x * tW, state.fruit.y * tH, state.fruit.type, tW, tH);
  }

  // ── 4. FANTASMAS ───────────────────────────────────────────────
  state.ghosts.forEach(g => {
    if (g.isDead) return;
    _drawGhost(ctx, g, tW, tH, state.frightenedTimer || 0);
  });

  // ── 5. JUGADORES ───────────────────────────────────────────────
  state.players.forEach(p => {
    if (p.isDead) return;
    _drawPlayer(ctx, p, tW, tH);
  });

  // ── 6. PARTÍCULAS ─────────────────────────────────────────────
  _drawParticles(ctx);

  // Overlay de estado
  if (state.state === 'level_clear') {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#39ff14';
    ctx.font = `bold ${Math.max(16, tW * 0.85)}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#39ff14';
    ctx.fillText('¡NIVEL COMPLETADO!', canvas.width / 2, canvas.height / 2 - tH);
    ctx.fillStyle = '#00f0ff';
    ctx.font = `bold ${Math.max(10, tW * 0.65)}px Orbitron, sans-serif`;
    ctx.fillText(`Nivel ${level} → ${level + 1}`, canvas.width / 2, canvas.height / 2 + tH * 0.5);
    ctx.restore();
  } else if (state.state === 'game_over') {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff007f';
    ctx.font = `bold ${Math.max(20, tW * 1.5)}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.restore();
  } else if (state.state === 'victory') {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fbbf24';
    ctx.font = `bold ${Math.max(20, tW * 1.5)}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('¡VICTORIA!', canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
}

// ================================================================
// PARED - LOCKER ESCOLAR
// ================================================================
function _drawLocker(ctx, x, y, tW, tH) {
  ctx.save();
  // Base oscura
  ctx.fillStyle = '#091426';
  ctx.fillRect(x, y, tW, tH);
  // Cara del locker con gradiente
  const grd = ctx.createLinearGradient(x, y, x, y + tH);
  grd.addColorStop(0, '#1e3a5f');
  grd.addColorStop(0.3, '#172545');
  grd.addColorStop(0.7, '#121f3a');
  grd.addColorStop(1, '#091426');
  ctx.fillStyle = grd;
  ctx.fillRect(x + 1, y + 1, tW - 2, tH - 2);
  // Borde neón
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#00f0ff';
  ctx.strokeRect(x + 1.5, y + 1.5, tW - 3, tH - 3);
  // Ranuras de ventilación
  if (tW >= 14 && tH >= 14) {
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 0;
    const vents = Math.floor(tH / 8);
    for (let v = 1; v <= vents && v <= 3; v++) {
      const vy = y + (tH / (vents + 1)) * v;
      ctx.beginPath();
      ctx.moveTo(x + 4, vy);
      ctx.lineTo(x + tW - 4, vy);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ================================================================
// PUNTO - BOLITA DE PAPEL
// ================================================================
function _drawDot(ctx, x, y, tW, tH) {
  ctx.save();
  const cx = x + tW / 2;
  const cy = y + tH / 2;
  const r = Math.max(2.2, Math.min(tW, tH) * 0.16);
  const pulse = 0.8 + 0.2 * Math.sin(Date.now() / 300);
  ctx.shadowBlur = 10 * pulse;
  ctx.shadowColor = '#fbbf24';
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ================================================================
// PODER - MANZANA DEL PROFE (Hora Libre)
// ================================================================
function _drawApple(ctx, x, y, tW, tH) {
  ctx.save();
  const cx = x + tW / 2;
  const cy = y + tH / 2 + 2;
  const blink = Math.floor(Date.now() / 250) % 2 === 0;
  const r = Math.max(6, Math.min(tW, tH) * 0.4);
  const pulse = 0.95 + 0.05 * Math.sin(Date.now() / 200);
  ctx.shadowBlur = blink ? 30 : 12;
  ctx.shadowColor = '#ff007f';
  ctx.fillStyle = blink ? '#ff007f' : '#e11d48';
  ctx.beginPath();
  ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.3, cy - r * 0.35, r * 0.35, r * 0.25, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  // Hoja
  ctx.fillStyle = '#22c55e';
  ctx.shadowBlur = 5;
  ctx.shadowColor = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(cx + 6, cy - r - 5, 6, 3, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ================================================================
// OBJETO ESPECIAL (Guardapolvo / Cuaderno / Computadora)
// ================================================================
function _drawSpecialItem(ctx, fx, fy, type, tW, tH) {
  ctx.save();
  const cx = fx + tW / 2;
  const cy = fy + tH / 2;
  const size = Math.min(tW, tH) * 0.9;
  let imgSrc = null;
  let glowColor = null;
  switch(type) {
    case 'Guardapolvo':
      imgSrc = spritePaths.guardapolvo;
      glowColor = '#60a5fa';
      break;
    case 'Cuaderno':
      imgSrc = spritePaths.cuaderno;
      glowColor = '#3b82f6';
      break;
    case 'Computadora':
      imgSrc = spritePaths.computadora;
      glowColor = '#a78bfa';
      break;
  }
  if (imgSrc) {
    const img = _pxImg(imgSrc);
    if (img.complete) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = glowColor;
      ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
    } else {
      // Fallback
      if (type === 'Guardapolvo') {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#60a5fa';
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(cx - size / 2 + 2, cy - size / 2, size - 4, size);
      } else if (type === 'Cuaderno') {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#3b82f6';
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(cx - size / 2 + 2, cy - size / 2 + 2, size - 4, size - 4);
      } else if (type === 'Computadora') {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#a78bfa';
        ctx.fillStyle = '#6d28d9';
        ctx.fillRect(cx - size / 2 + 2, cy - size / 2 + 2, size - 4, size - 12);
      }
    }
  }
  ctx.restore();
}

// ================================================================
// JUGADOR
// ================================================================
function _drawPlayer(ctx, p, tW, tH) {
  const cx = p.x * tW + tW / 2;
  const cy = p.y * tH + tH / 2;
  const size = Math.min(tW, tH) * 1.32;
  const isSara = p.character === 'Sara';
  const facingRight = p.lastHorizontalDir === 'RIGHT';
  let imgSrc;
  if (p.hasGuardapolvo) {
    if (isSara) imgSrc = facingRight ? spritePaths.saraCelebrateRight : spritePaths.saraCelebrateLeft;
    else imgSrc = facingRight ? spritePaths.maleCelebrateRight : spritePaths.maleCelebrateLeft;
  } else {
    if (isSara) imgSrc = facingRight ? spritePaths.saraRight : spritePaths.saraLeft;
    else imgSrc = facingRight ? spritePaths.maleRight : spritePaths.maleLeft;
  }
  const img = _pxImg(imgSrc);
  ctx.save();
  ctx.translate(cx, cy);
  if (img.complete && img.naturalWidth > 0) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = isSara ? 'rgba(255,0,127,0.5)' : 'rgba(0,229,255,0.5)';
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
  } else {
    // Fallback si la imagen no cargó
    const radius = size / 2;
    const moving = p.dir !== 'NONE';
    const period = moving ? 80 : 500;
    const mouthFrac = Math.abs(Math.sin(Date.now() / period));
    const mouthMax  = 0.42;
    const mouthAngle = mouthFrac * mouthMax * Math.PI;
    ctx.fillStyle = isSara ? '#ff007f' : '#00e5ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = isSara ? '#ff007f' : '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, mouthAngle, Math.PI * 2 - mouthAngle);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ================================================================
// FANTASMA
// ================================================================
function _drawGhost(ctx, g, tW, tH, frightenedTimer) {
  const cx = g.x * tW + tW / 2;
  const cy = g.y * tH + tH / 2;
  const size = Math.min(tW, tH) * 1.65;
  const frightened = g.mode === 'frightened';
  const returning = g.mode === 'returning';
  let imgSrc = null;
  let glowColor = null;
  if (frightened || returning) {
    if (g.name === 'Esteban') imgSrc = spritePaths.estebanWeak;
    else if (g.name === 'Lorena') imgSrc = spritePaths.lorenaWeak;
    else imgSrc = spritePaths.scaglioneWeak;
    glowColor = returning ? '#6366f1' : '#1d4ed8';
  } else {
    if (g.name === 'Esteban') {
      imgSrc = spritePaths.esteban;
      glowColor = '#f97316';
    } else if (g.name === 'Lorena') {
      imgSrc = spritePaths.lorena;
      glowColor = '#ff007f';
    } else {
      imgSrc = spritePaths.scaglione;
      glowColor = '#a855f7';
    }
  }
  const img = _pxImg(imgSrc);
  ctx.save();
  if (returning) ctx.globalAlpha = 0.55;
  if (frightened && frightenedTimer < 120 && Math.floor(Date.now() / 150) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  if (img.complete && img.naturalWidth > 0) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = glowColor;
    ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
  } else {
    // Fallback
    const radius = size / 2;
    const wobble = Math.sin(Date.now() / 200) * 0.03;
    ctx.translate(0, wobble * radius);
    let bodyColor;
    if (frightened) {
      bodyColor = '#1d4ed8';
    } else {
      if (g.name === 'Lorena') bodyColor = '#a855f7';
      else if (g.name === 'Scaglione') bodyColor = '#64748b';
      else bodyColor = '#f97316';
    }
    ctx.shadowBlur = 22;
    ctx.shadowColor = bodyColor;
    ctx.fillStyle = bodyColor;
    // Cuerpo
    ctx.beginPath();
    ctx.arc(cx, cy - radius * 0.15, radius, Math.PI, 0, false);
    ctx.lineTo(cx + radius, cy + radius * 0.9);
    const bW = (radius * 2) / 3;
    for (let i = 0; i < 3; i++) {
      const bx = cx + radius - i * bW;
      ctx.arc(bx - bW / 2, cy + radius * 0.9, bW / 2, 0, Math.PI, true);
    }
    ctx.lineTo(cx - radius, cy - radius * 0.15);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ================================================================
// PARTÍCULAS DE PUNTAJE
// ================================================================
function _drawParticles(ctx) {
  for (let i = _pxp.length - 1; i >= 0; i--) {
    const p = _pxp[i];
    p.age++;
    p.y += p.vy;
    const alpha = Math.max(0, 1 - p.age / p.maxAge);
    const scale = 0.7 + (p.age / p.maxAge) * 0.6;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.scale(scale, scale);
    ctx.fillStyle   = p.color;
    ctx.shadowBlur  = 10;
    ctx.shadowColor = p.color;
    ctx.font = `bold ${Math.max(10, 13)}px 'Orbitron', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.text, 0, 0);
    ctx.restore();
    if (p.age >= p.maxAge) _pxp.splice(i, 1);
  }
}
