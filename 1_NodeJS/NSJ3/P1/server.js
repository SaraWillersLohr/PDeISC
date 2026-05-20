// Servidor Express — sirve el laboratorio DHTML desde /public
// Sara Willers Lohr · PDeISC · Node.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "index.html"));
});

const server = app.listen(PORT, () => {
  console.log("==================================================");
  console.log(`Laboratorio DHTML — http://localhost:${PORT}`);
  console.log("==================================================");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`El puerto ${PORT} ya está en uso. Cerrá el otro proceso o cambiá PORT.`);
  } else {
    console.error("Error en el servidor:", err);
  }
  process.exit(1);
});
