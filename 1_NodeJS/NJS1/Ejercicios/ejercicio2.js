import { createServer } from "node:http";

const s = 4 + 5;
const r = 3 - 6;
const m = 2 * 7;
const d = 20 / 4;

console.log("Suma de 4 + 5 es: " + s);
console.log("Resta de 3 - 6 es: " + r);
console.log("Multiplicación de 2 * 7 es: " + m);
console.log("División de 20 / 4 es: " + d);

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <html>
      <head>
        <title>Ejercicio 2</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="p-5 bg-light">
        <div class="container" style="max-width: 500px;">
          <div class="card shadow">
            <div class="card-header bg-success text-white">Ejercicio 2: Operaciones Directas</div>
            <div class="card-body p-0">
              <table class="table table-hover mb-0">
                <thead><tr><th>Operación</th><th>a</th><th>b</th><th>Resultado</th></tr></thead>
                <tbody>
                  <tr><td>Suma</td><td>4</td><td>5</td><td>${s}</td></tr>
                  <tr><td>Resta</td><td>3</td><td>6</td><td>${r}</td></tr>
                  <tr><td>Mult</td><td>2</td><td>7</td><td>${m}</td></tr>
                  <tr><td>Div</td><td>20</td><td>4</td><td>${d}</td></tr>
                </tbody>
              </table>
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
