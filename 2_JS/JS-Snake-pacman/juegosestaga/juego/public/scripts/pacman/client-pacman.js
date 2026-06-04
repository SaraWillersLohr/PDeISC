// Controlador del Cliente de Escape Escolar (Pac-Man) - Soporta Local (1P/2P) y Online (Sockets)
document.addEventListener('DOMContentLoaded', () => {
  initClient();
});

let canvas, ctx;
let socketConn = null;
let gameConfig = null;
let localGameInstance = null;
let localIntervalId = null;
let lastState = null;
let rafId = null;
let gamePaused = false;
let _rafLastTime = 0;
let _rafAccumulator = 0;
const TICK_MS = 1000 / 60;
let touchStartX = 0;
let touchStartY = 0;

// Objeto especial por nivel — ver pacman-config.js (LEVEL_ITEM_QUEUE)
const PACMAN_HIGH_SCORE_KEY = 'msgames_pacman_highscore';

function getPacmanHighScore() {
  return parseInt(localStorage.getItem(PACMAN_HIGH_SCORE_KEY) || '0', 10) || 0;
}

function savePacmanHighScore(score) {
  const prev = getPacmanHighScore();
  if (score > prev) {
    localStorage.setItem(PACMAN_HIGH_SCORE_KEY, String(score));
    return score;
  }
  return prev;
}

function updatePacmanHud(state) {
  const levelEl = document.getElementById('hudLevel');
  const scoreEl = document.getElementById('hudScore');
  const livesEl = document.getElementById('hudLives');
  if (levelEl) levelEl.textContent = state.level;
  if (scoreEl) scoreEl.textContent = state.score;
  if (livesEl) {
    if (state.players && state.players.length > 1) {
      let text = '';
      state.players.forEach((p, idx) => {
        if (idx > 0) text += ' ｜ ';
        text += `${p.character || p.name}: ` + '❤️'.repeat(Math.max(0, p.lives));
      });
      livesEl.textContent = text;
    } else if (state.players && state.players.length === 1) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, state.players[0].lives));
    } else {
      livesEl.textContent = '❤️'.repeat(Math.max(0, state.lives));
    }
  }

  const hsEl = document.getElementById('hudHighScore');
  if (hsEl) hsEl.textContent = Math.max(getPacmanHighScore(), state.score);

  const bonus = state.specialItemRequired || (state.fruit && state.fruit.type) || '—';
  const bonusLabel = bonus === 'Computadora' ? 'Compu' : bonus;
  const bonusEl = document.getElementById('hudBonus');
  if (bonusEl) bonusEl.textContent = bonusLabel;

  const objective = state.missionObjective || state.specialItemRequired || 'Recoger puntos';
  const objText = objective === 'Guardapolvo' ? 'Recuperar el Guardapolvo'
    : objective === 'Cuaderno' ? 'Recuperar el Cuaderno'
    : objective === 'Computadora' ? 'Recuperar la Compu'
    : objective;
  const hudObj = document.getElementById('hudObjective');
  const missionTarget = document.getElementById('missionTarget');
  if (hudObj) hudObj.textContent = objText;
  if (missionTarget) missionTarget.textContent = `🎯 ${objText}`;

  const p0 = state.players && state.players[0];
  const charEl = document.getElementById('hudCharacter');
  if (charEl && p0) charEl.textContent = p0.character;

  const stateEl = document.getElementById('hudGameState');
  if (stateEl) {
    let label = 'EN JUEGO';
    stateEl.classList.remove('pacman-hud__state--danger');
    if (state.state === 'level_clear') label = 'NIVEL OK';
    else if (state.state === 'game_over') { label = 'GAME OVER'; stateEl.classList.add('pacman-hud__state--danger'); }
    else if (state.state === 'victory') label = 'VICTORIA';
    else if (state.frightened) label = 'HORA LIBRE';
    else if (state.scatterPhase) label = 'DISPERSIÓN';
    stateEl.textContent = label;
  }

  const statusText = state.levelMessage || '';
  ['levelStatus', 'levelStatusMobile'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = statusText;
      el.style.display = statusText ? 'block' : 'none';
    }
  });
}

