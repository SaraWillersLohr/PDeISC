// logica de login y perfil
import pool from '../config/database';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { getRolLabel } from '../utils/roles';
import type { LoginRequest, UsuarioDB, UsuarioPublico } from '../types';
import type { RowDataPacket } from 'mysql2';

interface UsuarioRow extends RowDataPacket, UsuarioDB {}

// busco usuario por email incluyendo nombre del rol
async function findByEmail(email: string): Promise<UsuarioRow | null> {
  const [rows] = await pool.query<UsuarioRow[]>(
    `SELECT u.*, r.nombre AS rol_nombre
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.email = ? AND u.activo = 1
     LIMIT 1`,
    [email.toLowerCase().trim()],
  );
  return rows[0] ?? null;
}

// busco usuario por id para validar sesi�n
async function findById(id: number): Promise<UsuarioRow | null> {
  const [rows] = await pool.query<UsuarioRow[]>(
    `SELECT u.*, r.nombre AS rol_nombre
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.id_usuario = ? AND u.activo = 1
     LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

// ejecuto topublico
function toPublico(row: UsuarioRow): UsuarioPublico {
  const rol = row.rol_nombre!;
  return {
    id_usuario: row.id_usuario,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    rol,
    rolLabel: getRolLabel(rol),
    activo: row.activo === 1,
    debe_cambiar_password: Number(row.debe_cambiar_password) === 1,
  };
}

// valido credenciales y devuelvo token + usuario sin datos sensibles
export async function login(data: LoginRequest): Promise<{ token: string; usuario: UsuarioPublico }> {
  const usuario = await findByEmail(data.email);

  if (!usuario) {
    throw new Error('credenciales inválidas');
  }

  const passwordOk = await comparePassword(data.password, usuario.password_hash);
  if (!passwordOk) {
    throw new Error('credenciales inválidas');
  }

  const rol = usuario.rol_nombre!;
  const token = signToken({
    id_usuario: usuario.id_usuario,
    email: usuario.email,
    rol,
  });

  return { token, usuario: toPublico(usuario) };
}

// obtengo perfil del usuario autenticado por id del token
export async function getProfile(idUsuario: number): Promise<UsuarioPublico> {
  const usuario = await findById(idUsuario);
  if (!usuario) {
    throw new Error('usuario no encontrado');
  }
  return toPublico(usuario);
}

// actualizo contrase�a obligatoria en primer ingreso
export async function cambiarPasswordInicial(idUsuario: number, nuevaPassword: string): Promise<UsuarioPublico> {
  if (!nuevaPassword || nuevaPassword.trim().length < 6) {
    throw new Error('la contraseña debe tener al menos 6 caracteres');
  }

  const passwordHash = await hashPassword(nuevaPassword.trim());
  await pool.query(
    `UPDATE usuarios SET password_hash = ?, debe_cambiar_password = 0 WHERE id_usuario = ?`,
    [passwordHash, idUsuario],
  );

  return getProfile(idUsuario);
}

