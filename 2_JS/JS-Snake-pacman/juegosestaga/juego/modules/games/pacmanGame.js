// Lógica del motor de Escape Escolar (Pac-Man) - Servidor Autoritativo
const { LEVEL_ITEM_QUEUE, MAX_PACMAN_LEVEL } = require('./pacmanConstants');
const { updateGhostBehavior } = require('./ghostAI');
const { GHOST_PROFILES } = require('./pacmanGhostProfiles');
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

// Objeto especial obligatorio por nivel — DEPRECATED: usar LEVEL_ITEM_QUEUE
const SPECIAL_ITEM_BY_LEVEL = {
  1: 'Computadora',
  2: 'Guardapolvo',
  3: 'Cuaderno',
  4: 'Computadora',
  5: 'Guardapolvo'
};

class PacmanGame {
  constructor(roomCode, playersList) {
    this.roomCode = roomCode;
    this.playersList = playersList; // Lista de configuración de sockets
    this.level = 1;
    this.score = 0;
    this.lives = 3; // Vidas compartidas
    this.state = 'playing'; // 'playing', 'level_clear', 'game_over', 'victory'
    
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

  // Cargar o reiniciar nivel
  loadLevel(levelNum, resetGame = false) {
    this.level = levelNum;
    
    if (resetGame) {
      this.score = 0;
    }
    this.lives = 3; // Regenerar 3 vidas al inicio de cada nivel
    
    this.state = 'playing';
    this.itemQueue = [...(LEVEL_ITEM_QUEUE[levelNum] || LEVEL_ITEM_QUEUE[1])];
    this.itemQueueIndex = 0;
    
    // Copiar mapa original
    const rawMap = MAPS[levelNum] || MAPS[1];
    this.map = rawMap.map(row => [...row]);
    
    this.rows = this.map.length;
    this.cols = this.map[0].length;

    // Encontrar puntos de spawn válidos
    const spawnPoints = [];
    const ghostSpawnPoints = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.map[r][c] === 7) {
          ghostSpawnPoints.push({ x: c, y: r });
        } else if (this.map[r][c] === 2 || this.map[r][c] === 0) {
          spawnPoints.push({ x: c, y: r });
        }
      }
    }

    const ghostSpawns = ghostSpawnPoints.length > 0 ? ghostSpawnPoints : [{ x: Math.floor(this.cols/2), y: Math.floor(this.rows/2) }];
    const playerSpawns = spawnPoints.filter(p => Math.abs(p.x - this.cols/2) > 2);

    // Inicializar jugadores
    this.players = this.playersList.map((p, idx) => {
      const spawn = playerSpawns[idx % playerSpawns.length] || { x: 1, y: 1 };
      return {
        socketId: p.socketId,
        name: p.name,
        character: p.character,
        playerIndex: p.playerIndex,
        x: spawn.x,
        y: spawn.y,
        spawnX: spawn.x,
        spawnY: spawn.y,
        targetX: spawn.x,
        targetY: spawn.y,
        dir: 'NONE',
        nextDir: 'NONE',
        lastHorizontalDir: 'RIGHT',
        speed: 0.06 + (levelNum * 0.005),
        isDead: false,
        respawnTimer: 0,
        hasGuardapolvo: false,
        score: 0,
        lives: 3 // Cada personaje tiene 3 vidas
      };
    });

    // Inicializar fantasmas — Esteban (Cazador), Lorena (Emboscador), Scaglione (Patrulla)
    const ghostNames = ['Esteban', 'Lorena', 'Scaglione'];
    const isHardMode = levelNum >= 3;
    let ghostBaseSpeed;
    if (levelNum === 1) {
      ghostBaseSpeed = 0.064;
    } else if (levelNum === 2) {
      ghostBaseSpeed = 0.09;
    } else {
      ghostBaseSpeed = 0.080 + (levelNum * 0.01);
    }
    this.ghosts = ghostNames.map((name, idx) => {
      const spawn = ghostSpawns[idx % ghostSpawns.length] || ghostSpawns[0];
      const profile = GHOST_PROFILES[name];
      return {
        name,
        x: spawn.x,
        y: spawn.y,
        targetX: spawn.x,
        targetY: spawn.y,
        dir: 'NONE',
        speed: ghostBaseSpeed + (idx * 0.008),
        mode: 'chase',
        aiState: 'CHASE',
        behavior: profile?.behavior || 'HUNTER',
        spawnX: spawn.x,
        spawnY: spawn.y,
        respawnTimer: 0,
        patrolWaypoints: null,
        patrolIndex: 0,
        isDead: false
      };
    });

    this.scatterPhase = false;
    this.scatterTimer = Math.max(240, 480 - levelNum * 30);

    this.frightenedTimer = 0;
    this.frightenedCount = 0;
    
    this.spawnNextSpecialItem();
    this.fruitTimer = Math.floor(Math.random() * 600) + 400;
  }

  spawnNextSpecialItem() {
    if (this.itemQueueIndex >= this.itemQueue.length) {
      this.fruit = null;
      return;
    }
    const type = this.itemQueue[this.itemQueueIndex];
    const walkables = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.map[r][c] === 0 || this.map[r][c] === 2) {
          walkables.push({ x: c, y: r });
        }
      }
    }
    if (walkables.length > 0) {
      const pos = walkables[Math.floor(Math.random() * walkables.length)];
      this.fruit = {
        type,
        x: pos.x,
        y: pos.y,
        duration: Infinity,
        isSequential: true
      };
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
    p.score += pts;
    this.fruit = null;
    this.itemQueueIndex++;
    this.spawnNextSpecialItem();
  }

  // DEPRECATED alias
  spawnSpecialItem() {
    this.spawnNextSpecialItem();
  }

  // Manejar inputs del cliente
  handleInput(socketId, dir) {
    const player = this.players.find(p => p.socketId === socketId);
    if (player && !player.isDead && this.state === 'playing') {
      player.nextDir = dir;
    }
  }

  // Verificar pared
  isWall(x, y) {
    const r = Math.round(y);
    const c = Math.round(x);
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
    return this.map[r][c] === 1;
  }

  // Obtener coordenadas vecinas
  getNeighborCoords(x, y, dir) {
    let nx = x, ny = y;
    if (dir === 'UP') ny--;
    else if (dir === 'DOWN') ny++;
    else if (dir === 'LEFT') nx--;
    else if (dir === 'RIGHT') nx++;
    return { x: nx, y: ny };
  }

  // Actualizar posición de entidad
  updateEntityPosition(entity, isGhost = false) {
    if (entity.isDead || entity.respawnTimer > 0) {
      if (entity.respawnTimer > 0) {
        entity.respawnTimer--;
        if (entity.respawnTimer === 0) {
          entity.x = entity.spawnX || 1;
          entity.y = entity.spawnY || 1;
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
          if (!this.isWall(check.x, check.y)) {
            entity.dir = entity.nextDir;
          }
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
      if (dx !== 0) entity.x += Math.sign(dx) * dist;
      if (dy !== 0) entity.y += Math.sign(dy) * dist;
    }
  }

  // IA de fantasmas
  updateGhostAI(ghost) {
    if (ghost.mode === 'returning') {
      const validMoves = [];
      ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach((d) => {
        const coords = this.getNeighborCoords(ghost.x, ghost.y, d);
        if (!this.isWall(coords.x, coords.y)) validMoves.push({ dir: d, x: coords.x, y: coords.y });
      });
      let best = null;
      let minDist = Infinity;
      validMoves.forEach((move) => {
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

    const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const validMoves = [];
    let oppositeDir = 'NONE';
    if (ghost.dir === 'UP') oppositeDir = 'DOWN';
    else if (ghost.dir === 'DOWN') oppositeDir = 'UP';
    else if (ghost.dir === 'LEFT') oppositeDir = 'RIGHT';
    else if (ghost.dir === 'RIGHT') oppositeDir = 'LEFT';

    directions.forEach(d => {
      if (d === oppositeDir) return;
      const coords = this.getNeighborCoords(ghost.x, ghost.y, d);
      if (!this.isWall(coords.x, coords.y)) validMoves.push({ dir: d, x: coords.x, y: coords.y });
    });

    if (validMoves.length === 0 && oppositeDir !== 'NONE') {
      const coords = this.getNeighborCoords(ghost.x, ghost.y, oppositeDir);
      if (!this.isWall(coords.x, coords.y)) validMoves.push({ dir: oppositeDir, x: coords.x, y: coords.y });
    }
    if (validMoves.length === 0) return;

    let chosenMove = null;
    if (ghost.mode === 'frightened') {
      chosenMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    } else {
      const activePlayers = this.players.filter(p => !p.isDead);
      const targetPlayer = activePlayers[0] || this.players[0];
      chosenMove = updateGhostBehavior(ghost, {
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

  // Tick del juego
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

    // Actualizar entidades
    this.players.forEach(p => {
      if (p.celebrateTimer > 0) {
        p.celebrateTimer--;
      }
    });
    this.players.forEach(p => this.updateEntityPosition(p, false));
    this.ghosts.forEach(g => this.updateEntityPosition(g, true));

    // Consumir puntos y objetos
    this.players.forEach(p => {
      if (p.isDead) return;
      
      if (p.dir === 'LEFT') p.lastHorizontalDir = 'LEFT';
      if (p.dir === 'RIGHT') p.lastHorizontalDir = 'RIGHT';
      
      const px = Math.round(p.x);
      const py = Math.round(p.y);

      if (px >= 0 && px < this.cols && py >= 0 && py < this.rows) {
        const cell = this.map[py][px];
        if (cell === 2) {
          this.map[py][px] = 0;
          this.score += 10;
          p.score += 10;
        } else if (cell === 3) {
          this.map[py][px] = 0;
          this.score += 50;
          p.score += 50;
          this.activateHoraLibre();
        }
      }

      // Consumir fruta/objeto
      if (this.fruit && Math.round(p.x) === this.fruit.x && Math.round(p.y) === this.fruit.y) {
        if (this.fruit.isSequential) {
          this._collectSpecialItem(p, this.fruit.type);
        } else {
          if (this.fruit.type === 'Guardapolvo') p.hasGuardapolvo = true;
          let pts = 100;
          if (this.fruit.type === 'Computadora') pts = 500;
          else if (this.fruit.type === 'Cuaderno') pts = 250;
          this.score += pts;
          p.score += pts;
          this.fruit = null;
        }
      }
    });

    // Timer de Hora Libre
    if (this.frightenedTimer > 0) {
      this.frightenedTimer--;
      if (this.frightenedTimer === 0) {
        this.ghosts.forEach(g => { if (g.mode === 'frightened') g.mode = 'chase'; });
      }
    }

    this.checkCollisions();
    this.checkLevelCompletion();
  }

  // Activar Hora Libre
  activateHoraLibre() {
    this.frightenedTimer = 300;
    this.frightenedCount = 0;
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

  // Verificar colisiones
  checkCollisions() {
    this.players.forEach(p => {
      if (p.isDead) return;
      this.ghosts.forEach(g => {
        if (g.isDead || g.respawnTimer > 0) return;
        const dist = Math.sqrt(Math.pow(p.x - g.x, 2) + Math.pow(p.y - g.y, 2));
        if (dist < 0.6) {
          if (g.mode === 'frightened') {
            g.mode = 'returning';
            g.isDead = false;
            g.respawnTimer = 0;
            this.frightenedCount = Math.min(this.frightenedCount + 1, 4);
            const pts = 100 * Math.pow(2, this.frightenedCount);
            this.score += pts;
            p.score += pts;
          } else {
            p.isDead = true;
            p.respawnTimer = 90;
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

  // Contar puntos restantes
  countRemainingPoints() {
    let count = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.map[r][c] === 2 || this.map[r][c] === 3) count++;
      }
    }
    return count;
  }

  // Verificar si se completó el nivel
  checkLevelCompletion() {
    const remainingPoints = this.countRemainingPoints();
    if (remainingPoints === 0 && this.itemQueueIndex >= this.itemQueue.length) {
      if (this.level < MAX_PACMAN_LEVEL) {
        this.state = 'level_clear';
        setTimeout(() => {
          if (this.state === 'level_clear') {
            this.loadLevel(this.level + 1, false);
          }
        }, 3000);
      } else {
        this.state = 'victory';
      }
    }
  }

  _getMissionText() {
    if (this.level === 1) return 'Recoge los puntos y busca el elemento';
    return 'Recoge los puntos y busca los elementos';
  }

  // Retornar estado serializable
  getSerializedState() {
    const remainingPoints = this.countRemainingPoints();
    const nextBonus = this.itemQueue[this.itemQueueIndex] || null;
    
    let levelMessage = '';
    if (this.state === 'level_clear') {
      levelMessage = '¡Nivel completado! Preparate para el siguiente...';
    } else if (remainingPoints > 0 && nextBonus) {
      levelMessage = `Recogé puntos · Bonus: ${nextBonus}`;
    } else if (remainingPoints > 0) {
      levelMessage = 'Recogé todos los puntos del mapa';
    } else if (nextBonus) {
      levelMessage = `Bonus disponible: ${nextBonus}`;
    }
    
    const displayLives = this.players.length === 1 ? this.players[0].lives : Math.max(0, ...this.players.map(p => p.lives));

    return {
      level: this.level,
      score: this.score,
      lives: displayLives,
      state: this.state,
      map: this.map,
      fruit: this.fruit,
      frightened: this.frightenedTimer > 0,
      frightenedTimer: this.frightenedTimer,
      specialItemRequired: nextBonus,
      remainingPoints: remainingPoints,
      levelMessage: levelMessage,
      players: this.players.map(p => ({
        name: p.name,
        character: p.character,
        playerIndex: p.playerIndex,
        x: p.x,
        y: p.y,
        dir: p.dir,
        lastHorizontalDir: p.lastHorizontalDir,
        score: p.score,
        isDead: p.isDead,
        hasGuardapolvo: p.hasGuardapolvo,
        lives: p.lives
      })),
      ghosts: this.ghosts.map(g => ({
        name: g.name,
        x: g.x,
        y: g.y,
        dir: g.dir,
        mode: g.mode,
        aiState: g.aiState || 'CHASE',
        behavior: g.behavior,
        isDead: g.isDead || false
      })),
      scatterPhase: this.scatterPhase,
      missionObjective: this._getMissionText()
    };
  }
}

module.exports = PacmanGame;