function _setConnectionBanner(connected) {
  let el = document.getElementById('connectionBanner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'connectionBanner';
    el.className = 'connection-banner';
    document.body.appendChild(el);
  }
  el.textContent = connected ? '🟢 Conectado' : '🔴 Desconectado';
  el.classList.toggle('connection-banner--ok', connected);
  el.classList.toggle('connection-banner--err', !connected);
}

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
  const hsEl = document.getElementById('hudHighScore');
  if (hsEl) hsEl.textContent = getPacmanHighScore();

  if (gameConfig.mode === '2P' && gameConfig.multiplayer === 'local') {
    const p2Row = document.getElementById('p2ControlRow');
    if (p2Row) p2Row.style.display = 'flex';
  }

  setupKeyboardInput();
  setupTouchInput();

  if (gameConfig.multiplayer === 'online') {
    socketConn = io({ reconnection: true, reconnectionAttempts: 20, reconnectionDelay: 1000 });
    socketConn.emit('rejoinGame', {
      code: gameConfig.roomCode,
      name: gameConfig.players[gameConfig.myIndex].name
    });
    socketConn.on('gameState', (state) => {
      handleStateUpdate(state);
    });
    socketConn.on('connect', () => _setConnectionBanner(true));
    socketConn.on('disconnect', () => _setConnectionBanner(false));
    socketConn.on('gameOver', ({ gameState }) => {
      handleStateUpdate(gameState);
    });
    document.getElementById('btnOverlayAction').textContent = 'Volver al Lobby';
    document.getElementById('btnOverlayAction').onclick = () => {
      window.location.href = '/lobby';
    };
  } else {
    setupLocalGame();
  }
}

function resizeCanvas() {
  if (!canvas) return;
  let mapData = null;
  if (localGameInstance) mapData = localGameInstance.map;
  else if (lastState) mapData = lastState.map;
  const rows = mapData ? mapData.length : 15;
  const cols = mapData ? mapData[0].length : 15;
  const aspect = cols / rows;
  const { w, h } = computeFullscreenCanvasSize(aspect, 'pacman');
  applyCanvasPixelSize(canvas, w, h);
  if (lastState) drawPacmanGame(canvas, ctx, lastState);
}

function setupLocalGame() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  gamePaused = false;
  _rafLastTime = 0;
  _rafAccumulator = 0;
  document.getElementById('pauseBadge').style.display = 'none';
  document.getElementById('btnPause').textContent = '⏸ Pausa';

  const playersList = [
    { socketId: 'local_p1', name: gameConfig.p1Name, character: gameConfig.p1Character, playerIndex: 0 }
  ];

  if (gameConfig.mode === '2P') {
    const p2Char = gameConfig.p1Character === 'Sara' ? 'Male' : 'Sara';
    playersList.push({ socketId: 'local_p2', name: 'Jugador 2', character: p2Char, playerIndex: 1 });
  }

  localGameInstance = new LocalPacmanEngine(playersList);
  resizeCanvas();
  window.audioSynth && window.audioSynth.startBGM('normal');

  let lastLevel = 1;
  let lastGameState = 'playing';
  let _coinCooldown = 0;

  function gameLoop(timestamp) {
    if (!localGameInstance) return;
    if (_rafLastTime === 0) _rafLastTime = timestamp;
    const dt = Math.min(timestamp - _rafLastTime, 80);
    _rafLastTime = timestamp;

    if (!gamePaused) {
      _rafAccumulator += dt;
      while (_rafAccumulator >= TICK_MS) {
        localGameInstance.tick();
        _rafAccumulator -= TICK_MS;
      }
    }

    const state = localGameInstance.getSerializedState();

    if (state.level !== lastLevel) {
      const prevLevel = lastLevel;
      lastLevel = state.level;
      if (prevLevel > 0 && state.level > prevLevel) {
        showLevelUpToast(state.level, false);
      }
      if (state.level >= 3) {
        window.audioSynth && window.audioSynth.playDangerAlert();
        window.audioSynth && window.audioSynth.switchBGM('danger');
      } else {
        window.audioSynth && window.audioSynth.playLevelUp();
      }
      resizeCanvas();
    }

    if (lastState && !gamePaused) {
      if (_coinCooldown > 0) _coinCooldown -= dt;
      if (state.score > lastState.score && _coinCooldown <= 0) {
        window.audioSynth && window.audioSynth.playCoin();
        _coinCooldown = 85;
      }
      if (!lastState.frightened && state.frightened) {
        window.audioSynth && window.audioSynth.playPowerup();
      }
      const lastSum = (lastState.players || []).reduce((sum, p) => sum + (p.lives || 0), 0);
      const currentSum = (state.players || []).reduce((sum, p) => sum + (p.lives || 0), 0);
      if (currentSum < lastSum && currentSum > 0) {
        window.audioSynth && window.audioSynth.playCrash();
      }
    }

    lastState = state;
    // Mostrar mensaje de estado del nivel (mobile dock)
    updatePacmanHud(state);

    drawPacmanGame(canvas, ctx, state);

    if (state.state !== lastGameState) {
      lastGameState = state.state;
      if (state.state === 'level_clear') {
        // Do not show toast here as it creates duplicate banners
      }
      if (state.state === 'game_over') {
        window.audioSynth && window.audioSynth.stopBGM();
        window.audioSynth && window.audioSynth.playGameOver();
        _showOverlay('GAME OVER', '¡Los directivos te atraparon!', state.score, 'text-danger');
        saveLocalScore(state);
        return;
      }
      if (state.state === 'victory') {
        window.audioSynth && window.audioSynth.stopBGM();
        window.audioSynth && window.audioSynth.playVictory();
        const lead = state.players[0];
        const msg = lead.character === 'Sara' ? '🏆 ¡Sara completó todas las materias!' : '🏆 ¡Male escapó de la escuela!';
        _showOverlay('¡VICTORIA!', msg, state.score, 'text-success');
        saveLocalScore(state);
        savePacmanHighScore(state.score);
        return;
      }
      if (state.state === 'level_clear') {
        window.audioSynth && window.audioSynth.playLevelUp();
      }
    }

    rafId = requestAnimationFrame(gameLoop);
  }

  rafId = requestAnimationFrame(gameLoop);

  const actionBtn = document.getElementById('btnOverlayAction');
  actionBtn.textContent = 'Volver a Jugar';
  actionBtn.onclick = () => {
    document.getElementById('gameOverlay').classList.remove('active');
    setupLocalGame();
  };
}

