// valida el token y carga el usuario autenticado
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import pool from '../config/database';
import type { RowDataPacket } from 'mysql2';

// middleware que exige token jwt v�lido en header authorization
// middleware es una funci�n que se ejecuta antes de que la solicitud llegue
// al controlador, y se utiliza para verificar si el usuario est� autenticado antes
// de permitirle acceder a ciertas rutas protegidas.
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "token de autenticación requerido",
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.activo, r.nombre AS rol FROM usuarios u
       INNER JOIN roles r ON r.id_rol = u.id_rol WHERE u.id_usuario = ? LIMIT 1`,
      [payload.id_usuario],
    );
    if (!rows.length || Number(rows[0].activo) !== 1) {
      res.status(401).json({ success: false, message: 'cuenta inactiva o inexistente' });
      return;
    }
    req.usuario = { ...payload, rol: rows[0].rol };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "token inválido o expirado",
    });
  }
}

