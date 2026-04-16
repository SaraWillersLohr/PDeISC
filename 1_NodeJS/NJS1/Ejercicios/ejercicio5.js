import { createServer } from "node:http";
import { suma, resta, multiplicacion, division } from "./calculos.js";

const e1_linea1 = "Hola mundo desde Node.js";
const e1_linea2 = "Fin";

const e2_op = [
  { op: "Suma", a: 4, b: 5, res: 4 + 5 },
  { op: "Resta", a: 3, b: 6, res: 3 - 6 },
  { op: "Multiplicación", a: 2, b: 7, res: 2 * 7 },
  { op: "División", a: 20, b: 4, res: 20 / 4 },
];

function sumarE3(a, b) {
  return a + b;
}
function restarE3(a, b) {
  return a - b;
}
function multE3(a, b) {
  return a * b;
}
function divE3(a, b) {
  return a / b;
}

const e3_op = [
  { op: "Sumar", a: 4, b: 5, res: sumarE3(4, 5) },
  { op: "Restar", a: 3, b: 6, res: restarE3(3, 6) },
  { op: "Multiplicar", a: 2, b: 7, res: multE3(2, 7) },
  { op: "Dividir", a: 20, b: 4, res: divE3(20, 4) },
];

const e4_op = [
  { op: "suma", a: 5, b: 3, res: suma(5, 3) },
  { op: "resta", a: 8, b: 6, res: resta(8, 6) },
  { op: "multiplicacion", a: 3, b: 11, res: multiplicacion(3, 11) },
  { op: "division", a: 30, b: 5, res: division(30, 5) },
];

console.log("=== Resultados de Ejercicios 1-4 ===");
console.log("Ej 1:", e1_linea1, "-", e1_linea2);
console.log(
  "Ej 2 (Directo):",
  e2_op.map((o) => `${o.op}: ${o.res}`).join(", "),
);
console.log(
  "Ej 3 (Funciones):",
  e3_op.map((o) => `${o.op}: ${o.res}`).join(", "),
);
console.log("Ej 4 (Módulo):", e4_op.map((o) => `${o.op}: ${o.res}`).join(", "));

const server = createServer((req, res) => {
  const html = `
  <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resumen de Ejercicios</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body { background-color: #f0f2f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 1000px; }
        .card { border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: transform 0.2s; }
        .card:hover { transform: translateY(-5px); }
        .card-header { border-radius: 12px 12px 0 0 !important; font-weight: bold; background-color: #0d6efd; color: white; padding: 15px; }
        .header-e1 { background-color: #6c757d; }
        .header-e2 { background-color: #198754; }
        .header-e3 { background-color: #fd7e14; }
        .header-e4 { background-color: #0dcaf0; }
        h1 { color: #333; margin-bottom: 40px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .table thead th { background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; color: #555; }
        .result-badge { font-weight: bold; color: #0d6efd; }
      </style>
    </head>
    <body class="p-5">
        <div class="container">
          <h1 class="text-center">Panel de Control Node.js</h1>
          
          <div class="row g-4">
            <!-- Ejercicio 1 -->
            <div class="col-md-12">
              <div class="card">
                <div class="card-header header-e1">Ejercicio 1: Mensajes de Consola</div>
                <div class="card-body">
                  <div class="d-flex justify-content-around">
                    <div class="p-3 border rounded bg-light"><strong>Línea 1:</strong> "${e1_linea1}"</div>
                    <div class="p-3 border rounded bg-light"><strong>Línea 2:</strong> "${e1_linea2}"</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ejercicio 2 -->
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-header header-e2">Ejercicio 2: Operaciones Directas</div>
                <div class="card-body p-0">
                  <table class="table table-hover mb-0 text-center">
                    <thead>
                      <tr><th>Operación</th><th>a</th><th>b</th><th>Resultado</th></tr>
                    </thead>
                    <tbody>
                      ${e2_op.map((o) => `<tr><td>${o.op}</td><td>${o.a}</td><td>${o.b}</td><td class="result-badge">${o.res}</td></tr>`).join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Ejercicio 3 -->
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-header header-e3">Ejercicio 3: Funciones Internas</div>
                <div class="card-body p-0">
                  <table class="table table-hover mb-0 text-center">
                    <thead>
                      <tr><th>Operación</th><th>a</th><th>b</th><th>Resultado</th></tr>
                    </thead>
                    <tbody>
                      ${e3_op.map((o) => `<tr><td>${o.op}</td><td>${o.a}</td><td>${o.b}</td><td class="result-badge">${o.res}</td></tr>`).join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Ejercicio 4 -->
            <div class="col-md-12">
              <div class="card">
                <div class="card-header header-e4">Ejercicio 4: Módulo Externo (calculos.js)</div>
                <div class="card-body p-0">
                  <table class="table table-hover mb-0 text-center">
                    <thead>
                      <tr><th>Operación</th><th>a</th><th>b</th><th>Resultado</th></tr>
                    </thead>
                    <tbody>
                      ${e4_op.map((o) => `<tr><td>${o.op}</td><td>${o.a}</td><td>${o.b}</td><td class="result-badge">${o.res}</td></tr>`).join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <footer class="mt-5 pt-3 border-top text-center text-muted">
            <p>Servidor Resumen ejecutándose en el puerto 3005</p>
          </footer>
        </div>
      </body>
    </html>
  `;

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(3005, () => {
  console.log("Servidor Ejercicio 5 en http://localhost:3005");
});
