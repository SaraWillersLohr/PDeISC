// Yo creo un servidor HTTP simple para servir los archivos estáticos del proyecto
// Esto me permite ejecutar la aplicación sin necesidad de un servidor complejo

// Yo importo los módulos que necesito: http, filesystem, path y url
import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import { fileURLToPath } from "url";

// Yo configuro el puerto donde va a correr el servidor
const PORT = 3026;

// Yo obtengo la ruta absoluta del archivo actual y del directorio
// Esto es necesario porque en ES modules no existen __filename y __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Yo defino los tipos MIME para los diferentes archivos que voy a servir
// Esto le dice al navegador qué tipo de archivo es cada uno
const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Yo creo el servidor HTTP con un callback que maneja cada petición
const server = http.createServer((req, res) => {
  // Yo parseo la URL para obtener el pathname (la ruta del archivo solicitado)
  const parsedUrl = url.parse(req.url);

  // Yo establezco la ruta por defecto a index.html si el usuario pide la raíz
  let pathname =
    parsedUrl.pathname === "/" ? "/pages/index.html" : parsedUrl.pathname;

  // Yo genero la ruta absoluta del archivo combinando el directorio actual con el pathname
  let filePath = path.join(__dirname, pathname);

  // Yo obtengo la extensión del archivo para determinar su tipo MIME
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  // Yo leo el archivo del sistema de archivos de forma asíncrona
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Si hay un error (archivo no encontrado), devuelvo un 404
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Error: Archivo no encontrado");
      return;
    }
    // Si no hay error, devuelvo el archivo con el tipo MIME correcto
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

// Yo inicio el servidor y lo pongo a escuchar en el puerto configurado
server.listen(PORT, () => {
  console.log(`[PROYECTO 1] Servidor: http://localhost:${PORT}`);
});
