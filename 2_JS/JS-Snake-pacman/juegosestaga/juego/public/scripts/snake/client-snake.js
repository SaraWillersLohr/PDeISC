// Controlador del Cliente de Cable Rush (Snake) - Local (1P/2P) y Online (Sockets)
document.addEventListener('DOMContentLoaded', () => {
  initClient();
});

let canvas, ctx;
let socketConn = null;
let gameConfig = null;
let localGameInstance = null;
let localIntervalId = null;
let rafId = null;
let isPaused = false;
let lastState = null;
let lastLevel = 1;
let gameOverHandled = false;
let eatFlashUntil = 0;
let connectionBanner = null;
let touchActivePlayer = 0;

let touchStartX = 0;
let touchStartY = 0;

function initClient() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  observeGameLayoutResize(resizeCanvas);

  const configStr = sessionStorage.getItem('gameConfig');
  if (!configStr) {
    window.location.href = '/';
    return;
  }
  gameConfig = JSON.parse(configStr);

  setupHud();
  setupKeyboardInput();
  setupTouchInput();
  connectionBanner = document.getElementById('connectionBanner');
  startRenderLoop();

  if (gameConfig.multiplayer === 'online') {
    setupOnlineGame();
  } else {
    runCountdown(() => setupLocalGame());
  }
}

function startRenderLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  const loop = () => {
    if (lastState && canvas && ctx) {
      drawSnakeGame(canvas, ctx, enrichState(lastState));
    }
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
}

function runCountdown(onDone) {
  const badge = document.getElementById('countdownBadge');
  if (!badge) { onDone(); return; }
  const steps = ['3', '2', '1', '¡GO!'];
  let i = 0;
  badge.style.display = 'block';
  const tick = () => {
    if (i >= steps.length) {
      badge.style.display = 'none';
      onDone();
      return;
    }
    badge.textContent = steps[i];
    if (window.audioSynth && i < 3) window.audioSynth.playSelect();
    if (i === 3 && window.audioSynth) window.audioSynth.playStartGame();
    i++;
    setTimeout(tick, i === steps.length ? 400 : 650);
  };
  tick();
}

window.togglePause = function togglePause() {
  if (gameOverHandled || !lastState || lastState.state === 'game_over') return;
  if (gameConfig.multiplayer === 'online') return;
  isPaused = !isPaused;
  const badge = document.getElementById('pauseBadge');
  if (badge) badge.style.display = isPaused ? 'block' : 'none';
  if (isPaused) {
    if (localIntervalId) { clearInterval(localIntervalId); localIntervalId = null; }
    window.audioSynth && window.audioSynth.stopBGM();
  } else {
    resumeLocalLoop();
    window.audioSynth && window.audioSynth.startBGM(lastLevel >= 3 ? 'danger' : 'normal');
  }
};

window.restartGame = function restartGame() {
  if (gameConfig.multiplayer === 'online') {
    if (socketConn) socketConn.emit('restartGame');
    window.location.href = '/lobby';
    return;
  }
  isPaused = false;
  const badge = document.getElementById('pauseBadge');
  if (badge) badge.style.display = 'none';
  document.getElementById('gameOverlay').classList.remove('active');
  resetSnakeRenderer && resetSnakeRenderer();
  runCountdown(() => setupLocalGame());
};

function setupHud() {
  const cable = getCable(gameConfig.p1Character);
  document.getElementById('hudP1Name').textContent = `${gameConfig.p1Name} (${cable.name})`;

  if (gameConfig.mode === '2P') {
    document.getElementById('hudP2Container').style.display = 'flex';
    document.getElementById('p2ControlInfo').style.display = 'inline';

    if (gameConfig.multiplayer === 'local') {
      const rival = getRivalCable(gameConfig.p1Character);
      document.getElementById('hudP2Name').textContent = `J2 (${getCable(rival).name})`;
      const hint = document.getElementById('touchPlayerHint');
      if (hint) hint.style.display = 'inline';
    } else {
      const rival = gameConfig.players.find((p) => p.playerIndex !== gameConfig.myIndex);
      if (rival) {
        document.getElementById('hudP2Name').textContent = `${rival.name} (${getCable(rival.character).name})`;
      }
      document.getElementById('hudRoomInfo').style.display = 'flex';
      document.getElementById('hudRoomCode').textContent = gameConfig.roomCode;
    }
  }
}

