import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Acá obtengo la ruta de la carpeta donde se encuentra este archivo.
// Al usar ES Modules ("import" en vez de "require"), armo "__dirname" yo mismo usando "import.meta.url".
// Esto me asegura que Node.js ubique las hojas de estilo sin problemas.
const __dirname = dirname(fileURLToPath(import.meta.url));

// Acá calculo las operaciones matemáticas directamente y las guardo en constantes.
// Hago la suma (4+5), la resta (3-6), la multiplicación (2*7) y la división (20/4) tal como pide la consigna 2.
const s = 4 + 5;
const r = 3 - 6;
const m = 2 * 7;
const d = 20 / 4;

// Acá muestro los resultados directamente en la consola de mi servidor para verificar que los cálculos sean correctos.
console.log("Ejercicio 2 - Operaciones directas:");
console.log("4 + 5 = " + s);
console.log("3 - 6 = " + r);
console.log("2 * 7 = " + m);
console.log("20 / 4 = " + d);

// Creo mi servidor nativo HTTP. Esta función escuchará y responderá todas las peticiones del navegador.
const server = createServer((req, res) => {
  // Intercepto las peticiones de archivos CSS para leerlos y enviárselos al navegador con su tipo MIME correspondiente.
  if (req.url.startsWith("/styles.css")) {
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(readFileSync(join(__dirname, "styles.css")));
    return;
  }
  if (req.url.startsWith("/lightmode.css")) {
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(readFileSync(join(__dirname, "lightmode.css")));
    return;
  }
  if (req.url.startsWith("/darkmode.css")) {
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(readFileSync(join(__dirname, "darkmode.css")));
    return;
  }

  // Si no piden estilos, preparo mi respuesta HTML en formato UTF-8 para que las palabras con tildes y caracteres especiales se muestren perfecto.
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ejercicio 2 - TP NodeJS</title>
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
        <!-- Armo mi menú de navegación superior con un diseño cristalino muy elegante -->
        <nav class="navbar navbar-custom sticky-top py-3">
          <div class="container d-flex justify-content-between align-items-center">
            <div class="navbar-brand fw-bold text-primary d-flex align-items-center gap-2">
              <i class="bi bi-journal-code fs-4"></i>
              <span>PDeISC <span class="text-secondary fw-normal">| NodeJS TP1</span></span>
            </div>
            <!-- Botón de cambio de tema claro/oscuro de un solo clic -->
            <button id="theme-toggle" class="theme-toggle-btn">
              <i id="theme-icon" class="bi bi-sun-fill"></i>
              <span id="theme-text">Modo Claro</span>
            </button>
          </div>
        </nav>

        <!-- Mi sección de contenido principal -->
        <main class="container my-5 flex-grow-1">
          <div class="row justify-content-center">
            <div class="col-lg-10">
              <!-- Encabezado del Ejercicio 2 -->
              <div class="text-center mb-5">
                <span class="badge bg-primary-subtle text-primary badge-custom mb-3">Ejercicio 2</span>
                <h1 class="fw-bold tracking-tight mb-2">Operaciones Aritméticas Directas</h1>
                <p class="text-secondary fs-5">Cálculos matemáticos básicos realizados directamente mediante asignación de variables.</p>
              </div>

              <!-- Muestro mis variables calculadas dentro de una tabla Bootstrap premium y estilizada -->
              <div class="card card-premium shadow-sm">
                <div class="card-header card-premium-header">
                  <i class="bi bi-calculator-fill fs-5"></i>
                  <span>Resultados Obtenidos</span>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-modern mb-0">
                      <thead>
                        <tr>
                          <th>Operación</th>
                          <th>Valor A</th>
                          <th>Valor B</th>
                          <th>Expresión</th>
                          <th>Resultado Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span class="badge bg-success-subtle text-success badge-custom"><i class="bi bi-plus-lg me-1"></i>Suma</span></td>
                          <td>4</td>
                          <td>5</td>
                          <td><code>4 + 5</code></td>
                          <td class="fw-bold text-primary">${s}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-danger-subtle text-danger badge-custom"><i class="bi bi-dash-lg me-1"></i>Resta</span></td>
                          <td>3</td>
                          <td>6</td>
                          <td><code>3 - 6</code></td>
                          <td class="fw-bold text-primary">${r}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-warning-subtle text-warning badge-custom"><i class="bi bi-x-lg me-1"></i>Multiplicación</span></td>
                          <td>2</td>
                          <td>7</td>
                          <td><code>2 * 7</code></td>
                          <td class="fw-bold text-primary">${m}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-info-subtle text-info badge-custom"><i class="bi bi-slash-lg me-1"></i>División</span></td>
                          <td>20</td>
                          <td>4</td>
                          <td><code>20 / 4</code></td>
                          <td class="fw-bold text-primary">${d}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Pie de página de mi aplicación -->
        <footer class="text-center mt-5 text-secondary">
          <div class="container">
            <p class="mb-1 fw-bold">Trabajo Práctico - Programación de Dispositivos e Interconexión de Sistemas de Cómputo</p>
            <p class="mb-0 text-muted"><small>Servidor Ejercicio 2 en http://localhost:3002 | Node.js + CSS Moderno</small></p>
          </div>
        </footer>

        <!-- Botón para volver arriba flotante -->
        <button id="back-to-top" class="back-to-top" title="Volver arriba">
          <i class="bi bi-arrow-up-short fs-4"></i>
        </button>

        <!-- Scripts de interacción en el navegador -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script>
          const toggleBtn = document.getElementById('theme-toggle');
          const themeIcon = document.getElementById('theme-icon');
          const themeText = document.getElementById('theme-text');
          const themeStylesheet = document.getElementById('theme-stylesheet');

          // Esta función cambia el diseño de mi página al tema que seleccione.
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

          // Añado un escuchador de eventos para alternar entre los modos claro y oscuro al hacer clic en el botón.
          toggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            updateThemeUI(currentTheme);
          });

          // Lógica para mostrar, ocultar y hacer funcionar el botón flotante de volver arriba con un scroll suave.
          const backToTopBtn = document.getElementById('back-to-top');
          window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
              backToTopBtn.classList.add('show');
            } else {
              backToTopBtn.classList.remove('show');
            }
          });
          
          backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        </script>
      </body>
    </html>
  `);
  res.end();
});

// Le indico a mi servidor que escuche peticiones en el puerto 3002.
// Imprimo un mensaje informando que mi Ejercicio 2 ya está listo.
server.listen(3002, () => {
  console.log("Servidor Ejercicio 2 en http://localhost:3002");
});
