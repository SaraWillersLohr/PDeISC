// ¡Hola! Configurando el servidor para el proyecto splice().
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3016;

// Archivos estáticos.
app.use(express.static(path.join(__dirname)));

// Módulos compartidos.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Página principal.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Servidor escuchando en el puerto 3016.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: splice() - El Cirujano
    `);
});