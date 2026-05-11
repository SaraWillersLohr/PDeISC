import { createServer } from "node:http";
import { suma, resta, multiplicacion, division } from "./calculos.js";

// Ejercicio 4 con import/export (módulo externo)
const s = suma(5, 3);
const r = resta(8, 6);
const m = multiplicacion(3, 11);
const d = division(30, 5);

console.log("Ejercicio 4 - Módulo externo (calculos.js):");
console.log("Importando y ejecutando correctamente.");

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ejercicio 4</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="bg-light">
        <div class="container mt-5">
          <div class="row justify-content-center">
            <div class="col-md-8">
              <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                  <h4 class="mb-0">Ejercicio 4: Módulos Externos</h4>
                </div>
                <div class="card-body p-0">
                  <table class="table table-striped mb-0">
                    <thead class="table-light">
                      <tr><th>Función Exportada</th><th>A</th><th>B</th><th>Resultado</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>suma</td><td>5</td><td>3</td><td>${s}</td></tr>
                      <tr><td>resta</td><td>8</td><td>6</td><td>${r}</td></tr>
                      <tr><td>multiplicacion</td><td>3</td><td>11</td><td>${m}</td></tr>
                      <tr><td>division</td><td>30</td><td>5</td><td>${d}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
  res.end();
});

server.listen(3004, () => {
  console.log("Servidor Ejercicio 4 en http://localhost:3004");
});



