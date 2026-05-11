import { createServer } from "node:http";

// Funciones del ejercicio 3 (mismas operaciones que E2)
function Sumar(a, b) { return a + b; }
function Restar(a, b) { return a - b; }
function Multiplicar(a, b) { return a * b; }
function Dividir(a, b) { return a / b; }

const s = Sumar(4, 5);
const r = Restar(3, 6);
const m = Multiplicar(2, 7);
const d = Dividir(20, 4);

console.log("Ejercicio 3 - Uso de funciones:");
console.log("Sumar: " + s);
console.log("Dividir: " + d);

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ejercicio 3</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="bg-light">
        <div class="container mt-5">
          <div class="row justify-content-center">
            <div class="col-md-8">
              <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                  <h4 class="mb-0">Ejercicio 3: Funciones Internas</h4>
                </div>
                <div class="card-body p-0">
                  <table class="table table-striped mb-0">
                    <thead class="table-light">
                      <tr><th>Función</th><th>A</th><th>B</th><th>Resultado</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Sumar</td><td>4</td><td>5</td><td>${s}</td></tr>
                      <tr><td>Restar</td><td>3</td><td>6</td><td>${r}</td></tr>
                      <tr><td>Multiplicar</td><td>2</td><td>7</td><td>${m}</td></tr>
                      <tr><td>Dividir</td><td>20</td><td>4</td><td>${d}</td></tr>
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

server.listen(3003, () => {
  console.log("Servidor Ejercicio 3 en http://localhost:3003");
});



