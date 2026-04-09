import { createServer } from "node:http";
import { suma, resta, multiplicacion, division } from "./calculos.js";

const server = createServer((req, res) => {
  const html = `
  <!DOCTYPE html>
    <html>
    <head>
      <title>Ejercicio 5</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

      <body class="p-4 text-center">

        

        <h2 class="mb-4">Operaciones Matematicas Basicas</h2>

        <table class="table table-success table-striped-columns w-50 mx-auto">
          <thead>
            <tr>
              <th>Operacion</th>
              <th>a</th>
              <th>b</th>
              <th>Resultado</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Suma</td>
              <td>5</td>
              <td>3</td>
              <td>${suma(5, 3)}</td>
            </tr>
            <tr>
              <td>Resta</td>
              <td>8</td>
              <td>6</td>
              <td>${resta(8, 6)}</td>
            </tr>
            <tr>
              <td>Multiplicacion</td>
              <td>3</td>
              <td>11</td>
              <td>${multiplicacion(3, 11)}</td>
            </tr>
            <tr>
              <td>Division</td>
              <td>30</td>
              <td>5</td>
              <td>${division(30, 5)}</td>
            </tr>
          </tbody>
        </table>

      </body>
    </html>
  `;

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});

server.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
