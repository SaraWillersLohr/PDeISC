// ¡Hola! Configurando el servidor para el proyecto filter().
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3022;

// Sirvo mis archivos estáticos.
app.use(express.static(path.join(__dirname)));

// Conecto con lo compartido.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Página principal.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Arranco el servidor en el puerto 3022.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: filter() - El Colador
    `);
});