function _showOverlay(title, msg, score, titleClass) {
  const overlay = document.getElementById('gameOverlay');
  const titleEl = document.getElementById('overlayTitle');
  const msgEl = document.getElementById('overlayMessage');
  const scoreSec = document.getElementById('overlayScoreSection');
  const finalScore = document.getElementById('overlayFinalScore');

  titleEl.textContent = title;
  titleEl.className = `display-5 animate-pulse ${titleClass}`;
  msgEl.textContent = msg;
  scoreSec.style.display = 'block';
  finalScore.textContent = score;
  overlay.classList.add('active');
}

function togglePause() {
  if (!localGameInstance) return;
  const state = localGameInstance.getSerializedState();
  if (state.state !== 'playing' && state.state !== 'level_clear') return;

  gamePaused = !gamePaused;
  const badge = document.getElementById('pauseBadge');
  const btn = document.getElementById('btnPause');

  if (gamePaused) {
    badge.style.display = 'flex';
    btn.textContent = '▶ Reanudar';
    window.audioSynth && window.audioSynth.stopBGM();
    window.audioSynth && window.audioSynth.playSelect();
  } else {
    badge.style.display = 'none';
    btn.textContent = '⏸ Pausa';
    _rafLastTime = 0;
    const level = localGameInstance ? localGameInstance.level : 1;
    window.audioSynth && window.audioSynth.startBGM(level >= 3 ? 'danger' : 'normal');
  }
}

function restartGame() {
  if (localGameInstance) {
    localGameInstance.loadLevel(localGameInstance.level, true);
    gamePaused = false;
    document.getElementById('pauseBadge').style.display = 'none';
    document.getElementById('btnPause').textContent = '⏸ Pausa';
  }
}

function saveLocalScore(state) {
  fetch('/api/leaderboard/pacman', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: state.players[0].name,
      score: state.score,
      character: state.players[0].character,
      duration: 0,
      victories: state.state === 'victory' ? 1 : 0
    })
  }).catch(err => console.error('Error al guardar puntaje local:', err));
}

function handleStateUpdate(state) {
  const isFirstState = !lastState;

  if (lastState) {
    if (state.level > lastState.level) {
      showLevelUpToast(state.level, false);
      resizeCanvas();
    }
    if (state.state === 'level_clear' && lastState.state !== 'level_clear') {
      // Do not show toast here as it creates duplicate banners
    }
    if (state.score > lastState.score) {
      window.audioSynth && window.audioSynth.playCoin();
    }
    if (!lastState.frightened && state.frightened) {
      window.audioSynth && window.audioSynth.playPowerup();
    }
    const lastSum = (lastState.players || []).reduce((sum, p) => sum + (p.lives || 0), 0);
    const currentSum = (state.players || []).reduce((sum, p) => sum + (p.lives || 0), 0);
    if (currentSum < lastSum && currentSum > 0) {
      window.audioSynth && window.audioSynth.playCrash();
    }
  }

  const prevState = lastState;
  lastState = state;
  updatePacmanHud(state);
  if (isFirstState) {
    resizeCanvas();
  } else if (prevState && state.map && prevState.map && state.map.length !== prevState.map.length) {
    resizeCanvas();
  }

  drawPacmanGame(canvas, ctx, state);

  if (state.state === 'game_over') {
    _showOverlay('GAME OVER', '¡Los directivos te atraparon!', state.score, 'text-danger');
    window.audioSynth && window.audioSynth.playGameOver();
  } else if (state.state === 'victory') {
    const lp = state.players[0];
    const msg = lp.character === 'Sara' ? '🏆 ¡Sara completó todas las materias!' : '🏆 ¡Male escapó de la escuela!';
    _showOverlay('¡VICTORIA!', msg, state.score, 'text-success');
    window.audioSynth && window.audioSynth.playVictory();
  }
}

