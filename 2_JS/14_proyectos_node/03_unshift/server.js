// ¡Hola! Aquí estoy configurando mi servidor para el proyecto unshift().
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3014;

// Sirvo mis archivos estáticos desde la raíz.
app.use(express.static(path.join(__dirname)));

// También comparto los archivos del nivel superior.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Ruta principal para el index.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Lanzo el servidor en el puerto 3014.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: unshift() - El Comienzo
    `);
});
