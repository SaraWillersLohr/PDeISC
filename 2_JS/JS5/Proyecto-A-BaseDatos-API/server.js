import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import alumnosRoutes from "./routes/alumnosRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PUERTO = 3000;

// Acá configuro Express para leer JSON en las peticiones POST
app.use(express.json());

// Acá habilito CORS para que el Proyecto B (puerto 3001) pueda consumir esta API
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Acá sirvo los archivos estáticos (HTML, CSS, JS) desde la carpeta del proyecto
app.use(express.static(__dirname));

// Acá registro las rutas de la API REST bajo el prefijo /api
app.use("/api", alumnosRoutes);

// Acá envío la página principal cuando el usuario entra a la raíz del sitio
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Acá inicio el servidor en el puerto 3000
app.listen(PUERTO, () => {
  console.log(
    `Bases de datos y API- Gestión de Alumnos corriendo en http://localhost:${PUERTO}`,
  );
});
