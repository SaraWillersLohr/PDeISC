# explicación del proyecto: ahorcado técnico

## introducción

para este trabajo final desarrollé un juego de ahorcado con temática técnica usando javascript modular en el frontend y node.js con express en el backend. la idea principal fue crear algo que tuviera sentido dentro de la escuela técnica: que las palabras que el jugador tiene que adivinar pertenezcan a las especialidades que se enseñan acá.

---

## objetivo

el objetivo del proyecto fue crear un juego completo de "el ahorcado" que cumpla con todos los requisitos de la consigna: usar arrays, clases, apis, fetch, una base de datos mysql y permitir guardar y visualizar los scores de los jugadores. también tenía que tener un diseño prolijo, ser responsive y tener modo oscuro.

---

## tecnologías utilizadas

- **javascript (es modules)**: usé módulos para separar bien la lógica
- **node.js + express**: para el servidor y las apis del backend
- **mysql2**: para conectarme a la base de datos
- **jspdf**: para generar el pdf con el ranking
- **lucide icons**: para los íconos de la interfaz
- **css custom properties**: para manejar los temas claro y oscuro
- **google fonts**: tipografías outfit y montserrat

---

## estructura del proyecto

```
js6-ahorcado/
├── pages/
│   └── index.html          → página principal del juego
├── scripts/
│   ├── main.js             → punto de entrada, orquesta todo
│   └── modules/
│       ├── api.js          → todas las llamadas fetch al backend
│       ├── juego.js        → clase JuegoAhorcado con la lógica
│       ├── jugador.js      → clase Jugador
│       ├── score.js        → clase Score
│       ├── render.js       → funciones que actualizan el DOM
│       ├── eventos.js      → manejo de interacciones y teclado
│       ├── teclado.js      → creación del teclado virtual
│       ├── ranking.js      → carga y muestra la tabla de posiciones
│       ├── validaciones.js → validación del nombre del jugador
│       └── pdf.js          → descarga del pdf con el ranking
├── styles/
│   ├── main.css            → estilos principales y responsive
│   ├── light.css           → variables del tema claro
│   └── dark.css            → variables del tema oscuro
├── context/
│   └── theme.js            → manejo del tema con localStorage
├── data/
│   ├── informatica.json    → 25 palabras de informática
│   ├── electronica.json    → 25 palabras de electrónica
│   └── mmo.json            → 25 palabras de maestro mayor de obras
├── database/
│   ├── conexion.js         → pool de conexión mysql2
│   └── score.sql           → script para crear la tabla
├── server.js               → servidor express con todas las rutas
└── package.json
```

---

## funcionamiento

al abrir el juego, el jugador elige una especialidad usando los botones visuales (informática, electrónica o maestro mayor de obras). cuando hace click en uno, el frontend llama a la api del backend usando fetch, que a su vez lee el archivo json correspondiente y devuelve una palabra aleatoria con su pista.

el jugador tiene que adivinar la palabra letra por letra usando el teclado virtual que aparece en pantalla o su teclado físico. tiene 6 intentos antes de perder. si adivina una letra correcta gana 10 puntos, y si completa la palabra suma 100 puntos más. la horca se va armando de forma acumulativa con cada error: primero aparece la cabeza, después el cuerpo, los brazos y las piernas.

cuando el jugador gana aparece un modal con la opción de seguir jugando (sin perder los puntos acumulados ni el tiempo) o guardar el score. si pierde, puede volver a empezar o también guardar el score. si se acaban todas las palabras de la especialidad, aparece un aviso para elegir otra especialidad o guardar el score.

---

## api de palabras

las palabras no están escritas directamente en el código. cuando el jugador elige una especialidad, el frontend llama a `/api/palabra/:especialidad` pasando las palabras ya jugadas como parámetro para que no se repitan. el servidor lee el json de la especialidad, filtra las que ya se jugaron y devuelve una al azar. si no quedan más palabras disponibles, devuelve `{ fin: true }`.

---

## base de datos

usé mysql para guardar los scores de los jugadores. la base de datos se llama `Score` y tiene una tabla `score` con los campos:

| campo | tipo | descripción |
|-------|------|-------------|
| id | int auto_increment | identificador único |
| nombre | varchar(100) | nombre del jugador |
| tiempo | int | tiempo en segundos |
| puntos | int | puntos obtenidos |
| fecha | datetime | fecha y hora del registro |
| especialidad | varchar(50) | especialidad jugada |

