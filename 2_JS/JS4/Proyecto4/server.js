// UserHub API Enterprise - servidor Express con API interna de empleados
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3004;
const RUTA_EMPLEADOS = path.join(__dirname, "data", "empleados.json");

app.use(express.json());
app.use(express.static(__dirname));

// acá leo el json que simula nuestra base de datos interna
async function leerEmpleados() {
  const contenido = await readFile(RUTA_EMPLEADOS, "utf-8");
  const empleados = JSON.parse(contenido);

  if (!Array.isArray(empleados)) {
    throw new Error("El archivo de empleados no tiene un formato válido.");
  }

  return empleados;
}

// acá creo la ruta para devolver los empleados
app.get("/api/empleados", async (req, res) => {
  try {
    const empleados = await leerEmpleados();
    res.json(empleados);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "No se encontró el archivo de empleados." });
    }

    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: "El archivo de empleados tiene JSON inválido." });
    }

    res.status(500).json({ error: "No se pudieron cargar los empleados." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.listen(PORT, () => {
  console.log(`UserHub API Enterprise corriendo en http://localhost:${PORT}`);
  console.log(`API interna: http://localhost:${PORT}/api/empleados`);
});