function setupKeyboardInput() {
  window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (e.key === 'Escape') { e.preventDefault(); togglePause(); return; }
    if (key === 'P') { e.preventDefault(); togglePause(); return; }
    let p1Dir = null;
    if (key === 'W') p1Dir = 'UP';
    else if (key === 'S') p1Dir = 'DOWN';
    else if (key === 'A') p1Dir = 'LEFT';
    else if (key === 'D') p1Dir = 'RIGHT';
    if (p1Dir) { e.preventDefault(); sendMove(0, p1Dir); }

    let arrowDir = null;
    if (key === 'ARROWUP') arrowDir = 'UP';
    else if (key === 'ARROWDOWN') arrowDir = 'DOWN';
    else if (key === 'ARROWLEFT') arrowDir = 'LEFT';
    else if (key === 'ARROWRIGHT') arrowDir = 'RIGHT';
    if (arrowDir) {
      e.preventDefault();
      const idx = (gameConfig && gameConfig.mode === '2P') ? 1 : 0;
      sendMove(idx, arrowDir);
    }
  });
}

function sendMove(playerIdx, direction) {
  if (gameConfig.multiplayer === 'online') {
    if (playerIdx === gameConfig.myIndex) {
      socketConn.emit('playerMove', direction);
    }
  } else {
    if (localGameInstance) {
      const socketId = playerIdx === 0 ? 'local_p1' : 'local_p2';
      localGameInstance.handleInput(socketId, direction);
    }
  }
}

function setupTouchInput() {
  const btnUp = document.getElementById('tBtnUp');
  const btnDown = document.getElementById('tBtnDown');
  const btnLeft = document.getElementById('tBtnLeft');
  const btnRight = document.getElementById('tBtnRight');

  const handleTouch = (dir) => {
    const idx = gameConfig.multiplayer === 'online' ? gameConfig.myIndex : 0;
    sendMove(idx, dir);
  };

  const addButtonEvents = (btn, dir) => {
    const press = () => btn.classList.add('d-btn--pressed');
    const release = () => btn.classList.remove('d-btn--pressed');

    btn.addEventListener('touchstart', (e) => { e.preventDefault(); handleTouch(dir); press(); });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); release(); });
    btn.addEventListener('touchcancel', () => release());
    btn.addEventListener('mousedown', (e) => { e.preventDefault(); handleTouch(dir); press(); });
    btn.addEventListener('mouseup', (e) => { e.preventDefault(); release(); });
    btn.addEventListener('mouseleave', () => release());
  };

  addButtonEvents(btnUp, 'UP');
  addButtonEvents(btnDown, 'DOWN');
  addButtonEvents(btnLeft, 'LEFT');
  addButtonEvents(btnRight, 'RIGHT');

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 40) {
        handleTouch(diffX > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(diffY) > 40) {
        handleTouch(diffY > 0 ? 'DOWN' : 'UP');
      }
    }
  }, { passive: true });
}

class LocalPacmanEngine {
  constructor(playersList) {
    this.playersList = playersList;
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.state = 'playing';
    this.frightenedTimer = 0;
    this.frightenedCount = 0;
    this.fruit = null;
    this.fruitTimer = 0;
    this.itemQueue = [];
    this.itemQueueIndex = 0;
    this.scatterPhase = false;
    this.scatterTimer = 420;
    this.tickCount = 0;
    this.loadLevel(this.level, true);
  }

