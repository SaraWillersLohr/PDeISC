// ¡Hola! Configurando el servidor para el proyecto includes().
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3019;

// Sirvo mis archivos estáticos.
app.use(express.static(path.join(__dirname)));

// Conecto con lo compartido.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Página principal.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Servidor escuchando en el puerto 3019.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: includes() - El Portero
    `);
});

