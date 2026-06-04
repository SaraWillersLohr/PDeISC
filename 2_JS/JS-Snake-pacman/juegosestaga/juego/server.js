const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const leaderboardManager = require('./modules/leaderboard/leaderboardManager');
const { initSocketHandler } = require('./modules/sockets/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware para parsear JSON y servir estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- RUTAS DE NAVEGACIÓN (PAGES) ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/index.html'));
});

app.get('/lobby', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/lobby.html'));
});

app.get('/pacman', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/pacman.html'));
});

app.get('/snake', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/snake.html'));
});

app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/leaderboard.html'));
});

// --- API LEADERBOARD ---
// Obtener top 10
app.get('/api/leaderboard/:game', (req, res) => {
  const { game } = req.params;
  if (game !== 'pacman' && game !== 'snake') {
    return res.status(400).json({ error: 'Juego no soportado.' });
  }
  const top10 = leaderboardManager.getTop10(game);
  res.json(top10);
});

// Guardar nueva puntuación (usado principalmente por el modo 1 jugador local)
app.post('/api/leaderboard/:game', (req, res) => {
  const { game } = req.params;
  const entry = req.body;
  
  const result = leaderboardManager.addScore(game, entry);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.entry);
});

// Inicializar sockets
initSocketHandler(io);

const os = require('os');

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

// Puerto obligatorio: 3000
const PORT = 3000;
const LOCAL_IP = getLocalIP();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`   MSGames Servidor Corriendo en Puerto ${PORT}`);
  console.log(`   URL Local: http://localhost:${PORT}`);
  console.log(`   URL Red (Celular): http://${LOCAL_IP}:${PORT}`);
  console.log(`==================================================`);
});