function showConnectionBanner(msg, type = 'warning') {
  if (!connectionBanner) connectionBanner = document.getElementById('connectionBanner');
  if (!connectionBanner) return;
  connectionBanner.textContent = msg;
  connectionBanner.className = `snake-connection-banner snake-connection-banner--${type}`;
  connectionBanner.style.display = 'block';
}

function hideConnectionBanner() {
  if (connectionBanner) connectionBanner.style.display = 'none';
}

function setupOnlineGame() {
  const myPlayer = gameConfig.players[gameConfig.myIndex];

  socketConn = io({
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000
  });

  socketConn.on('connect', () => {
    hideConnectionBanner();
    socketConn.emit('rejoinGame', {
      code: gameConfig.roomCode,
      name: myPlayer.name
    });
  });

  socketConn.on('connect_error', () => {
    showConnectionBanner('Sin conexión al servidor. Reintentando...', 'error');
  });

  socketConn.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      showConnectionBanner('Desconectado del servidor.', 'error');
    } else {
      showConnectionBanner('Conexión perdida. Reconectando...', 'warning');
    }
  });

  socketConn.on('gameState', (state) => {
    handleStateUpdate(state);
  });

  socketConn.on('gameOver', ({ gameState }) => {
    handleStateUpdate(gameState);
  });

  socketConn.on('gameResumed', ({ message }) => {
    hideConnectionBanner();
    showConnectionBanner(message, 'success');
    setTimeout(hideConnectionBanner, 2500);
    window.audioSynth && window.audioSynth.playLevelUp();
  });

  socketConn.on('waitingForPlayers', ({ message }) => {
    showConnectionBanner(message, 'warning');
  });

  socketConn.on('playerDisconnected', ({ message, paused }) => {
    if (paused) showConnectionBanner(message, 'warning');
  });

  socketConn.on('errorMsg', ({ message }) => {
    showConnectionBanner(message, 'error');
  });

  if (window.audioSynth) {
    window.audioSynth.startBGM('normal');
  }

  document.getElementById('btnOverlayAction').textContent = 'Volver al Lobby';
  document.getElementById('btnOverlayAction').onclick = () => {
    if (socketConn) socketConn.disconnect();
    window.location.href = '/lobby';
  };
}

function resizeCanvas() {
  if (!canvas) return;
  const gridW = lastState?.width || localGameInstance?.width || getSnakeGridDimensions(false).width;
  const gridH = lastState?.height || localGameInstance?.height || getSnakeGridDimensions(false).height;
  const aspect = gridW / gridH;
  const { w, h } = computeFullscreenCanvasSize(aspect, 'snake');
  applyCanvasPixelSize(canvas, w, h);
  if (lastState) {
    drawSnakeGame(canvas, ctx, enrichState(lastState));
  }
}

function enrichState(state) {
  return {
    ...state,
    eatFlash: eatFlashUntil
  };
}

function setupLocalGame() {
  gameOverHandled = false;
  isPaused = false;
  lastLevel = 1;
  eatFlashUntil = 0;
  touchActivePlayer = 0;
  document.body.classList.remove('level-danger');

  if (localIntervalId) {
    clearInterval(localIntervalId);
    localIntervalId = null;
  }

  const playersList = [
    { socketId: 'local_p1', name: gameConfig.p1Name, character: gameConfig.p1Character, playerIndex: 0 }
  ];

  if (gameConfig.mode === '2P') {
    playersList.push({
      socketId: 'local_p2',
      name: 'Jugador 2',
      character: getRivalCable(gameConfig.p1Character),
      playerIndex: 1
    });
  }

  localGameInstance = new LocalSnakeEngine(playersList);

  document.getElementById('gameOverlay').classList.remove('active');
  document.getElementById('hudLevel').textContent = '1';
  updateLevelStatus('Conectá el cable · Recogé datos y energía');

  if (window.audioSynth) {
    window.audioSynth.stopBGM();
    window.audioSynth.startBGM('normal');
  }

  resumeLocalLoop();

  const actionBtn = document.getElementById('btnOverlayAction');
  actionBtn.textContent = 'Volver a Jugar';
  actionBtn.onclick = () => window.restartGame();
}

