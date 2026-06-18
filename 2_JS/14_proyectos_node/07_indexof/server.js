// ¡Hola! Configurando el servidor para el proyecto indexOf().
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3018;

// Sirvo mis archivos estáticos.
app.use(express.static(path.join(__dirname)));

// Conecto con los compartidos.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Mi página principal.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Arranco el servidor en el puerto 3018.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: indexOf() - El Detective
    `);
});