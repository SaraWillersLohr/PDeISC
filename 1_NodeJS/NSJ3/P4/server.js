// Servidor para el Proyecto 4 (Manipulación Avanzada de Atributos)
// Este script sirve la aplicación donde exploramos cómo cambiar propiedades de los elementos HTML dinámicamente.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "pages", "index.html")),
);
app.listen(process.env.PORT || 3009, () =>
  console.log("P4 — http://localhost:3009"),
);
