import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Acá obtengo la ruta de la carpeta donde está guardado este archivo actual.
// Como uso ES Modules, emulo el comportamiento de "__dirname" obteniendo la ruta desde "import.meta.url".
// Así me aseguro de que el servidor pueda cargar los archivos de estilos locales sin perderse.
const __dirname = dirname(fileURLToPath(import.meta.url));

// Acá declaro mis propias funciones locales dentro del archivo para realizar las cuatro operaciones básicas, tal como indica la consigna 3.
// Cada función toma dos parámetros ("a" y "b") y retorna el resultado aritmético correspondiente.
function Sumar(a, b) {
  return a + b;
}
function Restar(a, b) {
  return a - b;
}
function Multiplicar(a, b) {
  return a * b;
}
function Dividir(a, b) {
  return a / b;
}

// Acá ejecuto mis funciones locales recién creadas pasándole los valores fijos requeridos por la consigna.
// Los guardo en constantes para poder inyectarlos luego en la tabla HTML de manera dinámica.
const s = Sumar(4, 5);
const r = Restar(3, 6);
const m = Multiplicar(2, 7);
const d = Dividir(20, 4);

// Imprimo los resultados solicitados de "Sumar" y "Dividir" por la consola de mi servidor Node.js para controlar la correcta ejecución en mi terminal.
console.log("Ejercicio 3 - Uso de funciones:");
console.log("Sumar: " + s);
console.log("Dividir: " + d);

// Creo mi servidor HTTP nativo. Esta función se dispara por cada solicitud web que llega de mi puerto.
const server = createServer((req, res) => {
  // Acá intercepto las solicitudes de mis stylesheets para cargarlos manualmente según el tema elegido por el usuario.
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

  // Si no se piden estilos, armo la respuesta HTML principal para mostrar mi página web.
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ejercicio 3 - TP NodeJS</title>
        <!-- Enlazo Bootstrap 5 y Bootstrap Icons -->
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
        <!-- Armo mi barra de navegación con un diseño cristalino muy elegante -->
        <nav class="navbar navbar-custom sticky-top py-3">
          <div class="container d-flex justify-content-between align-items-center">
            <div class="navbar-brand fw-bold text-primary d-flex align-items-center gap-2">
              <i class="bi bi-journal-code fs-4"></i>
              <span>PDeISC <span class="text-secondary fw-normal">| NodeJS TP1</span></span>
            </div>
            <!-- Botón de cambio de tema claro/oscuro -->
            <button id="theme-toggle" class="theme-toggle-btn">
              <i id="theme-icon" class="bi bi-sun-fill"></i>
              <span id="theme-text">Modo Claro</span>
            </button>
          </div>
        </nav>

        <!-- Mi sección principal de contenido -->
        <main class="container-fluid my-5 flex-grow-1">
          <div class="row justify-content-center">
            <div class="col-12">
              <!-- Encabezado del Ejercicio 3 -->
              <div class="text-center mb-5">
                <span class="badge bg-primary-subtle text-primary badge-custom mb-3">Ejercicio 3</span>
                <h1 class="fw-bold tracking-tight mb-2">Funciones Internas (Locales)</h1>
                <p class="text-secondary fs-5">Resolución del cálculo aritmético encapsulado en funciones locales de Javascript.</p>
              </div>

              <!-- Tabla premium donde muestro el nombre de la función invocada, la declaración interna y el resultado final calculado por mis funciones -->
              <div class="card card-premium shadow-sm">
                <div class="card-header card-premium-header">
                  <i class="bi bi-cpu-fill fs-5"></i>
                  <span>Llamada de Funciones Locales</span>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-modern mb-0">
                      <thead>
                        <tr>
                          <th>Función Invocada</th>
                          <th>Valor A</th>
                          <th>Valor B</th>
                          <th>Declaración Interna</th>
                          <th>Resultado Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span class="badge bg-success-subtle text-success badge-custom"><i class="bi bi-code-slash me-1"></i>Sumar(a, b)</span></td>
                          <td>4</td>
                          <td>5</td>
                          <td><code>return a + b;</code></td>
                          <td class="fw-bold text-primary">${s}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-danger-subtle text-danger badge-custom"><i class="bi bi-code-slash me-1"></i>Restar(a, b)</span></td>
                          <td>3</td>
                          <td>6</td>
                          <td><code>return a - b;</code></td>
                          <td class="fw-bold text-primary">${r}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-warning-subtle text-warning badge-custom"><i class="bi bi-code-slash me-1"></i>Multiplicar(a, b)</span></td>
                          <td>2</td>
                          <td>7</td>
                          <td><code>return a * b;</code></td>
                          <td class="fw-bold text-primary">${m}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-info-subtle text-info badge-custom"><i class="bi bi-code-slash me-1"></i>Dividir(a, b)</span></td>
                          <td>20</td>
                          <td>4</td>
                          <td><code>return a / b;</code></td>
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
            <p class="mb-0 text-muted"><small>Servidor Ejercicio 3 en http://localhost:3003 | Node.js + CSS Moderno</small></p>
          </div>
        </footer>

        <!-- Botón flotante para volver arriba -->
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

          // Función para actualizar las clases visuales de Bootstrap y cargar el archivo CSS correcto
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

          // Escucho el clic del usuario en mi botón para alternar el tema al hacer clic
          toggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            updateThemeUI(currentTheme);
          });

          // Control de visibilidad del botón de volver arriba al bajar la pantalla
          const backToTopBtn = document.getElementById('back-to-top');
          window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
              backToTopBtn.classList.add('show');
            } else {
              backToTopBtn.classList.remove('show');
            }
          });
          
          // Al hacer clic, desplazo suavemente hacia arriba
          backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        </script>
      </body>
    </html>
  `);
  res.end();
});

// Levanto mi servidor del Ejercicio 3 en el puerto 3003
server.listen(3003, () => {
  console.log("Servidor Ejercicio 3 en http://localhost:3003");
});
