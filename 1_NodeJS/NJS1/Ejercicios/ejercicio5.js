import { createServer } from "node:http";
import { suma, resta, multiplicacion, division } from "./calculos.js";

// Datos unificados para el resumen con acentos correctos
const e1 = { l1: "Hola mundo desde Node.js", l2: "Fin" };
const e2 = [
  { op: "Suma", a: 4, b: 5, res: 4 + 5 },
  { op: "Resta", a: 3, b: 6, res: 3 - 6 },
  { op: "Multiplicación", a: 2, b: 7, res: 2 * 7 },
  { op: "División", a: 20, b: 4, res: 20 / 4 },
];
const e3 = [
  { op: "Sumar", a: 4, b: 5, res: suma(4, 5) },
  { op: "Restar", a: 3, b: 6, res: resta(3, 6) },
  { op: "Multiplicar", a: 2, b: 7, res: multiplicacion(2, 7) },
  { op: "Dividir", a: 20, b: 4, res: division(20, 4) },
];
const e4 = [
  { op: "suma", a: 5, b: 3, res: suma(5, 3) },
  { op: "resta", a: 8, b: 6, res: resta(8, 6) },
  { op: "multiplicación", a: 3, b: 11, res: multiplicacion(3, 11) },
  { op: "división", a: 30, b: 5, res: division(30, 5) },
];

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EJERCICIO 5</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body { background-color: #f8f9fa; }
        .card-header { font-weight: bold; }
      </style>
    </head>
    <body class="py-5">
      <div class="container">
        <h1 class="text-center mb-5 text-primary fw-bold">EJERCICIO 5: RESUMEN GENERAL</h1>
        
        <div class="row g-4">
          <!-- Ejercicio 1 -->
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header bg-primary text-white">Ejercicio 1</div>
              <div class="card-body">
                <p class="mb-1"><strong>Línea 1:</strong> ${e1.l1}</p>
                <p class="mb-0 text-muted"><strong>Línea 2:</strong> ${e1.l2}</p>
              </div>
            </div>
          </div>

          <!-- Ejercicio 2 -->
          <div class="col-md-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-primary text-white">Ejercicio 2: Directo</div>
              <div class="card-body p-0">
                <table class="table table-sm table-striped mb-0">
                  <thead class="table-light">
                    <tr><th>Operación</th><th>A</th><th>B</th><th>Resultado</th></tr>
                  </thead>
                  <tbody>
                    ${e2.map(o => `<tr><td>${o.op}</td><td>${o.a}</td><td>${o.b}</td><td>${o.res}</td></tr>`).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Ejercicio 3 -->
          <div class="col-md-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-primary text-white">Ejercicio 3: Funciones</div>
              <div class="card-body p-0">
                <table class="table table-sm table-striped mb-0">
                  <thead class="table-light">
                    <tr><th>Función</th><th>A</th><th>B</th><th>Resultado</th></tr>
                  </thead>
                  <tbody>
                    ${e3.map(o => `<tr><td>${o.op}</td><td>${o.a}</td><td>${o.b}</td><td>${o.res}</td></tr>`).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Ejercicio 4 -->
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header bg-primary text-white">Ejercicio 4: Módulos</div>
              <div class="card-body p-0">
                <table class="table table-sm table-striped mb-0">
                  <thead class="table-light">
                    <tr><th>Importación</th><th>Valor A</th><th>Valor B</th><th>Resultado Final</th></tr>
                  </thead>
                  <tbody>
                    ${e4.map(o => `<tr><td>${o.op}</td><td>${o.a}</td><td>${o.b}</td><td><b>${o.res}</b></td></tr>`).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <footer class="text-center mt-5 text-muted">
          <small>Servidor de Resumen - Puerto 3005</small>
        </footer>
      </div>
    </body>
    </html>
  `);
  res.end();
});

server.listen(3005, () => {
  console.log("Servidor Ejercicio 5 corriendo en http://localhost:3005");
});




