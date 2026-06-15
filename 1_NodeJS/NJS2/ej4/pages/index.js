// genero la pagina con el texto original y el procesado
export function renderPage(textoOriginal, textoProcesado) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tarea 4: NPM UpperCase</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link id="theme-css" href="/styles/light.css" rel="stylesheet">
</head>
<body>
  <div class="page-wrapper">
    <header class="dashboard-header">
      <div>
        <h1 class="page-title">Tarea 4 - Paquete NPM</h1>
        <p class="page-subtitle">
          Demostracion del paquete externo <strong>upper-case</strong> instalado con NPM.
        </p>
      </div>
      <button id="theme-toggle" class="btn-theme" type="button">
        <i class="bi bi-moon-stars-fill" id="theme-icon"></i>
        <span id="theme-label">Modo oscuro</span>
      </button>
    </header>

    <main class="content-grid">
      <section class="glass-card">
        <div class="glass-card-body">
          <div class="icon-main">
            <i class="bi bi-type"></i>
          </div>
          <h2 class="card-heading">Transformacion de texto</h2>

          <div class="text-box">
            <span class="text-label">
              <i class="bi bi-file-text"></i>
              Texto original
            </span>
            <p class="text-value">"${textoOriginal}"</p>
          </div>

          <div class="arrow-divider">
            <i class="bi bi-arrow-down-circle"></i>
          </div>

          <div class="text-box text-box-result">
            <span class="text-label">
              <i class="bi bi-capslock-fill"></i>
              Texto procesado
            </span>
            <p class="text-value text-value-result">${textoProcesado}</p>
          </div>
        </div>
      </section>

      <aside class="glass-card">
        <div class="glass-card-body">
          <h3 class="side-title">Detalle del paquete</h3>

          <div class="package-box">
            <span class="package-label">Paquete utilizado</span>
            <span class="package-name">
              <i class="bi bi-box-seam"></i>
              upper-case
            </span>
          </div>

          <p class="side-text">
            El modulo <strong>texto.js</strong> importa el paquete desde
            <strong>node_modules</strong> y convierte el texto a mayusculas.
          </p>

          <span class="npm-badge">
            <i class="bi bi-npm"></i>
            Procesado mediante paquete instalado con NPM
          </span>
        </div>
      </aside>
    </main>
  </div>

  <script src="/scripts/theme.js"></script>
</body>
</html>`;
}
