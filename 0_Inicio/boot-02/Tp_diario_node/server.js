import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Configuración para usar __dirname con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Servir archivos estáticos desde las carpetas correspondientes
app.use("/pages", express.static(path.join(__dirname, "pages"))); // Sirve pages con /pages/ en la URL
app.use("/styles", express.static(path.join(__dirname, "styles")));
app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use("/modules", express.static(path.join(__dirname, "modules")));
app.use("/img", express.static(path.join(__dirname, "img")));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log("Arquitectura del proyecto:");
  console.log("- pages/   (HTML en la raíz)");
  console.log("- styles/  (CSS)");
  console.log("- scripts/ (JS Principal)");
  console.log("- modules/ (JS Modular)");
});