function resumeLocalLoop() {
  if (!localGameInstance || isPaused) return;

  // Obtener el intervalMs correcto para el nivel actual
  const getCurrentInterval = () => {
    const cfg = SNAKE_LEVELS[Math.min(localGameInstance.level - 1, SNAKE_LEVELS.length - 1)];
    return cfg.tickInterval;
  };

  let currentInterval = getCurrentInterval();

  const startLoop = (intervalMs) => {
    if (localIntervalId) clearInterval(localIntervalId);
    localIntervalId = setInterval(() => {
      if (isPaused) return;
      localGameInstance.tick();
      const state = localGameInstance.getSerializedState();

      if (state.level !== undefined && state.level !== lastLevel) {
        const prev = lastLevel;
        lastLevel = state.level;
        if (prev > 0 && state.level > prev) {
          showLevelUpToast(state.level, false);
        }
        document.getElementById('hudLevel').textContent = String(state.level);
        document.body.classList.toggle('level-danger', state.level >= 4);

        const newMs = getCurrentInterval();
        if (state.level >= 4) {
          updateLevelStatus('⚠ Nivel crítico — velocidad máxima');
          window.audioSynth && window.audioSynth.playDangerAlert();
          window.audioSynth && window.audioSynth.switchBGM('danger');
        } else {
          updateLevelStatus(`Nivel ${state.level} — seguí conectando`);
          window.audioSynth && window.audioSynth.playLevelUp();
        }

        if (newMs !== currentInterval) {
          currentInterval = newMs;
          startLoop(currentInterval);
          return; // el nuevo setInterval ya maneja el estado siguiente
        }
      }

      handleStateUpdate(state);

      if (state.state === 'game_over') {
        clearInterval(localIntervalId);
        localIntervalId = null;
        window.audioSynth && window.audioSynth.stopBGM();
        saveLocalScore(state);
      }
    }, intervalMs);
  };

  startLoop(currentInterval);
}

function updateLevelStatus(msg) {
  const el = document.getElementById('levelStatus');
  if (el) el.textContent = msg;
}

async function saveLocalScore(state) {
  try {
    for (const p of state.players) {
      const isWinner = state.winner === p.socketId;
      const isDraw = state.winner === 'draw';
      await fetch('/api/leaderboard/snake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: p.name,
          score: p.score,
          character: p.character,
          duration: state.duration,
          victories: (isWinner || isDraw) ? 1 : 0
        })
      });
    }
  } catch (err) {
    console.error('Error al guardar puntaje local:', err);
  }
}

let globalTickId = 0;
function handleStateUpdate(state) {
  globalTickId++;
  state.tickId = globalTickId;
  if (lastState) {
    const currentLen = state.players.reduce((sum, p) => sum + p.segments.length, 0);
    const lastLen = lastState.players.reduce((sum, p) => sum + p.segments.length, 0);
    if (currentLen > lastLen) {
      window.audioSynth && window.audioSynth.playCoin();
      eatFlashUntil = Date.now();
    }

    const deadCountNow = state.players.filter((p) => p.isDead).length;
    const deadCountLast = lastState.players.filter((p) => p.isDead).length;
    if (deadCountNow > deadCountLast) {
      window.audioSynth && window.audioSynth.playCrash();
    }

    const myIdx = gameConfig.multiplayer === 'online' ? gameConfig.myIndex : 0;
    const meLast = lastState.players.find((p) => p.playerIndex === myIdx);
    const meNow = state.players.find((p) => p.playerIndex === myIdx);
    if (meLast && meNow) {
      const gotPowerup =
        (meNow.overclock && !meLast.overclock) ||
        (meNow.firewall && !meLast.firewall) ||
        (meNow.magnet && !meLast.magnet) ||
        (meNow.emp && !meLast.emp);
      if (gotPowerup) window.audioSynth && window.audioSynth.playPowerup();
    }

    if (state.level !== undefined && state.level !== lastLevel && gameConfig.multiplayer === 'online') {
      const prev = lastLevel;
      lastLevel = state.level;
      if (prev > 0 && state.level > prev) {
        showLevelUpToast(state.level, false);
      }
      document.getElementById('hudLevel').textContent = String(state.level);
      document.body.classList.toggle('level-danger', state.level >= 4);
      if (state.level >= 4) {
        updateLevelStatus('⚠ Nivel crítico');
        window.audioSynth && window.audioSynth.playDangerAlert();
        window.audioSynth && window.audioSynth.switchBGM('danger');
      } else {
        updateLevelStatus(`Nivel ${state.level}`);
        window.audioSynth && window.audioSynth.playLevelUp();
      }
    }
  }

  lastState = state;

  document.getElementById('hudDuration').textContent = `${state.duration}s`;
  if (state.level !== undefined) {
    document.getElementById('hudLevel').textContent = String(state.level);
  }

  const p1 = state.players.find((p) => p.playerIndex === 0);
  if (p1) document.getElementById('hudP1Score').textContent = p1.score;

  const p2 = state.players.find((p) => p.playerIndex === 1);
  if (p2) document.getElementById('hudP2Score').textContent = p2.score;

  const myIndex = gameConfig.multiplayer === 'online' ? gameConfig.myIndex : 0;
  const me = state.players.find((p) => p.playerIndex === myIndex);
  updatePowerupBadges(me);

  if (state.state === 'game_over' && !gameOverHandled) {
    gameOverHandled = true;
    showGameOverOverlay(state, p1, p2);
    window.audioSynth && window.audioSynth.stopBGM();
    const myPlayer = state.players.find((p) => p.playerIndex === myIndex);
    const iWon = myPlayer && state.winner === myPlayer.socketId;
    const isDraw = state.winner === 'draw';
    if (iWon && !isDraw) window.audioSynth && window.audioSynth.playVictory();
    else window.audioSynth && window.audioSynth.playGameOver();
  }
}

