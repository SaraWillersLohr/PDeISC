import { createServer } from "node:http";

// Mensajes por consola
console.log("Hola mundo desde Node.js");
console.log("Fin");

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ejercicio 1</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="bg-light">
        <div class="container mt-5">
          <div class="row justify-content-center">
            <div class="col-md-6">
              <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                  <h4 class="mb-0">Ejercicio 1</h4>
                </div>
                <div class="card-body">
                  <p class="lead"><strong>Línea 1:</strong> Hola mundo desde Node.js</p>
                  <p class="text-muted"><strong>Línea 2:</strong> Fin</p>
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

server.listen(3001, () => {
  console.log("Servidor Ejercicio 1 en http://localhost:3001");
});



