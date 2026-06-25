// UserHub API Enterprise - servidor Express con API interna de empleados
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";

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

// acá sobreescribo el json con el array actualizado
// se usa después de eliminar para que el cambio persista
async function guardarEmpleados(empleados) {
  await writeFile(RUTA_EMPLEADOS, JSON.stringify(empleados, null, 2), "utf-8");
}

// GET /api/empleados — devuelve todos los empleados
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

// DELETE /api/empleados/:id — elimina un empleado por id del json
// esta es la diferencia con P1 y P2: acá la eliminación es real y persiste
app.delete("/api/empleados/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "El id debe ser un número válido." });
    }

    const empleados = await leerEmpleados();

    // busco si existe el empleado con ese id
    const empleado = empleados.find((e) => e.id === id);

    if (!empleado) {
      return res.status(404).json({ error: `No existe empleado con id ${id}.` });
    }

    // filter devuelve todos menos el que tiene el id pedido
    const actualizados = empleados.filter((e) => e.id !== id);

    // guardo el array actualizado en el json para que persista
    await guardarEmpleados(actualizados);

    res.json({
      mensaje: `Empleado ${empleado.nombre} eliminado correctamente.`,
      eliminado: empleado,
      restantes: actualizados.length,
    });
  } catch (error) {
    res.status(500).json({ error: "No se pudo eliminar el empleado." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.listen(PORT, () => {
  console.log(`UserHub API Enterprise corriendo en http://localhost:${PORT}`);
  console.log(`API interna: http://localhost:${PORT}/api/empleados`);
});