function updatePowerupBadges(me) {
  const puContainer = document.getElementById('powerupIndicators');
  if (!puContainer) return;
  if (!me) { puContainer.innerHTML = ''; return; }

  const badges = [];
  if (me.overclock) badges.push('<span class="powerup-badge badge-overclock">⚡ OVERCLOCK</span>');
  if (me.firewall) badges.push('<span class="powerup-badge badge-firewall">🛡️ FIREWALL</span>');
  if (me.magnet) badges.push('<span class="powerup-badge badge-emp">🧲 IMÁN ACTIVO</span>');
  if (me.emp) badges.push('<span class="powerup-badge badge-emp">❄️ CONGELADO</span>');
  const html = badges.join('');
  if (puContainer.innerHTML !== html) puContainer.innerHTML = html;
}

function showGameOverOverlay(state, p1, p2) {
  const overlay = document.getElementById('gameOverlay');
  const title = document.getElementById('overlayTitle');
  const msg = document.getElementById('overlayMessage');
  const scoreSec = document.getElementById('overlayScoreSection');

  overlay.classList.add('active');

  const name1 = p1 ? p1.name : 'J1';
  const name2 = p2 ? p2.name : 'J2';

  if (state.winner === 'draw') {
    title.textContent = '¡Empate Técnico!';
    title.className = 'display-5 text-warning animate-pulse';
  } else if (state.winner === 'none') {
    title.textContent = '¡Cable Desconectado!';
    title.className = 'display-5 text-danger animate-pulse';
  } else {
    const winnerPlayer = state.players.find((p) => p.socketId === state.winner);
    if (winnerPlayer) {
      title.textContent = `¡Ganador: ${winnerPlayer.name}!`;
      title.className = 'display-5 text-success animate-pulse';
    } else {
      title.textContent = 'Partida Finalizada';
      title.className = 'display-5 text-info animate-pulse';
    }
  }

  msg.textContent = `Duración: ${state.duration}s · Nivel alcanzado: ${state.level || 1}`;

  scoreSec.innerHTML = `
    <div class="text-info">${name1}: <span class="text-success">${p1 ? p1.score : 0} pts</span></div>
    ${p2 ? `<div class="text-danger">${name2}: <span class="text-success">${p2.score} pts</span></div>` : ''}
  `;
}

