// Lógica del motor de Cable Rush (Snake) - Servidor Autoritativo

// ─── Tabla de niveles ────────────────────────────────────────────────────────
// tickInterval: ms entre ticks — controla velocidad real del movimiento.
//               Menor valor = más rápido. El jugador avanza 1 celda por tick.
// duration:     segundos acumulados para alcanzar este nivel
// obstacles:    obstáculos fijos en el tablero (se suman al subir de nivel)
// bonusChance:  probabilidad de que aparezca un item bonus temporal
//
// Diseño de velocidad:
//   Lvl 1: 200ms/celda  → ritmo introductorio, tranquilo
//   Lvl 2: 175ms/celda  → +14% más rápido
//   Lvl 3: 150ms/celda  → +17% más rápido que lvl2
//   Lvl 4: 125ms/celda  → +17% — se empieza a sentir urgente
//   Lvl 5: 105ms/celda  → +16%
//   Lvl 6:  85ms/celda  → +19% — zona de peligro
//   Lvl 7:  68ms/celda  → +20%
//   Lvl 8:  52ms/celda  → +24% — máximo caos
//
// Progresión de obstáculos: 0 → 3 → 6 → 9 → 13 → 17 → 22 → 28
// El tablero es 20×13 = 260 celdas. Nivel 8 = 28 obstáculos ≈ 11% del tablero.
const LEVELS = [
  /* 1 */ { tickInterval: 200, duration: 0,   obstacles: 0,  bonusChance: 0.00 },
  /* 2 */ { tickInterval: 175, duration: 15,  obstacles: 3,  bonusChance: 0.10 },
  /* 3 */ { tickInterval: 150, duration: 30,  obstacles: 6,  bonusChance: 0.15 },
  /* 4 */ { tickInterval: 125, duration: 50,  obstacles: 9,  bonusChance: 0.20 },
  /* 5 */ { tickInterval: 105, duration: 70,  obstacles: 13, bonusChance: 0.25 },
  /* 6 */ { tickInterval:  85, duration: 95,  obstacles: 17, bonusChance: 0.30 },
  /* 7 */ { tickInterval:  68, duration: 125, obstacles: 22, bonusChance: 0.35 },
  /* 8 */ { tickInterval:  52, duration: 160, obstacles: 28, bonusChance: 0.40 },
];

// Función getLevelConfig(level) que ayuda a entender la lógica.
function getLevelConfig(level) {
  const idx = Math.min(level - 1, LEVELS.length - 1);
  return LEVELS[idx];
}

// Calcula el nivel actual según duración
function calcLevel(duration) {
  let lv = 1;
  // Repite este bloque con un bucle for.
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (duration >= LEVELS[i].duration) { lv = i + 1; break; }
  }
  return lv;
}

// Devuelve el tickInterval que debe usar el servidor para este nivel
function getTickInterval(level) {
  return getLevelConfig(level).tickInterval;
}

class SnakeGame {
  constructor(roomCode, playersList) {
    this.roomCode = roomCode;
    this.playersList = playersList; // [{socketId, name, character, playerIndex}]
    this.width  = 20;   // reducido de 30 → celdas más grandes y visibles
    this.height = 13;   // reducido de 20
    this.state  = 'playing';

    this.items     = []; // {x, y, type: 'datos'|'energia'|'nodo'|'bonus', expiresAt?}
    this.powerups  = []; // {x, y, type: 'overclock'|'firewall'|'emp'}
    this.obstacles = []; // {x, y}  — fijos, aumentan con el nivel
    this.winner    = null;
    this.duration  = 0;
    this.tickCount = 0;
    this.level     = 1;
    this.powerupSpawnTimer = null;
    this.bonusCleanupTimer = null;

    this.initGame();
  }

  initGame() {
    this.players = this.playersList.map((p, idx) => {
      const isFirst = idx === 0;
      const startX  = isFirst ? 4 : this.width - 5;
      const startY  = Math.floor(this.height / 2);
      const initialDir = isFirst ? 'RIGHT' : 'LEFT';

      const segments = [];
      // Repite este bloque con un bucle for.
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
        magnetTicks: 0,
        victories: 0
      };
    });

    this.obstacles = [];
    this.items     = [];
    this.powerups  = [];

