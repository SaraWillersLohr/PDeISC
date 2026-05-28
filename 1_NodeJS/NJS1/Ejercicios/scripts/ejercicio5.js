import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { suma, resta, multiplicacion, division } from "../modules/calculos.js";

// Acá obtengo la ruta de la carpeta de este archivo.
// Al usar ES Modules, emulo el comportamiento tradicional de "__dirname" obteniéndola desde "import.meta.url" para que no haya fallas al localizar los estilos CSS.
const __dirname = dirname(fileURLToPath(import.meta.url));

// Acá consolido de manera organizada todos los datos y resultados de los ejercicios anteriores (1 al 4) para poder mostrarlos juntos en mi panel unificado (dashboard), cumpliendo con la consigna 5.
// Ejercicio 1: Guardo las dos líneas de texto exactas que imprimí por terminal.
const e1 = { l1: "Hola mundo desde Node.js", l2: "Fin" };

// Ejercicio 2: Guardo las operaciones aritméticas directas que asigné a variables básicas.
const e2 = [
  { op: "Suma", a: 4, b: 5, res: 4 + 5 },
  { op: "Resta", a: 3, b: 6, res: 3 - 6 },
  { op: "Multiplicación", a: 2, b: 7, res: 2 * 7 },
  { op: "División", a: 20, b: 4, res: 20 / 4 },
];

// Ejercicio 3: Guardo los resultados calculados usando mis funciones internas locales (importando el módulo para calcularlos dinámicamente).
const e3 = [
  { op: "Sumar", a: 4, b: 5, res: suma(4, 5) },
  { op: "Restar", a: 3, b: 6, res: resta(3, 6) },
  { op: "Multiplicar", a: 2, b: 7, res: multiplicacion(2, 7) },
  { op: "Dividir", a: 20, b: 4, res: division(20, 4) },
];

// Ejercicio 4: Guardo los resultados que calculé importando mis funciones del módulo externo "calculos.js".
const e4 = [
  { op: "suma", a: 5, b: 3, res: suma(5, 3) },
  { op: "resta", a: 8, b: 6, res: resta(8, 6) },
  { op: "multiplicación", a: 3, b: 11, res: multiplicacion(3, 11) },
  { op: "división", a: 30, b: 5, res: division(30, 5) },
];

