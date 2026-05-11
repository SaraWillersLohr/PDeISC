import { createServer } from "node:http";

// Operaciones exactas de la consigna: 4+5, 3-6, 2*7, 20/4
const s = 4 + 5;
const r = 3 - 6;
const m = 2 * 7;
const d = 20 / 4;

console.log("Ejercicio 2 - Operaciones directas:");
console.log("4 + 5 = " + s);
console.log("3 - 6 = " + r);
console.log("2 * 7 = " + m);
console.log("20 / 4 = " + d);

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ejercicio 2</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="bg-light">
        <div class="container mt-5">
          <div class="row justify-content-center">
            <div class="col-md-8">
              <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                  <h4 class="mb-0">Ejercicio 2: Operaciones Directas</h4>
                </div>
                <div class="card-body p-0">
                  <table class="table table-striped mb-0">
                    <thead class="table-light">
                      <tr><th>Operación</th><th>A</th><th>B</th><th>Resultado</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Suma</td><td>4</td><td>5</td><td>${s}</td></tr>
                      <tr><td>Resta</td><td>3</td><td>6</td><td>${r}</td></tr>
                      <tr><td>Multiplicación</td><td>2</td><td>7</td><td>${m}</td></tr>
                      <tr><td>División</td><td>20</td><td>4</td><td>${d}</td></tr>
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

server.listen(3002, () => {
  console.log("Servidor Ejercicio 2 en http://localhost:3002");
});



