// server.js
//importo lo que necesito: puerto, filesystem, patron para path y url
import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import { fileURLToPath } from "url";
//configuracion del puerto y el path
const PORT = 3003;
// __filename es la ruta absoluta del archivo actual __dirname es la ruta absoluta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};
//creacion del servidor
const server = http.createServer((req, res) => {
    //parseo la url para obtener el pathname 
    const parsedUrl = url.parse(req.url);
    // Establezco la ruta por defecto index.html y la guardo en pathname
    let pathname = parsedUrl.pathname === "/" ? "/pages/index.html" : parsedUrl.pathname;
    // genero la ruta absoluta del archivo
    let filePath = path.join(__dirname, pathname);
    // obtengo la extension del archivo y la guardo en ext
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
        if (err) {
            //si hay un error, escribo 404
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Error: Archivo no encontrado");
            return;
        }
        // Si no hay error, escribo 200 y envio el archivo
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
});
//arranco el servidor en el puerto 3003
server.listen(PORT, () => {
    console.log(`[PROYECTO 3] Servidor: http://localhost:${PORT}`);
});
