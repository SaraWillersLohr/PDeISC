// Comentarios claros: este archivo explica la lógica paso a paso.

const roomManager = require('../rooms/roomManager');
const PacmanGame = require('../games/pacmanGame');
const { SnakeGame, getTickInterval } = require('../games/snakeGame');
const leaderboardManager = require('../leaderboard/leaderboardManager');

// Función initSocketHandler(io) que ayuda a entender la lógica.
function initSocketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    socket.on('createRoom', ({ game }) => {
      const room = roomManager.createRoom(game);
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!room) {
        return socket.emit('errorMsg', { message: 'No se pudo crear la sala. Juego inválido.' });
      }

      socket.join(room.code);
      socket.roomCode = room.code;
      console.log(`Sala creada: ${room.code} para el juego: ${game}`);
      socket.emit('roomCreated', room.code);
    });

    socket.on('joinRoom', ({ code, name, character }) => {
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!name || name.trim().length < 3 || name.trim().length > 10) {
        return socket.emit('errorMsg', { message: 'El nombre debe tener entre 3 y 10 caracteres.' });
      }

      const room = roomManager.getRoom(code);
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (room && room.status === 'playing') {
        return socket.emit('errorMsg', {
          message: 'La partida ya comenzó. Usa reconexión automática desde la pantalla de juego.'
        });
      }

      const result = roomManager.joinRoom(code, socket.id, name, character);
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!result.success) {
        return socket.emit('errorMsg', { message: result.error });
      }

      socket.join(code);
      socket.roomCode = code;

      console.log(`Usuario ${name} (${character}) se unió a la sala: ${code}`);

      io.to(code).emit('playerJoined', {
        room: serializeRoom(result.room),
        player: result.player
      });
    });

    socket.on('rejoinGame', ({ code, name }) => {
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!name || name.trim().length < 3) {
        return socket.emit('errorMsg', { message: 'Nombre inválido para reconexión.' });
      }

      const result = roomManager.rejoinRoom(code, socket.id, name);
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!result.success) {
        return socket.emit('errorMsg', { message: result.error });
      }

      const room = result.room;
      socket.join(code);
      socket.roomCode = code;

      console.log(`Usuario ${name} reconectado a partida en sala: ${code}`);

      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (room.gameInstance) {
        socket.emit('gameState', room.gameInstance.getSerializedState());
      }

      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (roomManager.allPlayersConnected(room) && !room.gameInterval && room.gameInstance) {
        resumeGameLoop(io, room);
        io.to(code).emit('gameResumed', { message: 'Conexión restablecida. ¡A jugar!' });
      } else {
        socket.emit('waitingForPlayers', {
          message: 'Esperando reconexión del otro jugador...',
          connected: room.players.filter((p) => p.connected).length,
          total: room.players.length
        });
      }
    });

    socket.on('ready', () => {
      const code = socket.roomCode;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!code) return;

      const room = roomManager.getRoom(code);
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!room) return;

      const allReady = roomManager.setPlayerReady(code, socket.id);

      io.to(code).emit('roomUpdated', serializeRoom(room));

      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (allReady) {
        console.log(`Comenzando partida multijugador en sala: ${code}`);
        startGame(io, room);
      }
    });

    socket.on('playerMove', (direction) => {
      const code = socket.roomCode;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!code) return;

      const room = roomManager.getRoom(code);
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!room || !room.gameInstance) return;

      room.gameInstance.handleInput(socket.id, direction);
    });

    socket.on('restartGame', () => {
      const code = socket.roomCode;
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!code) return;

      const room = roomManager.getRoom(code);
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!room) return;

      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (room.gameInterval) {
        clearTimeout(room.gameInterval);
        room.gameInterval = null;
      }
      room.players.forEach((p) => {
        p.ready = false;
        p.connected = true;
      });
      room.status = 'waiting';
      room.gameInstance = null;
      room.savedLeaderboard = false;

      io.to(code).emit('gameRestarted', serializeRoom(room));
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`);

      const leaveResult = roomManager.removePlayer(socket.id);
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (leaveResult) {
        const { code, room, destroyed, disconnectedPlayerName, paused } = leaveResult;
        console.log(`Jugador ${disconnectedPlayerName} abandonó la sala ${code}`);

        // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (destroyed) {
          console.log(`Sala ${code} destruida por falta de jugadores.`);
        } else if (paused && room) {
          io.to(code).emit('playerDisconnected', {
            message: `${disconnectedPlayerName} perdió conexión. Partida en pausa.`,
            room: serializeRoom(room),
            paused: true
          });
        } else if (room) {
          io.to(code).emit('playerDisconnected', {
            message: `El jugador ${disconnectedPlayerName} se desconectó. La sala volvió al lobby.`,
            room: serializeRoom(room)
          });
        }
      }
    });
  });
}

// Función serializeRoom(room) que ayuda a entender la lógica.
function serializeRoom(room) {
  return {
    code: room.code,
    game: room.game,
    status: room.status,
    players: room.players.map((p) => ({
      name: p.name,
      character: p.character,
      ready: p.ready,
      playerIndex: p.playerIndex,
      connected: p.connected !== false
    }))
  };
}

// Función getSnakeTickInterval(level) que ayuda a entender la lógica.
function getSnakeTickInterval(level) {
  return getTickInterval(level);
}

// Función stopGameLoop(room) que ayuda a entender la lógica.
function stopGameLoop(room) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (room.gameInterval) {
    clearTimeout(room.gameInterval);
    room.gameInterval = null;
  }
}

// Función startGame(io, que ayuda a entender la lógica.
function startGame(io, room) {
  room.savedLeaderboard = false;
  room.players.forEach((p) => { p.connected = true; });

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (room.game === 'pacman') {
    room.gameInstance = new PacmanGame(room.code, room.players);
  } else {
    room.gameInstance = new SnakeGame(room.code, room.players);
  }

  io.to(room.code).emit('gameStarted', {
    room: serializeRoom(room),
    gameState: room.gameInstance.getSerializedState()
  });

  resumeGameLoop(io, room);
}

// Función resumeGameLoop(io, que ayuda a entender la lógica.
function resumeGameLoop(io, room) {
  stopGameLoop(room);

  let intervalMs = room.game === 'snake' ? 100 : Math.round(1000 / 30);
  let lastLevel = room.gameInstance?.level || 1;

  // Función tick que organiza esta parte del código.
  const tick = () => {
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!room.gameInstance) return;

    room.gameInstance.tick();
    const state = room.gameInstance.getSerializedState();

    io.to(room.code).emit('gameState', state);

    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (state.state === 'game_over' || state.state === 'victory') {
      stopGameLoop(room);

      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!room.savedLeaderboard) {
        room.savedLeaderboard = true;
        saveScoresToLeaderboard(room, state);
      }

      io.to(room.code).emit('gameOver', { gameState: state });
      return;
    }

    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (room.game === 'snake' && state.level !== lastLevel) {
      lastLevel = state.level;
      intervalMs = getSnakeTickInterval(lastLevel);
    }

    room.gameInterval = setTimeout(tick, intervalMs);
  };

  room.gameInterval = setTimeout(tick, intervalMs);
}

// Función saveScoresToLeaderboard(room, que ayuda a entender la lógica.
function saveScoresToLeaderboard(room, finalState) {
  const game = room.game;

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (game === 'pacman') {
    finalState.players.forEach((p) => {
      leaderboardManager.addScore('pacman', {
        name: p.name,
        score: finalState.score,
        character: p.character,
        duration: 0,
        victories: finalState.state === 'victory' ? 1 : 0
      });
    });
  } else if (game === 'snake') {
    finalState.players.forEach((p) => {
      const isWinner = finalState.winner === p.socketId;
      const isDraw = finalState.winner === 'draw';
      leaderboardManager.addScore('snake', {
        name: p.name,
        score: p.score,
        character: p.character,
        duration: finalState.duration,
        victories: (isWinner || isDraw) ? 1 : 0
      });
    });
  }
}

module.exports = {
  initSocketHandler
};