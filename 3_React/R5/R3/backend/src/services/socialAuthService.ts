// Reglas de negocio para vincular proveedores externos con usuarios autorizados.
import type { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { getRolLabel } from '../utils/roles';
import type { SocialProvider, UsuarioDB, UsuarioPublico } from '../types';

interface UsuarioSocialRow extends RowDataPacket, UsuarioDB {}

/** Busca un usuario activo de la lista blanca mediante su correo normalizado. */
async function findActiveUserByEmail(email: string): Promise<UsuarioSocialRow | null> {
  const [rows] = await pool.query<UsuarioSocialRow[]>(
    `SELECT u.*, r.nombre AS rol_nombre
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.email = ? AND u.activo = 1
     LIMIT 1`,
    [email.trim().toLowerCase()],
  );
  return rows[0] ?? null;
}

/** Busca si la identidad externa ya se vinculó a otro usuario del sistema. */
async function findIdentityOwner(provider: SocialProvider, providerUserId: string): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id_usuario FROM identidades_sociales
     WHERE proveedor = ? AND proveedor_usuario_id = ? LIMIT 1`,
    [provider, providerUserId],
  );
  return rows[0]?.id_usuario ?? null;
}

/** Crea la relación social sólo después de comprobar la lista blanca y su unicidad. */
async function linkIdentity(idUsuario: number, provider: SocialProvider, providerUserId: string): Promise<void> {
  await pool.query(
    `INSERT INTO identidades_sociales (id_usuario, proveedor, proveedor_usuario_id)
     VALUES (?, ?, ?)`,
    [idUsuario, provider, providerUserId],
  );
}

/** Convierte la fila de base de datos a un perfil seguro para devolver al cliente. */
function toPublicUser(user: UsuarioSocialRow): UsuarioPublico {
  const rol = user.rol_nombre!;
  return {
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    rol,
    rolLabel: getRolLabel(rol),
    activo: user.activo === 1,
    debe_cambiar_password: Number(user.debe_cambiar_password) === 1,
  };
}

/** Valida una identidad social contra la lista blanca y la vincula en el primer ingreso. */
export async function authorizeSocialIdentity(input: {
  provider: SocialProvider;
  providerUserId: string;
  email: string | null;
}): Promise<UsuarioPublico> {
  if (!input.email) {
    throw new Error('la cuenta social no entregó un correo electrónico verificable');
  }

  const user = await findActiveUserByEmail(input.email);
  if (!user) {
    throw new Error('tu correo no está autorizado para ingresar al sistema');
  }

  const identityOwner = await findIdentityOwner(input.provider, input.providerUserId);
  if (identityOwner !== null && identityOwner !== user.id_usuario) {
    throw new Error('esta cuenta social ya está vinculada a otro usuario');
  }

  if (identityOwner === null) {
    await linkIdentity(user.id_usuario, input.provider, input.providerUserId);
  }

  return toPublicUser(user);
}
