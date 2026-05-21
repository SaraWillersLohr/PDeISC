const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3012;

// archivos estaticos
app.use(express.static(path.join(__dirname)));

// módulos compartidos del TP (../../_shared)
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

// ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});
// arranco el servidor
app.listen(PORT, () => {
  console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: push() - El Canasto
    `);
});
