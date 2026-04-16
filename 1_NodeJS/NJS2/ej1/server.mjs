import http from "http";
import { getClimaMDP } from "./modules/clima.mjs";
import { sumar, restar, multiplicar, dividir } from "./modules/calculo.mjs";

const server = http.createServer(async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

  const clima = await getClimaMDP();

  let climaContent = "";
  if (clima.error) {
    climaContent = `<div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error de Clima</h4>
                    <p>${clima.error}</p>
                   </div>`;
  } else {
    const isWarm = clima.temperatura > 20;
    const bgColor = isWarm ? "bg-warning text-dark" : "bg-primary text-white";

    climaContent = `
            <div class="card shadow-lg mb-5" style="max-width: 400px; margin: 0 auto;">
                <div class="card-header ${bgColor} text-center">
                    <h3 class="mb-0">${clima.lugar}</h3>
                </div>
                <div class="card-body text-center">
                    <div class="display-1 mb-3">${clima.temperatura}C</div>
                    <p class="card-text text-muted text-uppercase fw-bold">${clima.resumen}</p>
                    <hr>
                    <div class="row">
                        <div class="col-6 border-end">
                            <small class="text-muted d-block">HUMEDAD</small>
                            <span class="h5">${clima.humedad}%</span>
                        </div>
                        <div class="col-6">
                            <small class="text-muted d-block">VIENTO</small>
                            <span class="h5">${clima.viento} <small>km/h</small></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  const calcContent = `
        <div class="card shadow-lg" style="max-width: 400px; margin: 0 auto;">
            <div class="card-header bg-dark text-white text-center">
                <h3 class="mb-0">Calculos Matematicos</h3>
            </div>
            <div class="card-body">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Suma (10 + 5)
                        <span class="badge bg-success rounded-pill fs-6">${sumar(10, 5)}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Resta (20 - 8)
                        <span class="badge bg-danger rounded-pill fs-6">${restar(20, 8)}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Multiplicacion (4 * 7)
                        <span class="badge bg-info text-dark rounded-pill fs-6">${multiplicar(4, 7)}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Division (100 / 4)
                        <span class="badge bg-primary rounded-pill fs-6">${dividir(100, 4)}</span>
                    </li>
                </ul>
            </div>
        </div>
    `;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ejercicio 1 - Clima y Calculos</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { 
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: 40px 0;
            }
        </style>
    </head>
    <body>
        <div class="container text-center">
            <h1 class="mb-5 text-secondary fw-light">Modulos Propios (Ejercicio 1)</h1>
            <div class="row g-4 justify-content-center">
                <div class="col-12 col-lg-6">
                    ${climaContent}
                </div>
                <div class="col-12 col-lg-6">
                    ${calcContent}
                </div>
            </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>`;

  res.end(html);
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`--- Tarea 1: Modulos Propios (Clima y Calculos) ---`);
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
