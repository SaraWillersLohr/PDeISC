const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor: indexOf() | http://localhost:${PORT}`);
});
