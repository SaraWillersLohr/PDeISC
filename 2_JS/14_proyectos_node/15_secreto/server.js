// Configuro el servidor para el ejercicio extra: El Mensaje Secreto.
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3026;

// Sirvo archivos estáticos de esta carpeta.
app.use(express.static(path.join(__dirname)));

// Conecto con los módulos compartidos del TP.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Página principal.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Arranco el servidor en el puerto 3026.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: 15_secreto - El Mensaje Secreto
    `);
});