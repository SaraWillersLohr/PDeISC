// Cliente Socket.IO e Integración de Lobby de Matchmaking
const socket = io();

let selectedGame = localStorage.getItem('selectedGame') || 'pacman';
let gameMode = null; // '1P' o '2P'
let mpType = null; // 'local' o 'online'
let activeRoom = null;

// Datos de Personajes por Juego
const CHARACTERS = {
  pacman: [
    {
      id: 'Sara', name: 'Sara', color: '#ff007f', selColor: '#ff007f',
      img: 'sarapix-paraladerecha.png', imgPath: '/assets/img-pacman/sarapix-paraladerecha.png',
      stats: [
        { label: 'Velocidad', value: 3, max: 5, color: '#ff007f' },
        { label: 'Agilidad',  value: 5, max: 5, color: '#ff007f' },
        { label: 'Sigilo',    value: 4, max: 5, color: '#ff007f' }
      ]
    },
    {
      id: 'Male', name: 'Male', color: '#00f0ff', selColor: '#00f0ff',
      img: 'malepix-paraladerecha.png', imgPath: '/assets/img-pacman/malepix-paraladerecha.png',
      stats: [
        { label: 'Velocidad', value: 5, max: 5, color: '#00f0ff' },
        { label: 'Agilidad',  value: 3, max: 5, color: '#00f0ff' },
        { label: 'Sigilo',    value: 2, max: 5, color: '#00f0ff' }
      ]
    }
  ],
  snake: typeof getLobbyCharacters === 'function'
    ? getLobbyCharacters()
    : [
      { id: 'USB', name: 'Cable USB', desc: 'Conector\nUSB Type-A', color: '#00f0ff', selColor: '#00f0ff', img: 'azul.png' },
      { id: 'HDMI', name: 'Cable HDMI', desc: 'Conector\nHDMI', color: '#bf00ff', selColor: '#bf00ff', img: 'violeta.png' },
      { id: 'Ethernet', name: 'Cable Ethernet', desc: 'Conector\nRJ-45', color: '#39ff14', selColor: '#39ff14', img: 'verde.png' }
    ]
};

// Al cargar el documento, renderizar dinámicamente personajes y configurar el formulario
document.addEventListener('DOMContentLoaded', () => {
  renderCharacters();

  // Actualizar título del lobby y label de personaje
  const lobbyTitle = document.getElementById('lobbyTitle');
  const characterLabel = document.getElementById('characterLabel');
  if (lobbyTitle) {
    lobbyTitle.textContent = selectedGame === 'pacman' ? 'Configurar Escape Escolar' : 'Configurar Cable Rush';
  }
  if (characterLabel) {
    characterLabel.textContent = selectedGame === 'pacman' ? 'Selecciona tu Personaje' : 'Selecciona tu Tipo de Cable';
  }
});

// Renderizar la selección de personajes dinámicamente
function renderCharacters() {
  const container = document.getElementById('characterSelectContainer');
  if (!container) return;

  container.innerHTML = '';
  const list = CHARACTERS[selectedGame] || [];
  container.dataset.count = String(list.length);

  const hiddenInput = document.getElementById('selectedCharacter');
  if (hiddenInput) hiddenInput.value = '';

  list.forEach(char => {
    const col = document.createElement('div');
    col.className = 'char-grid-item';

    const imgPath = char.imgPath || `/assets/characters/${char.img}`;

    // Support both old format (bars: '████') and new format (value/max/color)
    const statsHtml = (char.stats || []).map(s => {
      if (s.bars) {
        // legacy text bars
        return `<li><span class="stat-label">${s.label}</span><span class="char-stat-bar">${s.bars}</span></li>`;
      }
      // new visual bar
      const pct = Math.round((s.value / s.max) * 100);
      const color = s.color || '#00f0ff';
      return `<li class="stat-row">
        <span class="stat-label">${s.label}</span>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="width:${pct}%;background:${color};box-shadow:0 0 8px ${color}88;"></div>
        </div>
        <span class="stat-value">${s.value}/${s.max}</span>
      </li>`;
    }).join('');

    col.innerHTML = `
      <div class="select-char-card"
           id="char-${char.id}"
           data-cable="${selectedGame === 'snake' ? char.id : ''}"
           style="--sel-color: ${char.selColor}; border-color: ${char.color}33;"
           onclick="selectCharacter('${char.id}')"
           role="button"
           tabindex="0"
           aria-pressed="false"
           aria-label="Seleccionar ${char.name}">
        <span class="char-selected-badge">✓ ELEGIDO</span>
        <div class="char-portrait">
          <img src="${imgPath}" alt="${char.name}" class="char-img">
        </div>
        <h4 class="char-name" style="color: ${char.color};">${char.name}</h4>
        <ul class="char-stats">${statsHtml}</ul>
      </div>
    `;
    container.appendChild(col);
  });
}

