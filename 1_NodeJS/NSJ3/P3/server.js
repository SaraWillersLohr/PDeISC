// Servidor para el Proyecto 3 (Manejo de Estados y Formularios)
// Este script sirve la aplicación donde practicamos cómo guardar y validar datos del usuario.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "pages", "index.html")),
);
app.listen(process.env.PORT || 3008, () =>
  console.log("P3 — http://localhost:3008"),
);
