// Comentarios claros: este archivo explica la lógica paso a paso.

/** IA fantasmas — cliente (espejo del servidor) */
const AI_STATE = {
  CHASE: 'CHASE',
  SCATTER: 'SCATTER',
  INTERCEPT: 'INTERCEPT',
  PATROL: 'PATROL'
};

// Función buildPatrolWaypoints(cols, que ayuda a entender la lógica.
function buildPatrolWaypoints(cols, rows, spawnX, spawnY) {
  const margin = 2;
  return [
    { x: margin, y: margin },
    { x: cols - 1 - margin, y: margin },
    { x: cols - 1 - margin, y: rows - 1 - margin },
    { x: margin, y: rows - 1 - margin },
    { x: spawnX, y: spawnY }
  ];
}

// Función getScatterTarget(ghost, que ayuda a entender la lógica.
function getScatterTarget(ghost, cols, rows) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (ghost.name === 'Esteban') return { x: cols - 2, y: 1 };
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (ghost.name === 'Lorena') return { x: 1, y: 1 };
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (ghost.name === 'Scaglione') return { x: cols - 2, y: rows - 2 };
  return { x: ghost.spawnX, y: ghost.spawnY };
}

// Función getPlayerAhead(player, que ayuda a entender la lógica.
function getPlayerAhead(player, steps, getNeighborCoords, isWall) {
  let x = player.x;
  let y = player.y;
  let dir = player.dir;
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dir === 'NONE') dir = player.lastHorizontalDir || 'RIGHT';
  // Repite este bloque con un bucle for.
  for (let i = 0; i < steps; i++) {
    const next = getNeighborCoords(x, y, dir);
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (isWall(next.x, next.y)) break;
    x = next.x;
    y = next.y;
  }
  return { x, y };
}

// Función pickBestMove(validMoves, que ayuda a entender la lógica.
function pickBestMove(validMoves, targetX, targetY) {
  let best = null;
  let minDist = Infinity;
  validMoves.forEach((move) => {
    const dist = Math.pow(move.x - targetX, 2) + Math.pow(move.y - targetY, 2);
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dist < minDist) {
      minDist = dist;
      best = move;
    }
  });
  return best;
}

// Función updateGhostBehavior(ghost, que ayuda a entender la lógica.
function updateGhostBehavior(ghost, ctx) {
  const {
    validMoves,
    targetPlayer,
    cols,
    rows,
    scatterPhase,
    tickCount,
    getNeighborCoords,
    isWall
  } = ctx;

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (ghost.mode === 'returning' || ghost.mode === 'eaten') return null;

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (ghost.mode === 'frightened') {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  let targetX = ghost.spawnX;
  let targetY = ghost.spawnY;
  const profile = typeof GHOST_PROFILES !== 'undefined' ? GHOST_PROFILES[ghost.name] : null;
  const behavior = profile?.behavior || 'HUNTER';

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (scatterPhase) {
    const scatter = getScatterTarget(ghost, cols, rows);
    targetX = scatter.x;
    targetY = scatter.y;
    ghost.aiState = AI_STATE.SCATTER;
  } else if (behavior === 'HUNTER' && targetPlayer) {
    targetX = targetPlayer.x;
    targetY = targetPlayer.y;
    ghost.aiState = AI_STATE.CHASE;
  } else if (behavior === 'INTERCEPT' && targetPlayer) {
    const ahead = getPlayerAhead(targetPlayer, 4, getNeighborCoords, isWall);
    targetX = ahead.x;
    targetY = ahead.y;
    ghost.aiState = AI_STATE.INTERCEPT;
  } else if (behavior === 'PATROL') {
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!ghost.patrolWaypoints?.length) {
      ghost.patrolWaypoints = buildPatrolWaypoints(cols, rows, ghost.spawnX, ghost.spawnY);
      ghost.patrolIndex = 0;
    }
    const wp = ghost.patrolWaypoints[ghost.patrolIndex % ghost.patrolWaypoints.length];
    targetX = wp.x;
    targetY = wp.y;
    ghost.aiState = AI_STATE.PATROL;
    const distToWp = Math.pow(ghost.x - wp.x, 2) + Math.pow(ghost.y - wp.y, 2);
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (distToWp < 0.4 && tickCount % 30 === 0) {
      ghost.patrolIndex = (ghost.patrolIndex + 1) % ghost.patrolWaypoints.length;
    }
  }

  return pickBestMove(validMoves, targetX, targetY);
}

// Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (typeof window !== 'undefined') {
  window.GhostAI = { AI_STATE, updateGhostBehavior, pickBestMove, buildPatrolWaypoints };
}