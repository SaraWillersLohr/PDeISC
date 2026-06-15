// genero la tarjeta del clima con los datos del modulo
export function buildClimaContent(clima) {
  if (clima.error) {
    return `<div class="alert alert-danger alert-glass p-4" role="alert">
              <h4 class="alert-heading d-flex align-items-center gap-2">
                <i class="bi bi-cloud-slash-fill"></i>
                Error de Clima
              </h4>
              <p class="mb-0">${clima.error}</p>
            </div>`;
  }

  const headerClass =
    clima.temperatura > 20 ? "header-warm" : "header-cool";

  return `<article class="glass-card mb-4 mb-lg-0">
            <div class="glass-card-header ${headerClass}">
              <h3>
                <i class="bi bi-cloud-sun-fill"></i>
                Clima API
              </h3>
            </div>
            <div class="glass-card-body text-center">
              <h5 class="clima-lugar">${clima.lugar}</h5>
              <div class="clima-temp">${clima.temperatura}C</div>
              <p class="clima-resumen">${clima.resumen}</p>
              <div class="clima-metrics">
                <div class="metric-box">
                  <div class="metric-label">
                    <i class="bi bi-droplet-half"></i>
                    HUMEDAD
                  </div>
                  <div class="metric-value">${clima.humedad}%</div>
                </div>
                <div class="metric-box">
                  <div class="metric-label">
                    <i class="bi bi-wind"></i>
                    VIENTO
                  </div>
                  <div class="metric-value">${clima.viento} km/h</div>
                </div>
              </div>
            </div>
          </article>`;
}

// genero la tarjeta de calculos con los resultados del modulo
export function buildCalcContent(resultados) {
  const { suma, resta, multiplicacion, division } = resultados;

  return `<article class="glass-card">
            <div class="glass-card-header header-calc">
              <h3>
                <i class="bi bi-calculator-fill"></i>
                Calculos Matematicos
              </h3>
            </div>
            <div class="glass-card-body p-0">
              <ul class="calc-list">
                <li class="calc-item">
                  <span class="calc-label">
                    <i class="bi bi-plus-circle"></i>
                    Suma (10 + 5)
                  </span>
                  <span class="calc-badge badge-suma">${suma}</span>
                </li>
                <li class="calc-item">
                  <span class="calc-label">
                    <i class="bi bi-dash-circle"></i>
                    Resta (20 - 8)
                  </span>
                  <span class="calc-badge badge-resta">${resta}</span>
                </li>
                <li class="calc-item">
                  <span class="calc-label">
                    <i class="bi bi-x-circle"></i>
                    Multiplicacion (4 * 7)
                  </span>
                  <span class="calc-badge badge-mult">${multiplicacion}</span>
                </li>
                <li class="calc-item">
                  <span class="calc-label">
                    <i class="bi bi-slash-circle"></i>
                    Division (100 / 4)
                  </span>
                  <span class="calc-badge badge-div">${division}</span>
                </li>
              </ul>
            </div>
          </article>`;
}

// armo la pagina completa con el contenido dinamico
export function renderPage(climaContent, calcContent) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ejercicio 1 - Clima y Calculos</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link id="theme-css" href="/styles/light.css" rel="stylesheet">
</head>
<body>
  <div class="page-wrapper">
    <header class="dashboard-header container">
      <div>
        <h1 class="page-title">Modulos Propios (Ejercicio 1)</h1>
        <p class="page-subtitle">Componente con modulos de clima y calculo</p>
      </div>
      <button id="theme-toggle" class="btn-theme" type="button">
        <i class="bi bi-moon-stars-fill" id="theme-icon"></i>
        <span id="theme-label">Modo oscuro</span>
      </button>
    </header>

    <main class="container">
      <div class="row g-4 justify-content-center align-items-start">
        <div class="col-12 col-lg-6">
          ${climaContent}
        </div>
        <div class="col-12 col-lg-6">
          ${calcContent}
        </div>
      </div>
    </main>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="/scripts/theme.js"></script>
</body>
</html>`;
}
