import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { leerArchivo } from "./lector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// elijo que archivo leer segun la url pedida
function obtenerArchivo(url) {
  if (url === "/styles/light.css") {
    return {
      ruta: path.join(__dirname, "..", "styles", "light.css"),
      tipo: "text/css; charset=utf-8",
    };
  }

  if (url === "/styles/dark.css") {
    return {
      ruta: path.join(__dirname, "..", "styles", "dark.css"),
      tipo: "text/css; charset=utf-8",
    };
  }

  if (url === "/scripts/theme.js") {
    return {
      ruta: path.join(__dirname, "..", "scripts", "theme.js"),
      tipo: "application/javascript; charset=utf-8",
    };
  }

  return {
    ruta: path.join(__dirname, "..", "pages", "index.html"),
    tipo: "text/html; charset=utf-8",
  };
}

// inicio el servidor http y leo archivos con fs
export function iniciarServidor(puerto) {
  const server = http.createServer((req, res) => {
    const { ruta, tipo } = obtenerArchivo(req.url);

    leerArchivo(ruta, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error interno del servidor");
        return;
      }

      res.writeHead(200, { "Content-Type": tipo });
      res.end(data);
    });
  });

  server.listen(puerto, () => {
    console.log(`--- Tarea 2: HTTP y FS (Modulos Separados) ---`);
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
  });
}