function selectCharacter(charId) {
  document.querySelectorAll('.select-char-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-pressed', 'false');
  });

  const card = document.getElementById(`char-${charId}`);
  if (card) {
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
  }

  document.getElementById('selectedCharacter').value = charId;
  document.getElementById('characterErr').style.display = 'none';

  if (window.audioSynth) {
    window.audioSynth.playCharacterSelect();
  }
}

// Check if mobile device
function isMobileDevice() {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1) || window.innerWidth <= 576;
}

// Configura el modo de juego
function setActiveButton(buttons, activeBtn) {
  buttons.forEach(btn => {
    if (!btn) return;
    btn.classList.remove('is-active', 'bg-primary', 'text-black');
  });
  if (activeBtn) activeBtn.classList.add('is-active');
}

function setMode(mode) {
  gameMode = mode;
  const btn1P = document.getElementById('btnMode1P');
  const btn2P = document.getElementById('btnMode2P');
  const mpOpts = document.getElementById('multiplayerOptions');
  const startBtn = document.getElementById('btnStartGameLocal');

  if (mode === '1P') {
    setActiveButton([btn1P, btn2P], btn1P);
    mpOpts.style.display = 'none';
    startBtn.style.display = 'block';
    startBtn.textContent = 'Iniciar Partida Local';
  } else {
    setActiveButton([btn1P, btn2P], btn2P);
    mpOpts.style.display = 'block';

    setMultiplayerType(mpType);
  }
}

// Configura tipo de multijugador (Local o Online)
function setMultiplayerType(type) {
  mpType = type;
  const btnLocal = document.getElementById('btnTypeLocal');
  const btnOnline = document.getElementById('btnTypeOnline');
  const onlineSection = document.getElementById('onlineRoomSection');
  const startBtn = document.getElementById('btnStartGameLocal');

  if (type === 'local') {
    setActiveButton([btnLocal, btnOnline], btnLocal);
    onlineSection.style.display = 'none';
    startBtn.style.display = 'block';
    startBtn.textContent = 'Iniciar Partida Local (2P)';
  } else if (type === 'online') {
    setActiveButton([btnLocal, btnOnline], btnOnline);
    onlineSection.style.display = 'block';
    startBtn.style.display = 'none';
  } else {
    // If null or undefined, don't select anything
    setActiveButton([btnLocal, btnOnline], null);
    onlineSection.style.display = 'none';
    startBtn.style.display = 'none';
  }
}

// Función ya no es necesaria porque el campo está siempre visible

// Validación JavaScript de Formulario y Campos
function validateInputs() {
  const nameInput = document.getElementById('playerName');
  const character = document.getElementById('selectedCharacter').value;

  let valid = true;

  if (!nameInput.checkValidity()) {
    nameInput.classList.add('is-invalid');
    valid = false;
  } else {
    nameInput.classList.remove('is-invalid');
  }

  if (!character) {
    document.getElementById('characterErr').style.display = 'block';
    valid = false;
  } else {
    document.getElementById('characterErr').style.display = 'none';
  }

  if (!gameMode) {
    alert('Debes elegir un modo de juego (1 Jugador o 2 Jugadores).');
    valid = false;
  } else if (gameMode === '2P' && !mpType) {
    alert('Debes elegir un tipo de multijugador (Local u Online).');
    valid = false;
  }

  return valid;
}

// --- LOGICA DE JUEGO LOCAL ---
function handleStartLocalGame() {
  if (!validateInputs()) return;

  const nickname = document.getElementById('playerName').value;
  const character = document.getElementById('selectedCharacter').value;

  const gameConfig = {
    mode: gameMode,
    multiplayer: mpType,
    p1Name: nickname,
    p1Character: character
  };

  const startBtn = document.getElementById('btnStartGameLocal');
  if (startBtn) startBtn.disabled = true;

  if (window.audioSynth) {
    window.audioSynth.playStartGame();
  }

  setTimeout(() => {
    sessionStorage.setItem('gameConfig', JSON.stringify(gameConfig));
    window.location.href = `/${selectedGame}`;
  }, 380);
}

