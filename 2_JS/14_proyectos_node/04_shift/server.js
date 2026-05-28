// ¡Hola! Aquí estoy configurando mi servidor para el proyecto shift().
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3015;

// Sirvo mis archivos estáticos.
app.use(express.static(path.join(__dirname)));

// Conecto con los archivos compartidos del nivel superior.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Ruta principal para servir mi index.html.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Lanzo el servidor en el puerto 3015.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: shift() - La Fila
    `);
});