function setupKeyboardInput() {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      e.preventDefault();
      window.togglePause();
      return;
    }

    if (e.code === 'KeyW' || e.code === 'ArrowUp') {
      e.preventDefault();
      sendMove(e.code === 'KeyW' ? 0 : 1, 'UP');
    } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      e.preventDefault();
      sendMove(e.code === 'KeyS' ? 0 : 1, 'DOWN');
    } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
      e.preventDefault();
      sendMove(e.code === 'KeyA' ? 0 : 1, 'LEFT');
    } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
      e.preventDefault();
      sendMove(e.code === 'KeyD' ? 0 : 1, 'RIGHT');
    }
  });
}

function sendMove(playerIdx, direction) {
  if (gameConfig.multiplayer === 'online') {
    if (playerIdx === gameConfig.myIndex && socketConn && socketConn.connected) {
      socketConn.emit('playerMove', direction);
    }
  } else if (localGameInstance) {
    const socketId = playerIdx === 0 ? 'local_p1' : 'local_p2';
    localGameInstance.handleInput(socketId, direction);
  }
}

function setupTouchInput() {
  const btnUp = document.getElementById('tBtnUp');
  const btnDown = document.getElementById('tBtnDown');
  const btnLeft = document.getElementById('tBtnLeft');
  const btnRight = document.getElementById('tBtnRight');
  const btnSwitch = document.getElementById('tBtnSwitch');

  const pressBtn = (btn, fn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      btn.classList.add('is-pressed');
      fn();
    });
    btn.addEventListener('pointerup', () => btn.classList.remove('is-pressed'));
    btn.addEventListener('pointerleave', () => btn.classList.remove('is-pressed'));
  };

  const handleTouch = (dir) => {
    let idx = gameConfig.multiplayer === 'online' ? gameConfig.myIndex : touchActivePlayer;
    sendMove(idx, dir);
  };

  if (btnUp) pressBtn(btnUp, () => handleTouch('UP'));
  if (btnDown) pressBtn(btnDown, () => handleTouch('DOWN'));
  if (btnLeft) pressBtn(btnLeft, () => handleTouch('LEFT'));
  if (btnRight) pressBtn(btnRight, () => handleTouch('RIGHT'));

  if (btnSwitch && gameConfig.mode === '2P' && gameConfig.multiplayer === 'local') {
    btnSwitch.addEventListener('click', () => {
      touchActivePlayer = touchActivePlayer === 0 ? 1 : 0;
      btnSwitch.textContent = touchActivePlayer === 0 ? 'J1' : 'J2';
      btnSwitch.classList.toggle('is-p2', touchActivePlayer === 1);
      window.audioSynth && window.audioSynth.playSelect();
    });
  } else if (btnSwitch) {
    btnSwitch.style.visibility = 'hidden';
  }

  window.addEventListener('touchstart', (e) => {
    if (e.target.closest('.d-btn, .btn-hud, .overlay, .header-nav')) return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (e.target.closest('.d-btn, .btn-hud, .overlay, .header-nav')) return;
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 40) handleTouch(diffX > 0 ? 'RIGHT' : 'LEFT');
    } else if (Math.abs(diffY) > 40) {
      handleTouch(diffY > 0 ? 'DOWN' : 'UP');
    }
  }, { passive: true });
}

// ─── Tabla de niveles (espejo del servidor) ───────────────────────────────────
const SNAKE_LEVELS = [
  /* 1 */ { tickInterval: 200, duration: 0,   obstacles: 0,  bonusChance: 0.00 },
  /* 2 */ { tickInterval: 175, duration: 15,  obstacles: 3,  bonusChance: 0.10 },
  /* 3 */ { tickInterval: 150, duration: 30,  obstacles: 6,  bonusChance: 0.15 },
  /* 4 */ { tickInterval: 125, duration: 50,  obstacles: 9,  bonusChance: 0.20 },
  /* 5 */ { tickInterval: 105, duration: 70,  obstacles: 13, bonusChance: 0.25 },
  /* 6 */ { tickInterval:  85, duration: 95,  obstacles: 17, bonusChance: 0.30 },
  /* 7 */ { tickInterval:  68, duration: 125, obstacles: 22, bonusChance: 0.35 },
  /* 8 */ { tickInterval:  52, duration: 160, obstacles: 28, bonusChance: 0.40 },
];

function _snakeLevelConfig(level) {
  return SNAKE_LEVELS[Math.min(level - 1, SNAKE_LEVELS.length - 1)];
}

