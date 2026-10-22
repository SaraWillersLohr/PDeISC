// valido credenciales contra mariadb y preparo una sesión segura.
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';
import type { AuthenticatedUser, LoginInput } from '../types/auth.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

interface UserRow extends RowDataPacket, AuthenticatedUser {
  password_hash: string;
  nombre: string;
  apellido: string;
}

// inicio sesión después de comprobar la contraseña hasheada.
export async function login(input: LoginInput) {
  const [rows] = await database.execute<UserRow[]>(
    `select u.id_usuario, u.email, u.password_hash, u.nombre, u.apellido, r.nombre as rol
     from usuarios u
     inner join roles r on r.id_rol = u.id_rol
     where u.email = ? and u.activo = true and u.estado_cuenta = 'activo'
     limit 1`,
    [input.email.trim().toLowerCase()],
  );
  const user = rows[0];

  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    throw new Error('correo o contraseña incorrectos');
  }

  const sessionUser: AuthenticatedUser = {
    id_usuario: user.id_usuario,
    email: user.email,
    rol: user.rol,
  };

  return {
    accessToken: createAccessToken(sessionUser),
    refreshToken: createRefreshToken(sessionUser),
    usuario: { ...sessionUser, nombre: user.nombre, apellido: user.apellido },
  };
}

// renuevo los tokens usando un refresh token que ya fue validado.
export function refresh(refreshToken: string) {
  const user = verifyRefreshToken(refreshToken);

  return {
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
  };
}
