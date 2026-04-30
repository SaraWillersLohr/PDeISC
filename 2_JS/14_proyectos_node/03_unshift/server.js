const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.listen(PORT, () => {
  console.log(
    `🚀 Servidor corriendo en: http://localhost:${PORT} | Proyecto: unshift()`,
  );
});