  loadLevel(levelNum, resetGame = false) {
    this.level = levelNum;
    if (resetGame) {
      this.score = 0;
    }
    this.lives = 3; // Regenerar 3 vidas al inicio de cada nivel
    this.state = 'playing';
    this.itemQueue = [...(LEVEL_ITEM_QUEUE[levelNum] || LEVEL_ITEM_QUEUE[1])];
    this.itemQueueIndex = 0;
    const rawMap = MAPS[levelNum] || MAPS[1];
    this.map = rawMap.map(row => [...row]);
    this.rows = this.map.length;
    this.cols = this.map[0].length;

    const spawnPoints = [];
    const ghostSpawnPoints = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.map[r][c] === 7) ghostSpawnPoints.push({ x: c, y: r });
        else if (this.map[r][c] === 2 || this.map[r][c] === 0) spawnPoints.push({ x: c, y: r });
      }
    }
    const ghostSpawns = ghostSpawnPoints.length > 0 ? ghostSpawnPoints : [{ x: Math.floor(this.cols/2), y: Math.floor(this.rows/2) }];
    const playerSpawns = spawnPoints.filter(p => Math.abs(p.x - this.cols/2) > 2);

    this.players = this.playersList.map((p, idx) => {
      const spawn = playerSpawns[idx % playerSpawns.length] || { x:1, y:1 };
      return {
        socketId: p.socketId, name: p.name, character: p.character, playerIndex: p.playerIndex,
        x: spawn.x, y: spawn.y, targetX: spawn.x, targetY: spawn.y,
        spawnX: spawn.x, spawnY: spawn.y,
        dir: 'NONE', nextDir: 'NONE', lastHorizontalDir: 'RIGHT',
        speed: 0.06 + (levelNum * 0.005),
        isDead: false, respawnTimer: 0, hasGuardapolvo: false, celebrateTimer: 0,
        lives: 3 // Cada personaje tiene 3 vidas por nivel
      };
    });

    const ghostNames = ['Esteban', 'Lorena', 'Scaglione'];
    const isHardMode = levelNum >= 3;
    let ghostBaseSpeed;
    if (levelNum === 1) {
      ghostBaseSpeed = 0.032;
    } else if (levelNum === 2) {
      ghostBaseSpeed = 0.045;
    } else {
      ghostBaseSpeed = 0.040 + (levelNum * 0.005);
    }
    this.ghosts = ghostNames.map((name, idx) => {
      const spawn = ghostSpawns[idx % ghostSpawns.length] || ghostSpawns[0];
      const profile = typeof GHOST_PROFILES !== 'undefined' ? GHOST_PROFILES[name] : null;
      return {
        name, x: spawn.x, y: spawn.y, targetX: spawn.x, targetY: spawn.y, dir: 'NONE',
        speed: ghostBaseSpeed + (idx * 0.004),
        mode: 'chase', aiState: 'CHASE', behavior: profile?.behavior || 'HUNTER',
        spawnX: spawn.x, spawnY: spawn.y, respawnTimer: 0, isDead: false,
        patrolWaypoints: null, patrolIndex: 0,
        baseRespawn: isHardMode ? 80 : 300
      };
    });

    this.scatterPhase = false;
    this.scatterTimer = Math.max(240, 480 - levelNum * 30);

    this.frightenedTimer =0;
    this.frightenedCount =0;
    this.spawnNextSpecialItem();
    this.fruitTimer = Math.floor(Math.random()*800)+400;
  }

  spawnNextSpecialItem() {
    if (this.itemQueueIndex >= this.itemQueue.length) {
      this.fruit = null;
      return;
    }
    const type = this.itemQueue[this.itemQueueIndex];
    const walkables = [];
    for (let r =0; r < this.rows; r++) {
      for (let c=0; c < this.cols; c++) {
        if (this.map[r][c] === 0 || this.map[r][c] === 2) walkables.push({ x:c, y:r });
      }
    }
    if (walkables.length>0) {
      const pos = walkables[Math.floor(Math.random()*walkables.length)];
      this.fruit = { type, x: pos.x, y: pos.y, duration: Infinity, isSequential: true };
    }
  }

    _collectSpecialItem(p, fruitType) {
        if (fruitType === 'Guardapolvo') {
            p.hasGuardapolvo = true;
            p.celebrateTimer = 180;
        }
        let pts = 100;
        if (fruitType === 'Computadora') pts = 500;
        else if (fruitType === 'Cuaderno') pts = 250;
        this.score += pts;
        p.score = (p.score || 0) + pts;
        this.fruit = null;
        this.itemQueueIndex++;
        this.spawnNextSpecialItem();
    }

  handleInput(socketId, dir) {
    const player = this.players.find(p => p.socketId === socketId);
    if (player && !player.isDead && this.state === 'playing') {
      player.nextDir = dir;
    }
  }

  isWall(x, y) {
    const r = Math.round(y);
    const c = Math.round(x);
    if (r <0 || r >= this.rows || c <0 || c >= this.cols) return true;
    return this.map[r][c] ===1;
  }

  getNeighborCoords(x, y, dir) {
    let nx=x, ny=y;
    if (dir === 'UP') ny--;
    else if (dir === 'DOWN') ny++;
    else if (dir === 'LEFT') nx--;
    else if (dir === 'RIGHT') nx++;
    return { x:nx, y:ny };
  }

  updateEntityPosition(entity, isGhost=false) {
    if (entity.isDead || entity.respawnTimer >0) {
      if (entity.respawnTimer>0) {
        entity.respawnTimer--;
        if (entity.respawnTimer ===0) {
          entity.x = entity.spawnX ||1;
          entity.y = entity.spawnY ||1;
          entity.targetX = entity.x;
          entity.targetY = entity.y;
          entity.isDead = false;
          if (!isGhost) {
            entity.dir = 'NONE';
            entity.nextDir = 'NONE';
          }
          if (isGhost) entity.mode = 'chase';
        }
      }
      return;
    }
    const dist = entity.speed;
    const dx = entity.targetX - entity.x;
    const dy = entity.targetY - entity.y;
    if (Math.abs(dx) <= dist && Math.abs(dy) <= dist) {
      entity.x = entity.targetX;
      entity.y = entity.targetY;
      if (!isGhost) {
        if (entity.nextDir !== 'NONE') {
          const check = this.getNeighborCoords(entity.x, entity.y, entity.nextDir);
          if (!this.isWall(check.x, check.y)) entity.dir = entity.nextDir;
        }
        const next = this.getNeighborCoords(entity.x, entity.y, entity.dir);
        if (!this.isWall(next.x, next.y) && entity.dir !== 'NONE') {
          entity.targetX = next.x;
          entity.targetY = next.y;
        } else {
          entity.dir = 'NONE';
        }
      } else {
        this.updateGhostAI(entity);
      }
    } else {
      if (dx!==0) entity.x += Math.sign(dx)*dist;
      if (dy!==0) entity.y += Math.sign(dy)*dist;
    }
  }

  updateGhostAI(ghost) {
    if (ghost.mode === 'returning') {
      const validMoves = [];
      ['UP','DOWN','LEFT','RIGHT'].forEach(d => {
        const coords = this.getNeighborCoords(ghost.x, ghost.y, d);
        if (!this.isWall(coords.x, coords.y)) validMoves.push({ dir:d, x:coords.x, y:coords.y });
      });
      let best = null, minDist = Infinity;
      validMoves.forEach(move => {
        const dist = Math.pow(move.x - ghost.spawnX, 2) + Math.pow(move.y - ghost.spawnY, 2);
        if (dist < minDist) { minDist = dist; best = move; }
      });
      if (best) {
        ghost.dir = best.dir;
        ghost.targetX = best.x;
        ghost.targetY = best.y;
      }
      if (Math.abs(ghost.x - ghost.spawnX) < 0.35 && Math.abs(ghost.y - ghost.spawnY) < 0.35) {
        ghost.respawnTimer = 90;
        ghost.isDead = true;
        ghost.mode = 'eaten';
      }
      return;
    }
    const directions = ['UP','DOWN','LEFT','RIGHT'];
    const validMoves = [];
    const isHardMode = this.level >=3;
    let oppositeDir = 'NONE';
    if (ghost.dir === 'UP') oppositeDir = 'DOWN';
    else if (ghost.dir === 'DOWN') oppositeDir = 'UP';
    else if (ghost.dir === 'LEFT') oppositeDir = 'RIGHT';
    else if (ghost.dir === 'RIGHT') oppositeDir = 'LEFT';

    directions.forEach(d => {
      if (d === oppositeDir) return;
      const coords = this.getNeighborCoords(ghost.x, ghost.y, d);
      if (!this.isWall(coords.x, coords.y)) validMoves.push({ dir:d, x:coords.x, y:coords.y });
    });
    if (validMoves.length ===0 && oppositeDir !== 'NONE') {
      const coords = this.getNeighborCoords(ghost.x, ghost.y, oppositeDir);
      if (!this.isWall(coords.x, coords.y)) validMoves.push({ dir:oppositeDir, x:coords.x, y:coords.y });
    }
    if (validMoves.length ===0) return;
    let chosenMove = null;
    if (ghost.mode === 'frightened') {
      if (isHardMode && Math.random() < 0.35) {
        /* ocasional persecución en modo difícil */
      } else {
        chosenMove = validMoves[Math.floor(Math.random()*validMoves.length)];
      }
    }
    if (!chosenMove && window.GhostAI) {
      const activePlayers = this.players.filter(p => !p.isDead);
      const targetPlayer = activePlayers[0] || this.players[0];
      chosenMove = window.GhostAI.updateGhostBehavior(ghost, {
        validMoves,
        targetPlayer,
        cols: this.cols,
        rows: this.rows,
        scatterPhase: this.scatterPhase && this.frightenedTimer <= 0,
        tickCount: this.tickCount,
        getNeighborCoords: (x, y, d) => this.getNeighborCoords(x, y, d),
        isWall: (x, y) => this.isWall(x, y)
      });
    }
    if (chosenMove) {
      ghost.dir = chosenMove.dir;
      ghost.targetX = chosenMove.x;
      ghost.targetY = chosenMove.y;
    }
  }

  tick() {
    if (this.state !== 'playing') return;
    this.tickCount++;
    if (this.frightenedTimer <= 0) {
      this.scatterTimer--;
      if (this.scatterTimer <= 0) {
        this.scatterPhase = !this.scatterPhase;
        this.scatterTimer = this.scatterPhase ? 180 : Math.max(300, 420 - this.level * 25);
      }
    }
    this.players.forEach(p => {
      if (p.celebrateTimer > 0) {
        p.celebrateTimer--;
      }
    });
    this.players.forEach(p => this.updateEntityPosition(p, false));
    this.ghosts.forEach(g => this.updateEntityPosition(g, true));

    this.players.forEach(p => {
      if (p.isDead) return;
      if (p.dir === 'LEFT') p.lastHorizontalDir = 'LEFT';
      if (p.dir === 'RIGHT') p.lastHorizontalDir = 'RIGHT';
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      if (px >=0 && px < this.cols && py >=0 && py < this.rows) {
        const cell = this.map[py][px];
        if (cell ===2) {
          this.map[py][px] = 0;
          this.score +=10;
          p.score = (p.score || 0) +10;
        } else if (cell ===3) {
          this.map[py][px] =0;
          this.score +=50;
          p.score = (p.score ||0)+50;
          this.activateHoraLibre();
        }
      }
      if (this.fruit && Math.round(p.x) === this.fruit.x && Math.round(p.y) === this.fruit.y) {
        if (this.fruit.isSequential) {
          this._collectSpecialItem(p, this.fruit.type);
        } else {
          if (this.fruit.type === 'Guardapolvo') {
            p.hasGuardapolvo = true;
            p.celebrateTimer = 180;
          }
          let pts = 100;
          if (this.fruit.type === 'Computadora') pts =500;
          else if (this.fruit.type === 'Cuaderno') pts=250;
          this.score += pts;
          p.score = (p.score || 0) + pts;
          this.fruit = null;
        }
      }
    });

    if (this.frightenedTimer>0) {
      this.frightenedTimer--;
      if (this.frightenedTimer ===0) this.ghosts.forEach(g => { if (g.mode === 'frightened') g.mode = 'chase'; });
    }

    // Random non-sequential fruits are disabled

    this.checkCollisions();
    this.checkLevelCompletion();
  }

  activateHoraLibre() {
    this.frightenedTimer = this.level >=3 ? 120 : 600;
    this.frightenedCount=0;
    this.ghosts.forEach(g => {
      if (g.mode !== 'eaten' && g.mode !== 'dead') {
        g.mode = 'frightened';
        let oppositeDir = 'NONE';
        if (g.dir === 'UP') oppositeDir = 'DOWN';
        else if (g.dir === 'DOWN') oppositeDir = 'UP';
        else if (g.dir === 'LEFT') oppositeDir = 'RIGHT';
        else if (g.dir === 'RIGHT') oppositeDir = 'LEFT';
        const coords = this.getNeighborCoords(g.x, g.y, oppositeDir);
        if (!this.isWall(coords.x, coords.y)) {
          g.dir = oppositeDir;
          g.targetX = coords.x;
          g.targetY = coords.y;
        }
      }
    });
  }

  checkCollisions() {
    this.players.forEach(p => {
      if (p.isDead) return;
      this.ghosts.forEach(g => {
        if (g.isDead || g.respawnTimer>0) return;
        const dist = Math.sqrt(Math.pow(p.x - g.x,2) + Math.pow(p.y - g.y,2));
        if (dist <0.6) {
          if (g.mode === 'frightened') {
            g.mode = 'returning';
            g.isDead = false;
            g.respawnTimer = 0;
            this.frightenedCount = Math.min(this.frightenedCount+1,4);
            const pts = 100*Math.pow(2, this.frightenedCount);
            this.score += pts;
            p.score = (p.score ||0) + pts;
          } else {
            p.isDead = true;
            p.respawnTimer =180;
            p.hasGuardapolvo = false;
            this.itemQueueIndex = 0;
            this.fruit = null;
            this.spawnNextSpecialItem();
            
            p.lives--;
            if (p.lives <= 0) {
              p.respawnTimer = 0; // Evitar respawn si no le quedan vidas
            }
            
            // Fin de juego si TODOS los jugadores se quedaron sin vidas
            const allDead = this.players.every(pl => pl.lives <= 0);
            if (allDead) {
              this.state = 'game_over';
            }
          }
        }
      });
    });
  }

  countRemainingPoints() {
    let count =0;
    for (let r=0; r < this.rows; r++) {
      for (let c=0; c < this.cols; c++) {
        if (this.map[r][c] ===2 || this.map[r][c] ===3) count++;
      }
    }
    return count;
  }

  checkLevelCompletion() {
    const remainingPoints = this.countRemainingPoints();
    if (remainingPoints === 0 && this.itemQueueIndex >= this.itemQueue.length) {
      if (this.level < MAX_PACMAN_LEVEL) {
        this.state = 'level_clear';
        setTimeout(() => {
          if (this.state === 'level_clear') this.loadLevel(this.level+1, false);
        }, 3000);
      } else {
        this.state = 'victory';
      }
    }
  }

  _getMissionText() {
    const bonus = this.itemQueue[this.itemQueueIndex];
    if (bonus === 'Guardapolvo') return 'Recuperar el Guardapolvo';
    if (bonus === 'Cuaderno') return 'Recuperar el Cuaderno';
    if (bonus === 'Computadora') return 'Recuperar la Compu';
    if (this.countRemainingPoints() > 0) return 'Recoger todos los puntos del mapa';
    return 'Escapar del nivel';
  }

  getSerializedState() {
    const remainingPoints = this.countRemainingPoints();
    const nextBonus = this.itemQueue[this.itemQueueIndex] || null;
    let levelMessage = '';
    if (this.state === 'level_clear') levelMessage = '¡Nivel completado! Preparate para el siguiente...';
    else if (remainingPoints > 0 && nextBonus) {
      const isPlural = this.level >= 2;
      levelMessage = `Recoge los puntos y busca ${isPlural ? 'los elementos' : 'el elemento'} · Bonus: ${nextBonus}`;
    }
    else if (remainingPoints > 0) levelMessage = 'Recoge todos los puntos del mapa';
    else levelMessage = '¡Busca el bonus especial para avanzar!';

    const displayLives = this.players.length === 1 ? this.players[0].lives : Math.max(0, ...this.players.map(p => p.lives));

    return {
      level: this.level, score: this.score, lives: displayLives, state: this.state,
      map: this.map, fruit: this.fruit,
      frightened: this.frightenedTimer>0, frightenedTimer: this.frightenedTimer,
      specialItemRequired: nextBonus,
      remainingPoints: remainingPoints,
      levelMessage: levelMessage,
      missionObjective: this._getMissionText(),
      scatterPhase: this.scatterPhase,
      players: this.players.map(p => ({
        name: p.name, character: p.character, playerIndex: p.playerIndex,
        x: p.x, y: p.y, dir: p.dir, lastHorizontalDir: p.lastHorizontalDir,
        score: p.score ||0, isDead: p.isDead, hasGuardapolvo: p.hasGuardapolvo,
        lives: p.lives
      })),
      ghosts: this.ghosts.map(g => ({
        name: g.name, x:g.x, y:g.y, dir:g.dir, mode:g.mode,
        aiState: g.aiState, behavior: g.behavior, isDead: g.isDead || false
      }))
    };
  }
}