function _calcSnakeLevel(duration) {
  let lv = 1;
  for (let i = SNAKE_LEVELS.length - 1; i >= 0; i--) {
    if (duration >= SNAKE_LEVELS[i].duration) { lv = i + 1; break; }
  }
  return lv;
}

class LocalSnakeEngine {
  constructor(playersList) {
    const grid = getSnakeGridDimensions(false);
    this.width  = grid.width;
    this.height = grid.height;
    this.state   = 'playing';
    this.duration = 0;
    this.tickCount = 0;
    this.items    = [];
    this.powerups = [];
    this.obstacles = [];
    this.winner   = null;
    this.playersList = playersList;
    this.level    = 1;
    this.powerupSpawnTimer = null;

    this.initGame();
  }

  initGame() {
    this.players = this.playersList.map((p, idx) => {
      const isFirst = idx === 0;
      const startX  = isFirst ? 4 : this.width - 5;
      const startY  = Math.floor(this.height / 2);
      const initialDir = isFirst ? 'RIGHT' : 'LEFT';

      const segments = [];
      for (let i = 0; i < 3; i++) {
        segments.push({ x: startX - (isFirst ? i : -i), y: startY });
      }

      return {
        socketId: p.socketId,
        name: p.name,
        character: p.character,
        playerIndex: p.playerIndex,
        segments,
        dir: initialDir,
        nextDir: initialDir,
        score: 0,
        isDead: false,
        overclockTicks: 0,
        firewallTicks: 0,
        empTicks: 0,
        magnetTicks: 0
      };
    });

    this.obstacles = [];
    this.items    = [];
    this.powerups = [];
    for (let i = 0; i < 3; i++) this.spawnItem();
    this.spawnPowerup();
    this._syncObstacles();
  }

  handleInput(socketId, dir) {
    const player = this.players.find((p) => p.socketId === socketId);
    if (!player || player.isDead || player.empTicks > 0) return;
    const curDir = player.dir;
    if (dir === 'UP'    && curDir === 'DOWN')  return;
    if (dir === 'DOWN'  && curDir === 'UP')    return;
    if (dir === 'LEFT'  && curDir === 'RIGHT') return;
    if (dir === 'RIGHT' && curDir === 'LEFT')  return;
    player.nextDir = dir;
  }

  // ─── Obstáculos ────────────────────────────────────────────────────────────
  _syncObstacles() {
    const target = _snakeLevelConfig(this.level).obstacles;
    while (this.obstacles.length < target) {
      const tile = this._getRandomFreeTileForObstacle();
      if (tile) this.obstacles.push(tile);
      else break;
    }
  }

  _getRandomFreeTileForObstacle() {
    const safeZone = 5;
    let x, y, attempts = 0;
    do {
      x = Math.floor(Math.random() * (this.width  - 4)) + 2;
      y = Math.floor(Math.random() * (this.height - 4)) + 2;
      attempts++;
      if (attempts > 200) return null;
    } while (
      this.isTileOccupied(x, y) ||
      this.isObstacle(x, y)     ||
      this.items.some(i  => i.x === x && i.y === y) ||
      this.powerups.some(p => p.x === x && p.y === y) ||
      this.players.some(p => {
        const hx = p.playerIndex === 0 ? 4 : this.width - 5;
        return Math.abs(x - hx) < safeZone && Math.abs(y - Math.floor(this.height / 2)) < 3;
      })
    );
    return { x, y };
  }

  isObstacle(x, y) {
    return this.obstacles.some(o => o.x === x && o.y === y);
  }

  // ─── Tiles libres ──────────────────────────────────────────────────────────

  isTileOccupied(x, y) {
    return this.players.some((p) => p.segments.some((seg) => seg.x === x && seg.y === y));
  }

  getRandomFreeTile() {
    let x, y, attempts = 0;
    do {
      x = Math.floor(Math.random() * (this.width  - 2)) + 1;
      y = Math.floor(Math.random() * (this.height - 2)) + 1;
      attempts++;
      if (attempts > 200) break;
    } while (
      this.isTileOccupied(x, y)  ||
      this.isObstacle(x, y)      ||
      this.items.some((i)  => i.x === x && i.y === y) ||
      this.powerups.some((p) => p.x === x && p.y === y)
    );
    return { x, y };
  }

