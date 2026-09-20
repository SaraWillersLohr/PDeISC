/** logica crud de empleados */
import pool from '../config/database';
import { hashPassword } from '../utils/password';
import { getRolLabel, ROL_DUENO } from '../utils/roles';
import type {
  CreateUsuarioRequest,
  RolNombre,
  UpdateUsuarioRequest,
  UsuarioPublico,
} from '../types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UsuarioRow extends RowDataPacket {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: number;
  rol_nombre: RolNombre;
}

function toPublico(row: UsuarioRow): UsuarioPublico {
  return {
    id_usuario: row.id_usuario,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    rol: row.rol_nombre,
    rolLabel: getRolLabel(row.rol_nombre),
    activo: row.activo === 1,
  };
}

async function getRolId(nombre: RolNombre): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id_rol FROM roles WHERE nombre = ? LIMIT 1',
    [nombre],
  );
  if (!rows[0]) throw new Error(`rol "${nombre}" no existe`);
  return rows[0].id_rol as number;
}

/** listo todos los usuarios activos — solo admins */
export async function listUsuarios(): Promise<UsuarioPublico[]> {
  const [rows] = await pool.query<UsuarioRow[]>(
    `SELECT u.id_usuario, u.id_rol, u.nombre, u.apellido, u.email, u.activo, r.nombre AS rol_nombre
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.activo = 1
     ORDER BY u.nombre`,
  );
  return rows.map(toPublico);
}

/** creo un usuario nuevo — valido permisos según rol del creador */
export async function createUsuario(
  data: CreateUsuarioRequest,
  creadorRol: RolNombre,
): Promise<UsuarioPublico> {
  // solo el dueño puede crear copropietarios
  if (data.rol === 'copropietario' && creadorRol !== ROL_DUENO) {
    throw new Error('solo el dueño puede dar de alta copropietarios');
  }

  // peones y veterinarios los crean admins
  const rolesAdminPermitidos: RolNombre[] = ['dueno', 'copropietario'];
  if (!rolesAdminPermitidos.includes(creadorRol)) {
    throw new Error('no tenés permisos para crear usuarios');
  }

  const idRol = await getRolId(data.rol);
  const passwordHash = await hashPassword(data.password);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [idRol, data.nombre.trim(), data.apellido.trim(), data.email.toLowerCase().trim(), passwordHash],
    );

    const [rows] = await pool.query<UsuarioRow[]>(
      `SELECT u.id_usuario, u.id_rol, u.nombre, u.apellido, u.email, u.activo, r.nombre AS rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = ?`,
      [result.insertId],
    );

    return toPublico(rows[0]);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ER_DUP_ENTRY') {
      throw new Error('el email ya está registrado');
    }
    throw err;
  }
}

/** actualizo datos de un usuario existente */
export async function updateUsuario(
  id: number,
  data: UpdateUsuarioRequest,
  editorRol: RolNombre,
): Promise<UsuarioPublico> {
  if (data.rol === 'copropietario' && editorRol !== ROL_DUENO) {
    throw new Error('solo el dueño puede asignar rol copropietario');
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.nombre) { fields.push('nombre = ?'); values.push(data.nombre.trim()); }
  if (data.apellido) { fields.push('apellido = ?'); values.push(data.apellido.trim()); }
  if (data.email) { fields.push('email = ?'); values.push(data.email.toLowerCase().trim()); }
  if (data.password) {
    fields.push('password_hash = ?');
    values.push(await hashPassword(data.password));
  }
  if (data.rol) {
    fields.push('id_rol = ?');
    values.push(await getRolId(data.rol));
  }
  if (data.activo !== undefined) {
    fields.push('activo = ?');
    values.push(data.activo ? 1 : 0);
  }

  if (fields.length === 0) {
    throw new Error('no hay campos para actualizar');
  }

  values.push(id);
  await pool.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`, values);

  const [rows] = await pool.query<UsuarioRow[]>(
    `SELECT u.id_usuario, u.id_rol, u.nombre, u.apellido, u.email, u.activo, r.nombre AS rol_nombre
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.id_usuario = ?`,
    [id],
  );

  if (!rows[0]) throw new Error('usuario no encontrado');
  return toPublico(rows[0]);
}

/** desactivo usuario (soft delete) — no elimino físicamente */
export async function deactivateUsuario(id: number): Promise<void> {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE usuarios SET activo = 0 WHERE id_usuario = ?',
    [id],
  );
  if (result.affectedRows === 0) {
    throw new Error('usuario no encontrado');
  }
}
