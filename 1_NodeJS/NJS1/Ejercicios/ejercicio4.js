import { createServer } from "node:http";
import { suma, resta, multiplicacion, division } from "./calculos.js";

const s = suma(5, 3);
const r = resta(8, 6);
const m = multiplicacion(3, 11);
const d = division(30, 5);

console.log("Suma: " + s);
console.log("Resta: " + r);
console.log("Multiplicación: " + m);
console.log("División: " + d);

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <html>
      <head>
        <title>Ejercicio 4</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="p-5 bg-light">
        <div class="container" style="max-width: 500px;">
          <div class="card shadow">
            <div class="card-header bg-info text-dark fw-bold">Ejercicio 4: Módulo calculos.js</div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead><tr><th>Función</th><th>a</th><th>b</th><th>Resultado</th></tr></thead>
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
      </body>
    </html>
  `);
  res.end();
});

server.listen(3004, () => {
  console.log("Servidor Ejercicio 4 en http://localhost:3004");
});
