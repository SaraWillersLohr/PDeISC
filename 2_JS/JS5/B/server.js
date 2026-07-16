import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PUERTO = 3001;

// Acá sirvo los archivos estáticos (HTML, CSS, JS) desde la carpeta del proyecto
app.use(express.static(__dirname));

// Acá envío la página principal cuando el usuario entra a la raíz del sitio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Acá inicio el servidor en el puerto 3001
app.listen(PUERTO, () => {
  console.log(`Bases de datos y API - Portal Académico corriendo en http://localhost:${PUERTO}`);
});
