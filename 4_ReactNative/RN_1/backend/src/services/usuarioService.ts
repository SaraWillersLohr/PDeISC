import pool from '../config/database';
import { hashPassword } from '../utils/password';
import { getRolLabel, isAdmin } from '../utils/roles';
import type { CreateUsuarioRequest, RolNombre, UpdateUsuarioRequest, UsuarioPublico } from '../types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UsuarioRow extends RowDataPacket {
  id_usuario: number; id_rol: number; nombre: string; apellido: string; email: string;
  activo: number; rol_nombre: RolNombre;
}

function toPublico(row: UsuarioRow): UsuarioPublico {
  return { id_usuario: row.id_usuario, nombre: row.nombre, apellido: row.apellido,
    email: row.email, rol: row.rol_nombre, rolLabel: getRolLabel(row.rol_nombre), activo: row.activo === 1 };
}

async function getRolId(nombre: RolNombre): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id_rol FROM roles WHERE nombre = ? LIMIT 1', [nombre]);
  if (!rows[0]) throw new Error(`rol "${nombre}" no existe`);
  return Number(rows[0].id_rol);
}

async function isAdministratorUser(id: number): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT 1 AS encontrado FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE u.id_usuario = ? AND r.nombre = 'administrador' LIMIT 1", [id],
  );
  return rows.length > 0;
}

const USER_SELECT = `SELECT u.id_usuario, u.id_rol, u.nombre, u.apellido, u.email, u.activo, r.nombre AS rol_nombre
  FROM usuarios u INNER JOIN roles r ON r.id_rol = u.id_rol`;

/** Solo el administrador superior puede gestionar las cuentas. */
export async function listUsuarios(): Promise<UsuarioPublico[]> {
  const [rows] = await pool.query<UsuarioRow[]>(`${USER_SELECT} ORDER BY u.nombre`);
  return rows.map(toPublico);
}

export async function createUsuario(data: CreateUsuarioRequest, creatorRole: RolNombre): Promise<UsuarioPublico> {
  if (!isAdmin(creatorRole)) throw new Error('solo el administrador superior puede crear usuarios');
  const role = data.rol ?? 'peon';
  if (!(['peon', 'veterinario', 'copropietario', 'dueno'] as string[]).includes(role)) throw new Error('rol no permitido');
  const email = data.email.trim().toLowerCase();
  const [pending] = await pool.query<RowDataPacket[]>("SELECT id_solicitud FROM solicitudes_registro WHERE email = ? AND estado IN ('pendiente_verificacion','pendiente_aprobacion') LIMIT 1", [email]);
  if (pending.length) throw new Error('ya existe una solicitud para ese correo; resolvela desde Solicitudes');
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, activo, debe_cambiar_password)
     VALUES (?, ?, ?, ?, ?, 1, 1)`,
    [await getRolId(role), data.nombre.trim(), data.apellido.trim(), email, await hashPassword(data.password)],
  );
  const [rows] = await pool.query<UsuarioRow[]>(`${USER_SELECT} WHERE u.id_usuario = ?`, [result.insertId]);
  return toPublico(rows[0]);
}

export async function updateUsuario(id: number, data: UpdateUsuarioRequest, editorRole: RolNombre): Promise<UsuarioPublico> {
  if (!isAdmin(editorRole)) throw new Error('solo el administrador superior puede modificar usuarios');
  if (data.rol !== undefined && !(['peon', 'veterinario', 'copropietario', 'dueno'] as string[]).includes(data.rol)) throw new Error('rol no permitido');
  if (data.activo !== undefined && typeof data.activo !== 'boolean') throw new Error('el estado activo debe ser booleano');
  if (await isAdministratorUser(id) && (data.rol !== undefined || data.activo === false)) {
    throw new Error('no se puede cambiar el rol ni desactivar al administrador superior');
  }
  const fields: string[] = []; const values: (string | number)[] = [];
  if (data.nombre) { fields.push('nombre = ?'); values.push(data.nombre.trim()); }
  if (data.apellido) { fields.push('apellido = ?'); values.push(data.apellido.trim()); }
  if (data.email) { fields.push('email = ?'); values.push(data.email.toLowerCase().trim()); }
  if (data.password) { fields.push('password_hash = ?'); values.push(await hashPassword(data.password)); }
  if (data.rol) { fields.push('id_rol = ?'); values.push(await getRolId(data.rol)); }
  if (data.activo !== undefined) {
    fields.push('activo = ?'); values.push(data.activo ? 1 : 0);
    fields.push("estado_cuenta = ?"); values.push(data.activo ? 'activo' : 'inactivo');
  }
  if (!fields.length) throw new Error('no hay campos para actualizar');
  values.push(id);
  await pool.execute<ResultSetHeader>(`UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`, values);
  const [rows] = await pool.query<UsuarioRow[]>(`${USER_SELECT} WHERE u.id_usuario = ?`, [id]);
  if (!rows.length) throw new Error('usuario no encontrado');
  return toPublico(rows[0]);
}

export async function deactivateUsuario(id: number): Promise<void> {
  if (await isAdministratorUser(id)) throw new Error('no se puede desactivar al administrador superior');
  const [result] = await pool.execute<ResultSetHeader>("UPDATE usuarios SET activo = 0, estado_cuenta = 'inactivo' WHERE id_usuario = ?", [id]);
  if (!result.affectedRows) throw new Error('usuario no encontrado');
}
