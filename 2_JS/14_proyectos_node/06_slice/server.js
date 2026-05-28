// ¡Hola! Aquí configurando mi servidor para el proyecto slice().
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3017;

// Archivos estáticos.
app.use(express.static(path.join(__dirname)));

// Conecto con lo compartido.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Mi página principal.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Arranco el servidor en el puerto 3017.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: slice() - La Fotocopiadora
    `);
});