// --- LOGICA DE SALAS ONLINE (SOCKET.IO) ---
function handleCreateOnlineRoom() {
  if (!validateInputs()) return;
  socket.emit('createRoom', { game: selectedGame });
}

function handleJoinOnlineRoom() {
  if (!validateInputs()) return;

  const codeInput = document.getElementById('roomCodeInput');
  const code = codeInput.value.toUpperCase();

  if (!code || code.length !== 4 || !/^[A-Z]{4}$/.test(code)) {
    codeInput.classList.add('is-invalid');
    document.getElementById('codeErr').style.display = 'block';
    return;
  }

  codeInput.classList.remove('is-invalid');
  document.getElementById('codeErr').style.display = 'none';

  const nickname = document.getElementById('playerName').value;
  const character = document.getElementById('selectedCharacter').value;

  socket.emit('joinRoom', { code, name: nickname, character });
}

// Al recibir que se creó la sala
socket.on('roomCreated', (code) => {
  const nickname = document.getElementById('playerName').value;
  const character = document.getElementById('selectedCharacter').value;
  socket.emit('joinRoom', { code, name: nickname, character });
});

// Al unirse exitosamente a una sala o actualizarse
socket.on('playerJoined', ({ room, player }) => {
  activeRoom = room;
  switchToWaitingLobby();
  updatePlayersList();

  if (window.audioSynth) {
    window.audioSynth.playCoin();
  }
});

// Actualizaciones de la sala
socket.on('roomUpdated', (room) => {
  activeRoom = room;
  updatePlayersList();
});

// Cambia la vista del formulario al Lobby de Sockets
function switchToWaitingLobby() {
  document.getElementById('lobbyForm').style.display = 'none';
  document.getElementById('onlineLobbyWaiting').style.display = 'block';
  document.getElementById('roomCodeDisplay').textContent = activeRoom.code;
}

// Re-renderiza la lista de jugadores en la sala
function updatePlayersList() {
  const container = document.getElementById('onlinePlayersList');
  if (!container || !activeRoom) return;

  container.innerHTML = '';

  activeRoom.players.forEach(p => {
    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between align-items-center p-2 rounded bg-black bg-opacity-40 border border-secondary-subtle';
    div.innerHTML = `
      <div class="text-start">
        <span class="text-arcade font-bold ${p.playerIndex === 0 ? 'text-info' : 'text-danger'}">${p.name}</span>
        <span class="text-secondary small ms-2">(${p.character})</span>
      </div>
      <div>
        ${p.ready
          ? '<span class="badge bg-success text-arcade px-2 py-1 fs-7">Listo</span>'
          : '<span class="badge bg-warning text-dark text-arcade px-2 py-1 fs-7">Esperando</span>'
        }
      </div>
    `;
    container.appendChild(div);
  });

  if (activeRoom.players.length < 2) {
    const div = document.createElement('div');
    div.className = 'p-2 rounded border border-dashed text-secondary text-center small';
    div.textContent = 'Esperando a que se una el Jugador 2...';
    container.appendChild(div);
  }
}

// Envía estado Ready al servidor
function handleSendReady() {
  socket.emit('ready');
  document.getElementById('btnReady').disabled = true;
  document.getElementById('btnReady').textContent = 'Esperando Rival...';
}

// Abandona sala
function handleExitRoom() {
  window.location.reload();
}

// Desconexión de rival
socket.on('playerDisconnected', ({ message, room }) => {
  activeRoom = room;
  updatePlayersList();

  document.getElementById('btnReady').disabled = false;
  document.getElementById('btnReady').textContent = '¡Listo! (Ready)';

  showCustomAlert(message);
});

// Comienzo de la partida multijugador online
socket.on('gameStarted', ({ room, gameState }) => {
  const gameConfig = {
    mode: '2P',
    multiplayer: 'online',
    roomCode: room.code,
    players: room.players,
    myIndex: room.players.findIndex(p => p.name === document.getElementById('playerName').value)
  };

  sessionStorage.setItem('gameConfig', JSON.stringify(gameConfig));
  window.location.href = `/${selectedGame}`;
});

// Manejo de errores personalizados desde backend
socket.on('errorMsg', ({ message }) => {
  showCustomAlert(message);
});

// --- ALERTAS PERSONALIZADAS ---
function showCustomAlert(msg) {
  document.getElementById('customAlertMessage').textContent = msg;
  document.getElementById('customAlertOverlay').classList.add('active');
  if (window.audioSynth) {
    window.audioSynth.playGameOver();
  }
}

function closeCustomAlert() {
  document.getElementById('customAlertOverlay').classList.remove('active');
}
