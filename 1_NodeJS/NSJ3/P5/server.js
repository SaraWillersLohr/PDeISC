// Servidor para el Proyecto 5 (Carrito de Compras)
// Este script sirve la tienda virtual y maneja la lectura del catálogo de productos desde un JSON.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "pages", "index.html")),
);
app.listen(process.env.PORT || 3010, () =>
  console.log("P5 — http://localhost:3010"),
);
