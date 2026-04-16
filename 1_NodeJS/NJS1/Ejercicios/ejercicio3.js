import { createServer } from "node:http";

function Sumar(a, b) {
  return a + b;
}

function Restar(c, d) {
  return c - d;
}

function Multiplicar(e, f) {
  return e * f;
}

function Dividir(g, h) {
  return g / h;
}

const s = Sumar(4, 5);
const r = Restar(3, 6);
const m = Multiplicar(2, 7);
const d = Dividir(20, 4);

console.log("Suma de 4 + 5 es: " + s);
console.log("Resta de 3 - 6 es: " + r);
console.log("Multiplicación de 2 * 7 es: " + m);
console.log("División de 20 / 4 es: " + d);

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <html>
      <head>
        <title>Ejercicio 3</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="p-5 bg-light">
        <div class="container" style="max-width: 500px;">
          <div class="card shadow">
            <div class="card-header bg-warning text-dark fw-bold">Ejercicio 3: Funciones Internas</div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead><tr><th>Función</th><th>a</th><th>b</th><th>Resultado</th></tr></thead>
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
      </body>
    </html>
  `);
  res.end();
});

server.listen(3003, () => {
  console.log("Servidor Ejercicio 3 en http://localhost:3003");
});