  // ─── Items ─────────────────────────────────────────────────────────────────

  spawnItem() {
    const tile = this.getRandomFreeTile();
    const cfg  = _snakeLevelConfig(this.level);
    const rand = Math.random();
    if (rand < cfg.bonusChance) {
      const ttl = 8000 + Math.random() * 4000;
      this.items.push({ x: tile.x, y: tile.y, type: 'bonus', expiresAt: Date.now() + ttl });
      return;
    }
    const r2 = Math.random();
    let type = 'datos';
    if (r2 > 0.6 && r2 <= 0.9) type = 'energia';
    else if (r2 > 0.9)          type = 'nodo';
    this.items.push({ x: tile.x, y: tile.y, type });
  }

  _cleanExpiredBonus() {
    const now = Date.now();
    this.items = this.items.filter(i => !i.expiresAt || i.expiresAt > now);
  }

  spawnPowerup() {
    const tile  = this.getRandomFreeTile();
    const types = ['overclock', 'firewall', 'emp'];
    const type  = types[Math.floor(Math.random() * types.length)];
    this.powerups.push({ x: tile.x, y: tile.y, type });
  }

  schedulePowerupRespawn() {
    if (this.powerupSpawnTimer) clearTimeout(this.powerupSpawnTimer);
    this.powerupSpawnTimer = setTimeout(() => {
      if (this.state === 'playing') this.spawnPowerup();
    }, 8000);
  }

  // ─── Imán ──────────────────────────────────────────────────────────────────

