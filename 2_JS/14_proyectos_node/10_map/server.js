// ¡Hola! Configurando el servidor para el proyecto map().
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3021;

// Sirvo mis archivos estáticos.
app.use(express.static(path.join(__dirname)));

// Conecto con lo compartido.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Página principal.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Arranco el servidor en el puerto 3021.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: map() - El Transformador
    `);
});
