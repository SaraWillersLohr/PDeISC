import http from "http";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { analizarYMostrarURL } from "./modules/analizador.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// leo los archivos estaticos de la pagina
const paginaHtml = readFileSync(
  join(__dirname, "pages", "index.html"),
  "utf-8",
);

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

const PORT = 3003;

// ignoro archivos estaticos y solo analizo la ruta del ejercicio
function esRutaDePrueba(req) {
  const ruta = req.url.split("?")[0];

  if (ruta === "/favicon.ico") return false;
  if (ruta.startsWith("/styles/")) return false;
  if (ruta.startsWith("/scripts/")) return false;

  return ruta === "/";
}

const server = http.createServer((req, res) => {
  const ruta = req.url.split("?")[0];

  if (esRutaDePrueba(req)) {
    analizarYMostrarURL(req);
  }

  if (archivosEstaticos[ruta]) {
    res.writeHead(200, { "Content-Type": tiposContenido[ruta] });
    res.end(archivosEstaticos[ruta]);
    return;
  }

  // genero la pagina visual de instrucciones
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(paginaHtml);
});

server.listen(PORT, () => {
  console.log(`--- Tarea 3: Modulo URL ---`);
  console.log(
    `Tarea 3 iniciada en http://localhost:${PORT} — aqui apareceran las interacciones`,
  );
});
