import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import { fileURLToPath } from "url";

const PORT = 3001;
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

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    // Mapeo de la raíz a /pages/index.html
    let pathname = parsedUrl.pathname === "/" ? "/pages/index.html" : parsedUrl.pathname;
    let filePath = path.join(__dirname, pathname);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Error: Archivo no encontrado");
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`[PROYECTO 1] Servidor: http://localhost:${PORT}`);
});
