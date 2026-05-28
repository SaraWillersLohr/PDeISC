// Servidor para el Proyecto 6 (Formulario con Validación de APIs)
// Este script sirve la aplicación que valida datos en tiempo real usando APIs externas.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "pages", "index.html")),
);
app.listen(process.env.PORT || 3011, () =>
  console.log("P6 — http://localhost:3011"),
);
