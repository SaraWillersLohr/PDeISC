// ¡Hola! Aquí estoy configurando mi servidor con Express para que todo funcione de maravilla.
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3012;

// Primero, le digo a Express que sirva mis archivos estáticos directamente desde la raíz.
app.use(express.static(path.join(__dirname)));

// También necesito acceder a los módulos compartidos del TP, que están un nivel arriba.
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// Configuro la ruta principal para que cuando entres, te muestre mi página index.html.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Finalmente, arranco el servidor y te aviso por consola en qué puerto estoy escuchando.
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: push() - El Canasto
    `);
});