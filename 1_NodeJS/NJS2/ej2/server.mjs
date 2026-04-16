import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, 'pages', 'index.html');
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Error interno del servidor');
            return;
        }
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(data);
    });
});

const PORT = 3002;
server.listen(PORT, () => {
    console.log(`--- Tarea 2: HTTP y FS ---`);
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
