import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Acá obtengo la ruta de la carpeta donde está guardado este archivo.
// Como uso módulos modernos de ES (ESM), no existe la variable "__dirname" por defecto, así que la armo yo de esta manera con "import.meta.url".
// Esto me asegura que Node.js encuentre siempre mis archivos CSS locales sin importar desde dónde corra el comando.
const __dirname = dirname(fileURLToPath(import.meta.url));

// Acá imprimo en la consola de mi servidor las dos líneas exactamente como me lo pide la consigna 1.
console.log("Hola mundo desde Node.js");
console.log("Fin");

// Acá creo mi servidor web nativo con el módulo HTTP de Node.js.
// Cada vez que alguien entra a la página, esta función recibe la petición ("req") y prepara la respuesta ("res").
const server = createServer((req, res) => {
  // Acá intercepto las peticiones de mis archivos CSS.
  // Como Node.js básico no sirve archivos estáticos solos, yo tengo que leerlos con "readFileSync" y enviárselos al navegador con el tipo de contenido correcto.
  if (req.url.startsWith("/styles.css")) {
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(readFileSync(join(__dirname, "..", "styles", "styles.css")));
    return;
  }
  if (req.url.startsWith("/lightmode.css")) {
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(readFileSync(join(__dirname, "..", "styles", "lightmode.css")));
    return;
  }
  if (req.url.startsWith("/darkmode.css")) {
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(readFileSync(join(__dirname, "..", "styles", "darkmode.css")));
    return;
  }

  // Si la petición no es de estilos, significa que quieren ver la página.
  // Entonces, preparo el encabezado de mi respuesta indicando que voy a mandar un documento HTML con codificación UTF-8 (para que se vean bien los acentos).
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ejercicio 1 - TP NodeJS</title>
        <!-- Enlazo la hoja de estilos de Bootstrap 5 y la librería oficial de iconos desde una red de distribución (CDN) -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
        <script>
          // Acá yo leo del almacenamiento local ("localStorage") de este puerto si hay algún tema guardado.
          // Si no hay nada, por defecto uso el modo claro ("light").
          // Como ahora cada ejercicio está separado de forma independiente, no busco parámetros de tema en la URL.
          const savedTheme = localStorage.getItem('theme') || 'light';
          
          // Escribo dinámicamente en el documento la hoja de estilos correspondiente antes de que se dibuje nada.
          // Esto soluciona por completo el destello raro (parpadeo blanco) cuando tenemos activado el modo oscuro.
          document.write('<link id="theme-stylesheet" rel="stylesheet" href="/' + savedTheme + 'mode.css">');
        </script>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <!-- Armo mi barra de navegación superior con un diseño cristalino muy elegante -->
        <nav class="navbar navbar-custom sticky-top py-3">
          <div class="container d-flex justify-content-between align-items-center">
            <div class="navbar-brand fw-bold text-primary d-flex align-items-center gap-2">
              <i class="bi bi-journal-code fs-4"></i>
              <span>PDeISC <span class="text-secondary fw-normal">| NodeJS TP1</span></span>
            </div>
            <!-- Este botón interactivo me sirve para que el usuario pueda alternar entre modo claro y modo oscuro con un solo clic -->
            <button id="theme-toggle" class="theme-toggle-btn">
              <i id="theme-icon" class="bi bi-sun-fill"></i>
              <span id="theme-text">Modo Claro</span>
            </button>
          </div>
        </nav>

        <!-- Acá adentro coloco todo el contenido principal de mi página -->
        <main class="container-fluid my-5 flex-grow-1">
          <div class="row justify-content-center">
            <div class="col-12">
              <!-- Encabezado del Ejercicio 1 -->
              <div class="text-center mb-5">
                <span class="badge bg-primary-subtle text-primary badge-custom mb-3">Ejercicio 1</span>
                <h1 class="fw-bold tracking-tight mb-2">Salida por Consola en Node.js</h1>
                <p class="text-secondary fs-5">Impresión básica de mensajes en la terminal del sistema al iniciar el servidor.</p>
              </div>

              <!-- Diseño una tarjeta moderna imitando una terminal de sistema para mostrar las líneas que salieron por la consola del servidor -->
              <div class="card card-premium shadow-sm">
                <div class="card-header card-premium-header">
                  <i class="bi bi-terminal-fill fs-5"></i>
                  <span>Consola de Ejecución</span>
                </div>
                <div class="card-body p-4">
                  <div class="alert alert-info border-0 shadow-sm d-flex gap-3 mb-4 rounded-3">
                    <i class="bi bi-info-circle-fill fs-4 text-info"></i>
                    <div>
                      <strong>Nota del evaluador:</strong> Este ejercicio ejecuta las instrucciones en la consola del servidor de Node.js al levantar el archivo. A continuación se muestran de forma prolija e interactiva las líneas impresas.
                    </div>
                  </div>

                  <div class="list-group list-group-flush border rounded-3 overflow-hidden">
                    <div class="list-group-item d-flex justify-content-between align-items-center p-3">
                      <div>
                        <span class="badge bg-success-subtle text-success badge-custom me-2">Línea 1</span>
                        <code class="fs-5 text-dark-emphasis">"Hola mundo desde Node.js"</code>
                      </div>
                      <i class="bi bi-check-circle-fill text-success fs-5"></i>
                    </div>
                    <div class="list-group-item d-flex justify-content-between align-items-center p-3">
                      <div>
                        <span class="badge bg-secondary-subtle text-secondary badge-custom me-2">Línea 2</span>
                        <code class="fs-5 text-dark-emphasis">"Fin"</code>
                      </div>
                      <i class="bi bi-check-circle-fill text-success fs-5"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Defino el pie de página de mi aplicación con la información de la materia y el servidor actual -->
        <footer class="text-center mt-5 text-secondary">
          <div class="container">
            <p class="mb-1 fw-bold">Trabajo Práctico - Programación de Dispositivos e Interconexión de Sistemas de Cómputo</p>
            <p class="mb-0 text-muted"><small>Servidor Ejercicio 1 en http://localhost:3001 | Node.js + CSS Moderno</small></p>
          </div>
        </footer>

        <!-- Coloco un botón flotante y discreto que solo aparece al bajar en la página para volver arriba de un solo clic de forma suave -->
        <button id="back-to-top" class="back-to-top" title="Volver arriba">
          <i class="bi bi-arrow-up-short fs-4"></i>
        </button>

        <!-- Importo el JavaScript de Bootstrap para que funcionen cosas interactivas -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script>
          const toggleBtn = document.getElementById('theme-toggle');
          const themeIcon = document.getElementById('theme-icon');
          const themeText = document.getElementById('theme-text');
          const themeStylesheet = document.getElementById('theme-stylesheet');

          // Con esta función cambio visualmente la interfaz de la página cuando elijo un tema.
          // Modifico el icono, el texto del botón y cambio el archivo CSS de estilos dinámicamente.
          function updateThemeUI(theme) {
            if (theme === 'dark') {
              themeIcon.className = 'bi bi-moon-stars-fill text-warning';
              themeText.textContent = 'Modo Oscuro';
              themeStylesheet.setAttribute('href', '/darkmode.css');
            } else {
              themeIcon.className = 'bi bi-sun-fill text-warning';
              themeText.textContent = 'Modo Claro';
              themeStylesheet.setAttribute('href', '/lightmode.css');
            }
          }

          // Al cargar la página, leo de mi localStorage qué tema tengo guardado para este ejercicio.
          // Por defecto arranco en modo claro ("light") si es la primera vez que entro.
          let currentTheme = localStorage.getItem('theme') || 'light';
          updateThemeUI(currentTheme);

          // Configuro un detector de eventos ("listener") para que al hacer clic en mi botón de tema cambie entre "light" y "dark" de forma instantánea.
          toggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            updateThemeUI(currentTheme);
          });

          // Hago que mi botón de volver arriba aparezca mágicamente solo si el usuario scrolleó más de 300 píxeles hacia abajo.
          const backToTopBtn = document.getElementById('back-to-top');
          window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
              backToTopBtn.classList.add('show');
            } else {
              backToTopBtn.classList.remove('show');
            }
          });
          
          // Si hacen clic en ese botón, los subo hasta arriba del todo de manera suave y con una transición muy prolija.
          backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        </script>
      </body>
    </html>
  `);
  res.end();
});

// Finalmente, le digo a mi servidor que empiece a escuchar conexiones en el puerto 3001.
// Muestro un mensaje por consola para saber que ya está corriendo en http://localhost:3001.
server.listen(3001, () => {
  console.log("Servidor Ejercicio 1 en http://localhost:3001");
});
