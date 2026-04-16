import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { leerArchivo } from "./lector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function iniciarServidor(puerto) {
  const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, "..", "pages", "index.html");

    leerArchivo(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error interno del servidor");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  });

  server.listen(puerto, () => {
    console.log(`--- Tarea 2: HTTP y FS (Modulos Separados) ---`);
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
  });
}
