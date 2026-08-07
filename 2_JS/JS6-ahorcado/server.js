// servidor principal de la aplicación. sirve el frontend y expone la api para obtener palabras y scores.
import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
  
import pool from "./database/conexion.js";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middlewares del servidor.
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// sirve el frontend desde la carpeta del proyecto.
app.use(express.static(__dirname));

// ---------- api de palabras ----------

app.get("/api/palabra/:especialidad", async (req, res) => {
  try {
    const { especialidad } = req.params;
    const excluidasQuery = req.query.excluidas || "";
    const excluidas = excluidasQuery
      ? excluidasQuery.split(",").map((w) => w.toUpperCase().trim())
      : [];

    const archivos = {
      informatica: "informatica.json",
      mmo: "mmo.json",
      electronica: "electronica.json",
    };

    const archivo = archivos[especialidad.toLowerCase()];

    if (!archivo) {
      return res.status(404).json({
        error: "Especialidad inexistente",
      });
    }

    const ruta = path.join(__dirname, "data", archivo);
    const contenido = await fs.readFile(ruta, "utf-8");
    const datos = JSON.parse(contenido);

    // Filtrar palabras excluidas
    const palabrasRestantes = datos.palabras.filter(
      (p) => !excluidas.includes(p.palabra.toUpperCase().trim()),
    );

    if (palabrasRestantes.length === 0) {
      return res.json({ fin: true });
    }

    const indice = Math.floor(Math.random() * palabrasRestantes.length);
    res.json(palabrasRestantes[indice]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error obteniendo palabra",
    });
  }
});

// Api de scors

app.get("/api/scores", async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT *
            FROM score
            ORDER BY puntos DESC, tiempo ASC
        `);

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error obteniendo ranking",
    });
  }
});

// ---------- guardar score ----------
// usa put porque la app lo maneja así.

app.put("/api/score", async (req, res) => {
  try {
    const { nombre, tiempo, puntos, especialidad } = req.body;

    // validaciones backend robustas
    if (
      !especialidad ||
      !["informatica", "mmo", "electronica"].includes(
        especialidad.toLowerCase(),
      )
    ) {
      return res.status(400).json({
        error: "Especialidad inválida",
      });
    }

    const regexNombre = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ ]{3,20}$/;
    if (!nombre || !regexNombre.test(nombre.trim())) {
      return res.status(400).json({
        error:
          "Nombre inválido (debe tener entre 3 y 20 caracteres alfanuméricos y espacios)",
      });
    }

    if (isNaN(tiempo) || tiempo < 0) {
      return res.status(400).json({
        error: "Tiempo inválido",
      });
    }

    if (isNaN(puntos) || puntos < 0) {
      return res.status(400).json({
        error: "Puntaje inválido",
      });
    }

    await pool.query(
      `
            INSERT INTO score
            (
                nombre,
                tiempo,
                puntos,
                especialidad
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?
            )
            `,
      [nombre, tiempo, puntos, especialidad],
    );

    res.json({
      mensaje: "Score guardado",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error guardando score",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
