import http from "http";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { getClimaMDP } from "./modules/clima.js";
import { sumar, restar, multiplicar, dividir } from "./modules/calculo.js";
import {
  buildClimaContent,
  buildCalcContent,
  renderPage,
} from "./pages/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// leo los archivos estaticos que necesita la pagina
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

const PORT = 3001;

// creo el servidor http y respondo con html o archivos estaticos
const server = http.createServer(async (req, res) => {
  if (archivosEstaticos[req.url]) {
    res.writeHead(200, { "Content-Type": tiposContenido[req.url] });
    res.end(archivosEstaticos[req.url]);
    return;
  }

  // obtengo el clima desde el modulo
  const clima = await getClimaMDP();

  // genero el contenido dinamico con los modulos propios
  const climaContent = buildClimaContent(clima);

  const calcContent = buildCalcContent({
    suma: sumar(10, 5),
    resta: restar(20, 8),
    multiplicacion: multiplicar(4, 7),
    division: dividir(100, 4),
  });

  const html = renderPage(climaContent, calcContent);

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`--- Tarea 1: Modulos Propios (Clima y Calculos) ---`);
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
