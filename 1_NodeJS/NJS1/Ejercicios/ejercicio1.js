import { createServer } from "node:http";

console.log("Hola mundo desde Node.js");
console.log("Fin");

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write(`
    <html>
      <head>
        <title>Ejercicio 1</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; }
          .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #0d6efd; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Ejercicio 1</h1>
          <p><strong>Línea 1:</strong> Hola mundo desde Node.js</p>
          <p><strong>Línea 2:</strong> Fin</p>
        </div>
      </body>
    </html>
  `);
  res.end();
});

server.listen(3001, () => {
  console.log("Servidor Ejercicio 1 en http://localhost:3001");
});
