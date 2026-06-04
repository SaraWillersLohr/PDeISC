# MSGames — Explicación Técnica y Arquitectura del Proyecto

Este documento detalla el diseño, la arquitectura y las decisiones de ingeniería implementadas en la plataforma de videojuegos **MSGames** para cumplir con los requerimientos obligatorios de la materia.

---

## 🚀 Arquitectura General del Proyecto

El proyecto se estructura bajo una separación limpia de responsabilidades (Modularización), donde el backend actúa como la autoridad máxima del estado de los juegos y el frontend se encarga del renderizado y el envío de entradas de usuario.

```
/ (raíz del proyecto)
├── server.js                        # Inicialización de Express, Socket.io y enrutamiento HTTP
├── package.json                     # Scripts y dependencias (express, socket.io)
├── data/
│   └── leaderboard.json             # Persistencia JSON de puntuaciones locales y online
├── modules/                         # Lógica pura del Backend (Node.js)
│   ├── rooms/
│   │   └── roomManager.js           # Orquestación de salas de juego (máximo 2 jugadores)
│   ├── sockets/
│   │   └── socketHandler.js         # Escucha y despacho de eventos en tiempo real
│   ├── games/
│   │   ├── pacmanGame.js            # Motor del juego "Escape Escolar" (cooperativo)
│   │   └── snakeGame.js             # Motor del juego "Cable Rush" (competitivo)
│   └── leaderboard/
│       └── leaderboardManager.js    # Lectura, escritura y validación de clasificaciones
└── public/                          # Archivos estáticos servidos al cliente (Frontend)
    ├── pages/                       # Vistas HTML semánticas y validadas
    │   ├── index.html               # Launcher de selección de juego
    │   ├── lobby.html               # Lobby de selección de modo, personaje y salas online
    │   ├── pacman.html              # Pantalla de Escape Escolar
    │   ├── snake.html               # Pantalla de Cable Rush
    │   └── leaderboard.html         # Scoreboard dinámico (TOP 10)
    ├── styles/                      # Hojas de estilo y variables HSL para Neon Glow
    │   ├── shared.css               # Diseño base y controles táctiles
    │   ├── dark/
    │   │   └── dark.css             # Tema oscuro (Cyberpunk)
    │   └── light/
    │       └── light.css            # Tema claro (Neon de día)
    └── scripts/                     # Controladores y renderizadores del cliente
        ├── shared/
        │   ├── theme.js             # Gestor del tema persistente en localStorage
        │   ├── audio.js             # Sintetizador de audio retro (Web Audio API)
        │   └── socket-client.js     # Integración de lobby online
        ├── pacman/
        │   ├── renderer.js          # Dibujo del mapa, Sara, Male y directivos en Canvas
        │   └── client-pacman.js     # Loop local / Envío de movimientos
        └── snake/
            ├── renderer.js          # Dibujo de cables de red y powerups en Canvas
            └── client-snake.js      # Loop local / Envío de movimientos
```

---

## 📡 Sockets y Sincronización Realtime (Socket.IO)

### El Servidor es la Verdad
Para evitar trampas (cheats) y asegurar una sincronización fluida entre dispositivos, el cliente **nunca** define la posición absoluta de su personaje en partidas multijugador online.

1. **Flujo de Inputs:** El cliente captura la dirección presionada (`W`, `A`, `S`, `D`, gestos táctiles o botones virtuales en móvil) y emite un evento `playerMove` al servidor enviando únicamente la dirección (`'UP'`, `'DOWN'`, `'LEFT'`, `'RIGHT'`).
2. **Procesamiento de Ticks:** El servidor ejecuta el bucle de juego autoritativo a intervalos regulares, calcula el movimiento en base a la matriz del mapa, valida que no haya paredes y actualiza la posición física.
3. **Broadcast de Estado:** Al finalizar cada tick de cálculo, el servidor emite un evento `gameState` conteniendo las coordenadas y estados de todos los jugadores y enemigos a los sockets conectados a la sala.
4. **Dibujo Dinámico:** El cliente recibe el objeto de estado y dibuja sobre el Canvas las posiciones finales.

