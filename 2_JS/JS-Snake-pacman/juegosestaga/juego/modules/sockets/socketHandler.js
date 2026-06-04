const roomManager = require('../rooms/roomManager');
const PacmanGame = require('../games/pacmanGame');
const { SnakeGame, getTickInterval } = require('../games/snakeGame');
const leaderboardManager = require('../leaderboard/leaderboardManager');

function initSocketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    socket.on('createRoom', ({ game }) => {
      const room = roomManager.createRoom(game);
      if (!room) {
        return socket.emit('errorMsg', { message: 'No se pudo crear la sala. Juego inválido.' });
      }

      socket.join(room.code);
      socket.roomCode = room.code;
      console.log(`Sala creada: ${room.code} para el juego: ${game}`);
      socket.emit('roomCreated', room.code);
    });

    socket.on('joinRoom', ({ code, name, character }) => {
      if (!name || name.trim().length < 3 || name.trim().length > 10) {
        return socket.emit('errorMsg', { message: 'El nombre debe tener entre 3 y 10 caracteres.' });
      }

      const room = roomManager.getRoom(code);
      if (room && room.status === 'playing') {
        return socket.emit('errorMsg', {
          message: 'La partida ya comenzó. Usa reconexión automática desde la pantalla de juego.'
        });
      }

      const result = roomManager.joinRoom(code, socket.id, name, character);
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
      if (!name || name.trim().length < 3) {
        return socket.emit('errorMsg', { message: 'Nombre inválido para reconexión.' });
      }

      const result = roomManager.rejoinRoom(code, socket.id, name);
      if (!result.success) {
        return socket.emit('errorMsg', { message: result.error });
      }

      const room = result.room;
      socket.join(code);
      socket.roomCode = code;

      console.log(`Usuario ${name} reconectado a partida en sala: ${code}`);

      if (room.gameInstance) {
        socket.emit('gameState', room.gameInstance.getSerializedState());
      }

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
      if (!code) return;

      const room = roomManager.getRoom(code);
      if (!room) return;

      const allReady = roomManager.setPlayerReady(code, socket.id);

      io.to(code).emit('roomUpdated', serializeRoom(room));

      if (allReady) {
        console.log(`Comenzando partida multijugador en sala: ${code}`);
        startGame(io, room);
      }
    });

    socket.on('playerMove', (direction) => {
      const code = socket.roomCode;
      if (!code) return;

      const room = roomManager.getRoom(code);
      if (!room || !room.gameInstance) return;

      room.gameInstance.handleInput(socket.id, direction);
    });

    socket.on('restartGame', () => {
      const code = socket.roomCode;
      if (!code) return;

      const room = roomManager.getRoom(code);
      if (!room) return;

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
      if (leaveResult) {
        const { code, room, destroyed, disconnectedPlayerName, paused } = leaveResult;
        console.log(`Jugador ${disconnectedPlayerName} abandonó la sala ${code}`);

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

function getSnakeTickInterval(level) {
  return getTickInterval(level);
}

function stopGameLoop(room) {
  if (room.gameInterval) {
    clearTimeout(room.gameInterval);
    room.gameInterval = null;
  }
}

function startGame(io, room) {
  room.savedLeaderboard = false;
  room.players.forEach((p) => { p.connected = true; });

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

function resumeGameLoop(io, room) {
  stopGameLoop(room);

  let intervalMs = room.game === 'snake' ? 100 : Math.round(1000 / 30);
  let lastLevel = room.gameInstance?.level || 1;

  const tick = () => {
    if (!room.gameInstance) return;

    room.gameInstance.tick();
    const state = room.gameInstance.getSerializedState();

    io.to(room.code).emit('gameState', state);

    if (state.state === 'game_over' || state.state === 'victory') {
      stopGameLoop(room);

      if (!room.savedLeaderboard) {
        room.savedLeaderboard = true;
        saveScoresToLeaderboard(room, state);
      }

      io.to(room.code).emit('gameOver', { gameState: state });
      return;
    }

    if (room.game === 'snake' && state.level !== lastLevel) {
      lastLevel = state.level;
      intervalMs = getSnakeTickInterval(lastLevel);
    }

    room.gameInterval = setTimeout(tick, intervalMs);
  };

  room.gameInterval = setTimeout(tick, intervalMs);
}

function saveScoresToLeaderboard(room, finalState) {
  const game = room.game;

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
