import http from "http";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { convertirAMayusculas } from "./modules/texto.js";
import { renderPage } from "./pages/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// leo los archivos estaticos de la pagina
const archivosEstaticos = {
  "/styles/light.css": readFileSync(
    join(__dirname, "styles", "light.css"),
    "utf-8",
  ),
  "/styles/dark.css": readFileSync(
    join(__dirname, "styles", "dark.css"),
    "utf-8",
  ),
  "/scripts/theme.js": readFileSync(
    join(__dirname, "scripts", "theme.js"),
    "utf-8",
  ),
};

const tiposContenido = {
  "/styles/light.css": "text/css; charset=utf-8",
  "/styles/dark.css": "text/css; charset=utf-8",
  "/scripts/theme.js": "application/javascript; charset=utf-8",
};

const PORT = 3004;

const server = http.createServer((req, res) => {
  const ruta = req.url.split("?")[0];

  if (archivosEstaticos[ruta]) {
    res.writeHead(200, { "Content-Type": tiposContenido[ruta] });
    res.end(archivosEstaticos[ruta]);
    return;
  }

  const textToProcess = "hola mundo desde node con upper-case!";
  const processedText = convertirAMayusculas(textToProcess);

  const html = renderPage(textToProcess, processedText);

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`--- Tarea 4: Uso de NPM (upper-case) ---`);
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
