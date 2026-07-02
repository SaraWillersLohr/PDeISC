// servidor Express
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//acá inicializo el servidor express
const app = express();
const PORT = 3001;
//acá uso express.static para servir los archivos estáticos
app.use(express.static(__dirname));
//acá uso express.get para servir la página index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});
//acá inicio el servidor en el puerto 3001
app.listen(PORT, () => {
  console.log(`UserHub Explorer corriendo en http://localhost:${PORT}`);
});