para conectarme usé `mysql2` con un pool de conexiones. el backend valida todos los datos antes de insertarlos: que el nombre tenga entre 3 y 20 caracteres, que la especialidad sea válida y que el tiempo y los puntos sean números positivos.

---

## ranking

la tabla de posiciones se carga automáticamente cuando abre la página y se actualiza también cada vez que se guarda un score nuevo. el orden es por puntos de mayor a menor y en caso de empate por tiempo de menor a mayor (menos tiempo es mejor). los tres primeros puestos tienen medallas: 🥇 🥈 🥉.

---

## pdf

el botón "descargar pdf" genera un archivo pdf usando la librería jspdf con la tabla completa del ranking. el pdf tiene el título "ranking oficial - ahorcado técnico" con colores institucionales (verde #386e14 y rojo #d81e1e), la fecha de generación, y una tabla con nombre, especialidad, puntos, tiempo y fecha de cada entrada. si el ranking tiene muchas filas, el pdf agrega páginas automáticamente.

---

## dificultades encontradas

una de las partes que más me costó fue el manejo de las tildes. si la palabra tiene una `ó` y el jugador apreta `O`, tiene que contar como acierto. para resolver eso normalicé los caracteres usando `normalize("NFD")` y eliminé los diacríticos con una expresión regular. de esta forma la comparación siempre es sin acento pero la palabra se sigue mostrando con las tildes originales.

otra dificultad fue el responsive para mobile. tuve que hacer media queries específicas para portrait y landscape, y también agregar un aviso para que el usuario gire el dispositivo, aunque pueda ignorarlo y seguir jugando igual.

también me costó entender bien cómo funcionan los módulos es en el navegador con el servidor de express, porque los imports tienen que usar rutas absolutas desde la raíz del servidor.

---

## conclusión

creo que el proyecto cumple con todo lo que pedía la consigna. aprendí a separar responsabilidades usando módulos, a conectar el frontend con una base de datos a través de una api rest, y a manejar el estado de una aplicación de forma más ordenada usando clases. me quedé contento con el diseño final y con que el juego funcione de punta a punta: desde elegir la especialidad hasta guardar el score y verlo en el ranking.

---

## solución rápida para errores de carga de recursos / iconos

Si ves que los íconos no aparecen o la página queda sin poder interactuar, probá estos pasos en el orden indicado:

- **Abrir DevTools (Console / Network)**: buscá errores tipo `ReferenceError`, `404` o `ERR_BLOCKED_BY_CLIENT`. Estos diagnósticos te dirán si falta un archivo, hay un error JS, o un bloqueador está cortando peticiones.
- **Arrancar el servidor local** (desde la raíz del proyecto) si abriste el HTML con `file://`. En la terminal:

```bash
cd "C:\Users\Sara Willers\Desktop\PDeISC\2_JS\JS6-ahorcado"
node server.js
```

- **Comprobar rutas de imports y assets**: el proyecto usa rutas desde la raíz (`/scripts/main.js`, `/styles/...`, `/assets/...`). Si abrís el archivo sin servidor, esas rutas fallan. Alternativa: convertirlas a relativas o servir con `node server.js`.
- **Ver si un adblock u otra extensión bloquea peticiones externas** (por ejemplo a `unpkg.com` o `api-js.mixpanel`). Si ves `ERR_BLOCKED_BY_CLIENT` en Network, deshabilitá el bloqueador para `localhost` o usá versiones locales de las librerías.
- **Verificar inicializaciones en la consola**: por ejemplo `lucide.createIcons()` y funciones del contexto (p. ej. `cargarTema`) deben existir. Si aparece `ReferenceError: cargarTema is not defined`, revisá que `scripts/main.js` importe `../context/theme.js` correctamente y que la etiqueta `<link id="themeStylesheet">` exista en el `head`.
- **Si los SVG de Lucide se ven sin estilo**: inspeccioná el DOM — Lucide reemplaza `<i data-lucide="..."></i>` por `<svg>`. Asegurate que tus reglas CSS afecten a `svg` además de a `i`, p. ej.:

```css
.esp-icon i, .esp-icon svg { width: 18px; height: 18px; color: var(--text-muted); }
```

- **Solución alternativa (evitar CDNs bloqueados)**: descargá la versión de Lucide y colocala en `assets/libs/lucide.min.js` y referenciala desde `pages/index.html` con una ruta local (`/assets/libs/lucide.min.js`). De este modo no dependés de la conexión ni de bloqueadores.

Si querés, puedo añadir al repositorio una copia local de Lucide y actualizar `pages/index.html` automáticamente — confirmame si lo hago.
