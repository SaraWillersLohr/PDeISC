import pool from '../database/conexion.js';

export async function crearAlumno(req, res) {
  try {
    const { nombre, apellido, edad } = req.body;

    if (!nombre || !apellido || !edad) {
      return res.status(400).json({
        success: false,
        mensaje: 'Los campos nombre, apellido y edad son obligatorios.'
      });
    }

    const [resultado] = await pool.execute(
      'INSERT INTO alumnos (nombre, apellido, edad) VALUES (?, ?, ?)',
      [nombre.trim(), apellido.trim(), Number(edad)]
    );

    return res.status(201).json({
      success: true,
      id: resultado.insertId,
      mensaje: 'Alumno registrado exitosamente.'
    });
  } catch (error) {
    console.error('Error al crear alumno:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor.'
    });
  }
}

export async function listarAlumnos(req, res) {
  try {
    const [filas] = await pool.execute(
      'SELECT id, nombre, apellido, edad FROM alumnos ORDER BY id ASC'
    );

    return res.status(200).json(filas);
  } catch (error) {
    console.error('Error al listar alumnos:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor.'
    });
  }
}
