import http from "http";
import { upperCase } from "upper-case";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

  const textToProcess = "hola mundo desde node con upper-case!";
  const processedText = upperCase(textToProcess);

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tarea 4: NPM UpperCase</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { 
                background-color: #f3f4f7;
                height: 100vh;
                display: flex;
                align-items: center;
            }
        </style>
    </head>
    <body>
        <div class="container text-center">
            <div class="card border-0 shadow-sm mx-auto" style="max-width: 600px;">
                <div class="card-body p-5">
                    <h1 class="text-muted h5 mb-4 text-uppercase fw-bold ls-2">Transformacion NPM</h1>
                    <div class="bg-light p-4 rounded-3 mb-4">
                        <p class="text-secondary small mb-2 text-start">Texto Original:</p>
                        <p class="h4 mb-4 text-start">"${textToProcess}"</p>
                        <hr>
                        <p class="text-secondary small mb-2 text-start">Resultado UpperCase:</p>
                        <p class="display-6 text-primary fw-bold text-start text-break">${processedText}</p>
                    </div>
                    <div class="d-flex align-items-center justify-content-center text-success">
                        <span class="small fw-bold">PROCESADO CON NPM</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>`;

  res.end(html);
});

const PORT = 3004;
server.listen(PORT, () => {
  console.log(`--- Tarea 4: Uso de NPM (Bootstrap) ---`);
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
