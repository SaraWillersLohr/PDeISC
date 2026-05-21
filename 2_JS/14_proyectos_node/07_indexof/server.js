const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3018;

app.use(express.static(path.join(__dirname)));
// módulos compartidos del TP (../../_shared)
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor: indexOf() | http://localhost:${PORT}`);
});