const MAPS = {
  1: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,2,1,2,2,2,2,2,3,1],
    [1,2,1,1,2,1,2,1,2,1,2,1,1,2,1],
    [1,2,1,1,2,1,2,2,2,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,7,2,2,2,2,2,2,1],
    [1,1,1,2,1,1,7,7,7,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,7,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,2,2,1,2,1,1,2,1],
    [1,2,1,1,2,1,2,1,2,1,2,1,1,2,1],
    [1,3,2,2,2,2,2,1,2,2,2,2,2,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  2: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,1,1,1,1,1,2,2,2,2,3,1],
    [1,2,1,1,1,2,2,2,1,2,2,2,1,1,1,2,1],
    [1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,1],
    [1,1,1,2,1,2,1,1,7,1,1,2,1,2,1,1,1],
    [1,1,1,2,2,2,1,7,7,7,1,2,2,2,1,1,1],
    [1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,1],
    [1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1],
    [1,2,1,1,1,2,2,2,1,2,2,2,1,1,1,2,1],
    [1,3,2,2,2,2,1,1,1,1,1,2,2,2,2,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  3: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1],
    [1,1,1,1,2,1,7,7,7,7,7,7,7,1,2,1,1,1,1],
    [1,1,1,1,2,1,7,1,1,7,1,1,7,1,2,1,1,1,1],
    [1,1,1,1,2,1,7,7,7,7,7,7,7,1,2,1,1,1,1],
    [1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  4: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,3,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,7,7,7,7,7,7,7,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,7,1,1,1,1,1,7,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,7,1,1,1,1,1,7,2,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,7,1,1,1,1,1,7,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,7,7,7,7,7,7,7,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  5: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,3,1],
    [1,2,1,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,2,2,2,2,2,2,2,2,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,1,1,1,7,1,1,1,2,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,2,2,1,7,7,7,7,7,1,2,2,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,1,7,7,7,7,7,1,2,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,2,2,2,2,2,2,2,2,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  6: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,3,1],
    [1,2,1,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,2,2,2,2,2,2,2,2,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,1,1,1,7,1,1,1,2,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,2,2,1,7,7,7,7,7,1,2,2,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,1,7,7,7,7,7,1,2,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,2,2,2,2,2,2,2,2,2,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]
};
