// ¡Hola! Aquí estoy configurando mi servidor con Express para el proyecto de pop().
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3012;

// Sirvo mis archivos estáticos.
app.use(express.static(path.join(__dirname)));

// Conecto con los archivos compartidos.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Mi ruta principal que entrega el HTML.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Arranco el servidor en el puerto indicado.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: pop() - El Adiós
    `);
});