  applyMagnetAttraction() {
    this.players.forEach((player) => {
      if (player.isDead || !(player.magnetTicks > 0)) return;
      const head   = player.segments[0];
      const radius = 5.5;
      this.items.forEach((item) => {
        let dx = head.x - item.x;
        let dy = head.y - item.y;
        if (dx >  this.width  / 2) dx -= this.width;
        if (dx < -this.width  / 2) dx += this.width;
        if (dy >  this.height / 2) dy -= this.height;
        if (dy < -this.height / 2) dy += this.height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist <= radius) {
          const force = 0.15 + (1 - dist / radius) * 0.35;
          item.x += (dx / dist) * force;
          item.y += (dy / dist) * force;
          if (item.x < 0)             item.x += this.width;
          if (item.x >= this.width)   item.x -= this.width;
          if (item.y < 0)             item.y += this.height;
          if (item.y >= this.height)  item.y -= this.height;
        }
      });
    });
  }

  // ─── Tick ──────────────────────────────────────────────────────────────────

  tick() {
    if (this.state !== 'playing') return;

    this.tickCount++;
    if (this.tickCount % 10 === 0) {
      this.duration++;
      const newLevel = _calcSnakeLevel(this.duration);
      if (newLevel !== this.level) {
        this.level = newLevel;
        this._syncObstacles();
      }
    }

    if (this.tickCount % 5 === 0) this._cleanExpiredBonus();

    this.applyMagnetAttraction();

    this.players.forEach((player) => {
      if (player.isDead) return;

      if (player.overclockTicks > 0) player.overclockTicks--;
      if (player.firewallTicks  > 0) player.firewallTicks--;
      if (player.empTicks > 0) {
        player.empTicks--;
        return;
      }
      if (player.magnetTicks > 0) player.magnetTicks--;

      const steps = player.overclockTicks > 0 ? 2 : 1;
      for (let step = 0; step < steps; step++) {
        if (player.isDead) break;
        this._stepPlayer(player);
      }
    });

    this.checkGameOver();
  }

  // Mueve al jugador exactamente una celda y resuelve colisiones/consumos.
  _stepPlayer(player) {
    player.dir = player.nextDir;

    const head = { ...player.segments[0] };
    if (player.dir === 'UP')    head.y--;
    if (player.dir === 'DOWN')  head.y++;
    if (player.dir === 'LEFT')  head.x--;
    if (player.dir === 'RIGHT') head.x++;

    const outOfBounds = head.x < 0 || head.x >= this.width || head.y < 0 || head.y >= this.height;
    if (outOfBounds) {
      if (player.firewallTicks > 0) {
        player.firewallTicks = 0;
        if      (head.x < 0)            head.x = this.width  - 1;
        else if (head.x >= this.width)  head.x = 0;
        else if (head.y < 0)            head.y = this.height - 1;
        else if (head.y >= this.height) head.y = 0;
      } else {
        player.isDead = true;
        return;
      }
    }

    if (this.isObstacle(head.x, head.y)) {
      if (player.firewallTicks > 0) {
        player.firewallTicks = 0;
      } else {
        player.isDead = true;
        return;
      }
    }

    let hitCable = false;
    this.players.forEach((other) => {
      other.segments.forEach((seg, sIdx) => {
        if (seg.x === head.x && seg.y === head.y) {
          if (other.socketId === player.socketId && sIdx === 0) return;
          hitCable = true;
        }
      });
    });

    if (hitCable) {
      if (player.firewallTicks > 0) {
        player.firewallTicks = 0;
      } else {
        player.isDead = true;
        return;
      }
    }

    player.segments.unshift(head);

    let ate = false;

    const itemIdx = this.items.findIndex((item) => {
      let dx = head.x - item.x;
      let dy = head.y - item.y;
      if (dx >  this.width  / 2) dx -= this.width;
      if (dx < -this.width  / 2) dx += this.width;
      if (dy >  this.height / 2) dy -= this.height;
      if (dy < -this.height / 2) dy += this.height;
      return Math.abs(dx) < 0.55 && Math.abs(dy) < 0.55;
    });

    if (itemIdx !== -1) {
      const item = this.items.splice(itemIdx, 1)[0];
      ate = true;
      let scoreAdd     = 10;
      let growSegments = 1;
      if      (item.type === 'energia') { scoreAdd = 25;  growSegments = 2; }
      else if (item.type === 'nodo')    { scoreAdd = 50;  growSegments = 3; }
      else if (item.type === 'bonus')   { scoreAdd = 100; growSegments = 1; }
      player.score += scoreAdd;
      for (let i = 1; i < growSegments; i++) {
        player.segments.push({ ...player.segments[player.segments.length - 1] });
      }
      this.spawnItem();
    }

    const puIdx = this.powerups.findIndex((pu) => pu.x === head.x && pu.y === head.y);
    if (puIdx !== -1) {
      const pu = this.powerups.splice(puIdx, 1)[0];
      ate = true;
      if (pu.type === 'overclock') player.overclockTicks = 50;
      else if (pu.type === 'firewall') player.firewallTicks = 80;
      else if (pu.type === 'emp') {
        player.magnetTicks = 80;
        this.players.forEach((other) => {
          if (other.socketId !== player.socketId) other.empTicks = 20;
        });
      }
      this.schedulePowerupRespawn();
    }

    if (!ate) player.segments.pop();
  }

  checkGameOver() {
    const alive = this.players.filter((p) => !p.isDead);
    if (alive.length === 0) {
      this.state = 'game_over';
      const p1 = this.players[0];
      const p2 = this.players[1];
      if (p1 && p2) {
        if      (p1.score > p2.score) this.winner = p1.socketId;
        else if (p2.score > p1.score) this.winner = p2.socketId;
        else                          this.winner = 'draw';
      } else if (p1) {
        this.winner = 'none';
      }
    } else if (alive.length === 1 && this.players.length > 1) {
      this.state  = 'game_over';
      this.winner = alive[0].socketId;
    } else if (this.players.length === 1 && alive.length === 0) {
      this.state  = 'game_over';
      this.winner = 'none';
    }
  }

  getSerializedState() {
    return {
      width:     this.width,
      height:    this.height,
      state:     this.state,
      duration:  this.duration,
      level:     this.level,
      winner:    this.winner,
      items:     this.items.map(i => ({ x: i.x, y: i.y, type: i.type, expiresAt: i.expiresAt || null })),
      powerups:  this.powerups,
      obstacles: this.obstacles,
      players:   this.players.map((p) => ({
        socketId:    p.socketId,
        name:        p.name,
        character:   p.character,
        playerIndex: p.playerIndex,
        segments:    p.segments,
        dir:         p.dir,
        score:       p.score,
        isDead:      p.isDead,
        overclock:   p.overclockTicks > 0,
        firewall:    p.firewallTicks  > 0,
        emp:         p.empTicks       > 0,
        magnet:      p.magnetTicks    > 0
      }))
    };
  }
}