const server = createServer((req, res) => {
  // Intercepto las solicitudes de mis stylesheets para cargárselos dinámicamente al navegador cuando los pida.
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

  // Si no pide estilos, armo la respuesta HTML principal para mostrar mi panel consolidado (dashboard).
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ejercicio 5 - Resumen General - TP NodeJS</title>
        <!-- Cargamos Bootstrap 5 y Bootstrap Icons -->
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
        <!-- Armo mi menú de navegación superior cristalino (Glassmorphism) y responsivo, sin enlaces a otros ejercicios -->
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

        <!-- Contenido principal -->
        <main class="container my-5 flex-grow-1">
          <!-- Banner elegante de presentación para mi Panel General Consolidado -->
          <div class="text-center mb-5">
            <span class="badge bg-primary-subtle text-primary badge-custom mb-3">Ejercicio 5 - Resumen General</span>
            <h1 class="fw-bold tracking-tight mb-2">Dashboard Académico Consolidado</h1>
            <p class="text-secondary fs-5 mx-auto" style="max-width: 700px;">Consolidación estructurada de todos los ejercicios desarrollados en el módulo NJS1 de Node.js.</p>
          </div>

          <div class="row g-4">
            <!-- Ficha correspondiente al Ejercicio 1 (Impresiones básicas por Consola) -->
            <div class="col-12">
              <div class="card card-premium shadow-sm">
                <div class="card-header card-premium-header">
                  <i class="bi bi-terminal-fill fs-5"></i>
                  <span>Ejercicio 1: Consola</span>
                </div>
                <div class="card-body p-4">
                  <p class="mb-2 text-secondary-emphasis">Visualización de las impresiones básicas del ciclo inicial:</p>
                  <div class="d-flex flex-wrap gap-3">
                    <div class="border rounded px-3 py-2 bg-light-subtle d-flex align-items-center gap-2">
                      <span class="badge bg-primary-subtle text-primary badge-custom">Línea 1</span>
                      <code>"${e1.l1}"</code>
                    </div>
                    <div class="border rounded px-3 py-2 bg-light-subtle d-flex align-items-center gap-2">
                      <span class="badge bg-secondary-subtle text-secondary badge-custom">Línea 2</span>
                      <code>"${e1.l2}"</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ficha correspondiente al Ejercicio 2 (Operaciones Aritméticas Directas) -->
            <div class="col-md-6">
              <div class="card card-premium h-100 shadow-sm">
                <div class="card-header card-premium-header">
                  <i class="bi bi-calculator-fill fs-5"></i>
                  <span>Ejercicio 2: Operaciones Directas</span>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-modern mb-0">
                      <thead>
                        <tr>
                          <th>Operación</th>
                          <th>A</th>
                          <th>B</th>
                          <th>Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Recorro mi array e2 e inyecto cada fila dinámicamente en mi tabla premium -->
                        ${e2.map(o => `
                          <tr>
                            <td><span class="badge bg-light-subtle text-dark-emphasis border badge-custom">${o.op}</span></td>
                            <td>${o.a}</td>
                            <td>${o.b}</td>
                            <td class="fw-bold text-primary">${o.res}</td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ficha correspondiente al Ejercicio 3 (Resolución encapsulada en Funciones Locales) -->
            <div class="col-md-6">
              <div class="card card-premium h-100 shadow-sm">
                <div class="card-header card-premium-header">
                  <i class="bi bi-cpu-fill fs-5"></i>
                  <span>Ejercicio 3: Funciones Locales</span>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-modern mb-0">
                      <thead>
                        <tr>
                          <th>Función</th>
                          <th>A</th>
                          <th>B</th>
                          <th>Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Recorro mi array e3 e inyecto cada fila dinámicamente con los resultados calculados por mis funciones internas -->
                        ${e3.map(o => `
                          <tr>
                            <td><span class="badge bg-light-subtle text-dark-emphasis border badge-custom">${o.op}</span></td>
                            <td>${o.a}</td>
                            <td>${o.b}</td>
                            <td class="fw-bold text-primary">${o.res}</td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ficha correspondiente al Ejercicio 4 (Llamado a funciones de mi módulo externo calculos.js) -->
            <div class="col-12">
              <div class="card card-premium shadow-sm">
                <div class="card-header card-premium-header">
                  <i class="bi bi-box-seam-fill fs-5"></i>
                  <span>Ejercicio 4: Módulos Externos (calculos.js)</span>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-modern mb-0">
                      <thead>
                        <tr>
                          <th>Función del Módulo</th>
                          <th>Valor A</th>
                          <th>Valor B</th>
                          <th>Resultado Calculado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Recorro mi array e4 e inyecto las llamadas e importaciones desde mi módulo calculos.js de forma dinámica -->
                        ${e4.map(o => `
                          <tr>
                            <td><code class="text-primary-emphasis fw-semibold">${o.op}(a, b)</code></td>
                            <td>${o.a}</td>
                            <td>${o.b}</td>
                            <td class="fw-bold text-success">${o.res}</td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Footer moderno y prolijo -->
        <footer class="text-center mt-5 text-secondary">
          <div class="container">
            <p class="mb-1 fw-bold">Trabajo Práctico - Programación de Dispositivos e Interconexión de Sistemas de Cómputo</p>
            <p class="mb-0 text-muted"><small>Servidor Ejercicio 5 en http://localhost:3005 | Node.js + CSS Moderno</small></p>
          </div>
        </footer>

        <!-- Botón Volver Arriba -->
        <button id="back-to-top" class="back-to-top" title="Volver arriba">
          <i class="bi bi-arrow-up-short fs-4"></i>
        </button>

        <!-- Scripts de Bootstrap y Tema -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script>
          // Cambiamos el tema del documento
          const toggleBtn = document.getElementById('theme-toggle');
          const themeIcon = document.getElementById('theme-icon');
          const themeText = document.getElementById('theme-text');
          const themeStylesheet = document.getElementById('theme-stylesheet');

          // Cambia el diseño visual de la interfaz según el modo que tenga activo
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

          toggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            updateThemeUI(currentTheme);
          });

          // Lógica para mostrar y programar el botón flotante que sube la pantalla de forma suave y estética
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

// Le ordeno a mi servidor que empiece a escuchar conexiones en el puerto 3005.
// Muestro un aviso por consola indicando que mi panel consolidado (Ejercicio 5) ya está activo.
server.listen(3005, () => {
  console.log("Servidor Ejercicio 5 corriendo en http://localhost:3005");
});
