import pool from "../database/conexion.js";
import { validarAlumno } from "../validaciones/validaciones.js";

// Acá inserto un alumno nuevo en la tabla alumnos de MySQL
export async function crearAlumno(req, res) {
  try {
    const { nombre, apellido, edad } = req.body;

    const errores = validarAlumno({ nombre, apellido, edad });

    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        success: false,
        errores,
      });
    }

    const [resultado] = await pool.execute(
      "INSERT INTO alumnos (nombre, apellido, edad) VALUES (?, ?, ?)",
      [nombre.trim(), apellido.trim(), Number(edad)],
    );
    //pool se usa para ejecutar consultas SQL en la base de datos MySQL.
    // El método execute() permite ejecutar una consulta parametrizada, donde los valores se pasan como un array para evitar inyecciones SQL. En este caso, se inserta un nuevo registro en la tabla alumnos con los valores proporcionados por el usuario.
    return res.status(201).json({
      success: true,
      id: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al crear alumno:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor al registrar el alumno.",
    });
  }
}

// Acá obtengo todos los alumnos de la base de datos para devolverlos como JSON
export async function listarAlumnos(req, res) {
  try {
    const [filas] = await pool.execute(
      "SELECT id, nombre, apellido, edad FROM alumnos ORDER BY id ASC",
    );

    return res.status(200).json(filas);
  } catch (error) {
    console.error("Error al listar alumnos:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor al obtener los alumnos.",
    });
  }
}