    // Items iniciales
    for (let i = 0; i < 3; i++) this.spawnItem();
    this.spawnPowerup();
    // Obstáculos del nivel inicial (nivel 1 = 0 obstáculos)
    this._syncObstacles();
  }

  // ─── Obstáculos ────────────────────────────────────────────────────────────

  _syncObstacles() {
    const target = getLevelConfig(this.level).obstacles;
    // Agregar obstáculos si faltan
    while (this.obstacles.length < target) {
      const tile = this._getRandomFreeTileForObstacle();
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (tile) this.obstacles.push(tile);
      else break; // tablero lleno
    }
    // No se quitan obstáculos (solo se agregan al subir de nivel)
  }

  _getRandomFreeTileForObstacle() {
    const safeZone = 5; // no spawnear cerca del centro ni de los extremos iniciales
    let x, y, attempts = 0;
    // Ejecuta este bloque al menos una vez y luego repite mientras la condición sea verdadera.
    do {
      x = Math.floor(Math.random() * (this.width  - 4)) + 2;
      y = Math.floor(Math.random() * (this.height - 4)) + 2;
      attempts++;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (attempts > 200) return null;
    } while (
      this.isTileOccupied(x, y) ||
      this.isObstacle(x, y)     ||
      this.items.some(i  => i.x === x && i.y === y) ||
      this.powerups.some(p => p.x === x && p.y === y) ||
      // Zona segura alrededor del inicio de cada jugador
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
    return this.players.some(p => p.segments.some(seg => seg.x === x && seg.y === y));
  }

  getRandomFreeTile() {
    let x, y, attempts = 0;
    // Ejecuta este bloque al menos una vez y luego repite mientras la condición sea verdadera.
    do {
      x = Math.floor(Math.random() * (this.width  - 2)) + 1;
      y = Math.floor(Math.random() * (this.height - 2)) + 1;
      attempts++;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (attempts > 200) break;
    } while (
      this.isTileOccupied(x, y)  ||
      this.isObstacle(x, y)      ||
      this.items.some(i  => i.x === x && i.y === y) ||
      this.powerups.some(p => p.x === x && p.y === y)
    );
    return { x, y };
  }

  // ─── Items ─────────────────────────────────────────────────────────────────

  spawnItem() {
    const tile = this.getRandomFreeTile();
    const cfg  = getLevelConfig(this.level);
    const rand = Math.random();

    // Chance de item bonus temporal según nivel
    if (rand < cfg.bonusChance) {
      const ttl = 8000 + Math.random() * 4000; // 8–12 segundos
      this.items.push({ x: tile.x, y: tile.y, type: 'bonus', expiresAt: Date.now() + ttl });
      return;
    }

    const r2 = Math.random();
    let type = 'datos';
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (r2 > 0.6 && r2 <= 0.9) type = 'energia';
    // Comprueba la siguiente condición y ejecuta este bloque cuando se cumpla.
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
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (this.powerupSpawnTimer) clearTimeout(this.powerupSpawnTimer);
    this.powerupSpawnTimer = setTimeout(() => {
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (this.state === 'playing') this.spawnPowerup();
    }, 8000);
  }

  // ─── Imán ──────────────────────────────────────────────────────────────────

  applyMagnetAttraction() {
    this.players.forEach(player => {
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.isDead || !(player.magnetTicks > 0)) return;
      const head   = player.segments[0];
      const radius = 5.5;
      this.items.forEach(item => {
        let dx = head.x - item.x;
        let dy = head.y - item.y;
        // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dx >  this.width  / 2) dx -= this.width;
        // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dx < -this.width  / 2) dx += this.width;
        // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dy >  this.height / 2) dy -= this.height;
        // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dy < -this.height / 2) dy += this.height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dist > 0 && dist <= radius) {
          const force = 0.15 + (1 - dist / radius) * 0.35;
          item.x += (dx / dist) * force;
          item.y += (dy / dist) * force;
          // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (item.x < 0)             item.x += this.width;
          // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (item.x >= this.width)   item.x -= this.width;
          // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (item.y < 0)             item.y += this.height;
          // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (item.y >= this.height)  item.y -= this.height;
        }
      });
    });
  }

  // ─── Tick ──────────────────────────────────────────────────────────────────

  tick() {
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (this.state !== 'playing') return;

    this.tickCount++;

    // Duración: cada 10 ticks = 1 segundo (con tickInterval=100ms base)
    // Con tickInterval variable la duración usa tickCount proporcional
    if (this.tickCount % 10 === 0) {
      this.duration++;
      const newLevel = calcLevel(this.duration);
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (newLevel !== this.level) {
        this.level = newLevel;
        this._syncObstacles();
      }
    }

    // Limpiar bonus expirados
    if (this.tickCount % 5 === 0) this._cleanExpiredBonus();

    this.applyMagnetAttraction();

    this.players.forEach(player => {
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.isDead) return;

      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.overclockTicks > 0) player.overclockTicks--;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.firewallTicks  > 0) player.firewallTicks--;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.empTicks > 0) {
        player.empTicks--;
        return; // congelado
      }
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.magnetTicks > 0) player.magnetTicks--;

      // Overclock = doble movimiento por tick (2 celdas)
      const steps = player.overclockTicks > 0 ? 2 : 1;
      // Repite este bloque con un bucle for.
      for (let step = 0; step < steps; step++) {
        // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
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
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.dir === 'UP')    head.y--;
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.dir === 'DOWN')  head.y++;
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.dir === 'LEFT')  head.x--;
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.dir === 'RIGHT') head.x++;

    // Colisión con bordes
    const outOfBounds = head.x < 0 || head.x >= this.width || head.y < 0 || head.y >= this.height;
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (outOfBounds) {
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.firewallTicks > 0) {
        player.firewallTicks = 0;
        // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if      (head.x < 0)             head.x = this.width  - 1;
        // Comprueba la siguiente condición y ejecuta este bloque cuando se cumpla.
else if (head.x >= this.width)   head.x = 0;
        // Comprueba la siguiente condición y ejecuta este bloque cuando se cumpla.
else if (head.y < 0)             head.y = this.height - 1;
        // Comprueba la siguiente condición y ejecuta este bloque cuando se cumpla.
else if (head.y >= this.height)  head.y = 0;
      } else {
        player.isDead = true;
        return;
      }
    }

    // Colisión con obstáculos fijos
    if (this.isObstacle(head.x, head.y)) {
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.firewallTicks > 0) {
        player.firewallTicks = 0;
      } else {
        player.isDead = true;
        return;
      }
    }

    // Colisión con cables
    let hitCable = false;
    this.players.forEach(other => {
      other.segments.forEach((seg, sIdx) => {
        // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (seg.x === head.x && seg.y === head.y) {
          // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (other.socketId === player.socketId && sIdx === 0) return;
          hitCable = true;
        }
      });
    });

    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (hitCable) {
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (player.firewallTicks > 0) {
        player.firewallTicks = 0;
      } else {
        player.isDead = true;
        return;
      }
    }

    player.segments.unshift(head);

    // Consumo de items
    let ate = false;
    // Función itemIdx que organiza esta parte del código.
    const itemIdx = this.items.findIndex(item => {
      let dx = head.x - item.x;
      let dy = head.y - item.y;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dx >  this.width  / 2) dx -= this.width;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dx < -this.width  / 2) dx += this.width;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dy >  this.height / 2) dy -= this.height;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dy < -this.height / 2) dy += this.height;
      return Math.abs(dx) < 0.55 && Math.abs(dy) < 0.55;
    });

    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (itemIdx !== -1) {
      const item = this.items.splice(itemIdx, 1)[0];
      ate = true;
      let scoreAdd     = 10;
      let growSegments = 1;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if      (item.type === 'energia') { scoreAdd = 25;  growSegments = 2; }
      // Comprueba la siguiente condición y ejecuta este bloque cuando se cumpla.
else if (item.type === 'nodo')    { scoreAdd = 50;  growSegments = 3; }
      // Comprueba la siguiente condición y ejecuta este bloque cuando se cumpla.
else if (item.type === 'bonus')   { scoreAdd = 100; growSegments = 1; }
      player.score += scoreAdd;
      // Repite este bloque con un bucle for.
      for (let i = 1; i < growSegments; i++) {
        player.segments.push({ ...player.segments[player.segments.length - 1] });
      }
      this.spawnItem();
    }

    // Consumo de powerups
    const puIdx = this.powerups.findIndex(pu => pu.x === head.x && pu.y === head.y);
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (puIdx !== -1) {
      const pu = this.powerups.splice(puIdx, 1)[0];
      ate = true;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (pu.type === 'overclock') {
        player.overclockTicks = 50;
      } else if (pu.type === 'firewall') {
        player.firewallTicks = 80;
      } else if (pu.type === 'emp') {
        player.magnetTicks = 80;
        this.players.forEach(other => {
          // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (other.socketId !== player.socketId) other.empTicks = 20;
        });
      }
      this.schedulePowerupRespawn();
    }

    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!ate) player.segments.pop();
  }

  checkGameOver() {
    // Función alive que organiza esta parte del código.
    const alive = this.players.filter(p => !p.isDead);

    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (alive.length === 0) {
      this.state  = 'game_over';
      const p1 = this.players[0];
      const p2 = this.players[1];
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (p1 && p2) {
        // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if      (p1.score > p2.score) this.winner = p1.socketId;
        // Comprueba la siguiente condición y ejecuta este bloque cuando se cumpla.
else if (p2.score > p1.score) this.winner = p2.socketId;
        else                          this.winner = 'draw';
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
      items:     this.items.map(i => ({
        x: i.x, y: i.y, type: i.type,
        expiresAt: i.expiresAt || null
      })),
      powerups:  this.powerups,
      obstacles: this.obstacles,
      players:   this.players.map(p => ({
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

module.exports = { SnakeGame, getTickInterval };