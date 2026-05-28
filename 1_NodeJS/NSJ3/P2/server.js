// Servidor para el Proyecto 2 (Single Page Application básica)
// Este script sirve la SPA y permite navegar entre secciones sin recargar.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "pages", "index.html")),
);
app.listen(PORT, () => console.log(`P2 — http://localhost:${PORT}`));