### Sistema de Salas (Matchmaking)
El backend mantiene en memoria el estado de todas las salas usando el módulo `roomManager.js`.
- Las salas se identifican con un código alfanumérico único de 4 letras generado de forma pseudo-aleatoria (ej. `ABCD`).
- Cada sala contiene una lista de jugadores (máximo 2), el estado actual de conexión, y una instancia en ejecución del motor del juego (`PacmanGame` o `SnakeGame`).
- La comunicación se segmenta usando salas privadas de Socket.IO (`socket.join(roomCode)` y `io.to(roomCode).emit()`). Esto evita sobrecargar a clientes externos con paquetes de partidas ajenas.
- Al desconectarse un jugador, se destruye la sala (si queda vacía) o se restablece al lobby notificando al rival para evitar salas zombies en memoria.

---

## 🧱 Sistema de Grid (Mapas por Código)

Los mapas de Escape Escolar no son imágenes estáticas. Esto permite realizar colisiones exactas de forma matemática, simplifica el envío de datos por sockets y optimiza la IA.
Los mapas se modelan como matrices bidimensionales:

```javascript
const mapa = [
  [1, 1, 1, 1, 1],
  [1, 3, 2, 2, 1],
  [1, 2, 1, 2, 1],
  [1, 2, 7, 2, 1],
  [1, 1, 1, 1, 1]
]
```

### Representación de Baldosas:
- `1` → Pared sólida (muros neon).
- `0` → Pasillo libre.
- `2` → Puntito normal (+10 pts).
- `3` → Hora Libre (Power pellet que vulnera directivos).
- `7` → Zona de aparición segura (exclusiva de directivos Lorena, Scaglione y Esteban).

### Colisiones e IA de Directivos
- **Alineación al Grid:** Tanto los jugadores como los fantasmas avanzan de celda a celda. Cuando se encuentran en el centro de una baldosa se comprueba si la dirección elegida está libre de paredes (`1`).
- **Lorena (Vicedirectora):** Persigue de manera agresiva calculando en cada intersección cuál de los caminos válidos minimiza la distancia directa hacia el jugador más cercano.
- **Scaglione (Director):** Patrulla las esquinas de la escuela de forma regular o elige caminos aleatorios en base al temporizador del juego.
- **Esteban (Jefe de Área):** Calcula la dirección actual del jugador e intenta interceptarlo posicionando su objetivo dos baldosas por delante de la trayectoria actual del usuario.
- **Hora Libre (Frightened):** Los directivos cambian su color a azul brillante y en cada baldosas eligen trayectorias puramente aleatorias para escapar de los jugadores.

---

## 🔄 Bucles de Juego (Game Loops)

- **Escape Escolar (PacMan):** El bucle corre a **30 FPS** (33ms por ciclo). Esta tasa permite un control reactivo y suave en el Canvas al mover decimalmente la posición del personaje hacia la baldosa objetivo.
- **Cable Rush (Snake):** Funciona a **10 FPS** (100ms por ciclo), velocidad ideal para el desplazamiento tradicional de Snake celda por celda. Cuando el powerup de Overclock está activo, el cable pasa a moverse cada tick, duplicando su velocidad frente a los rivales que avanzan en ticks alternados.

---

## 💾 Persistencia de Datos e Historial

El módulo `leaderboardManager.js` administra los archivos de persistencia:
- Almacenamiento directo en el servidor mediante un archivo estructurado JSON en `/data/leaderboard.json`.
- Al finalizar una partida (sea local u online), se envía el registro que incluye el **nombre, personaje, puntuación, fecha de la partida, duración y si hubo victoria**.
- El servidor lee las puntuaciones, las añade, las ordena descendentemente por puntaje y guarda el historial.
- El endpoint `GET /api/leaderboard/:game` filtra y devuelve únicamente el **TOP 10** de clasificaciones para el renderizado del front.

---

## 🛡️ Validaciones en 3 Niveles

1. **HTML5 Frontend:** Formularios con validación en tiempo de entrada usando atributos obligatorios de la cátedra: `required`, `minlength="3"`, `maxlength="10"`, `pattern` (expresiones regulares para nickname alfanumérico) y `type`.
2. **JavaScript Frontend:** Antes de enviar o conectarse a salas, el cliente verifica las restricciones lógicas: que el personaje no esté vacío, que el código de sala tenga formato `^[A-Z]{4}$`, y despliega popups modales diseñados con alertas personalizadas si hay errores.
3. **Servidor Backend:** Node.js valida cada paquete entrante de socket y petición POST. Si el nombre no cumple las reglas o si el personaje no corresponde con el juego seleccionado, la acción es rechazada y se envía un mensaje de error por socket (`errorMsg`), protegiendo al servidor contra inyecciones y clientes alterados.
