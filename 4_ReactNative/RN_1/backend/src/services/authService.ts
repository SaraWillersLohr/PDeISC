// Archivo backend/src/services/authService.ts: el inicio de sesión, la lectura del perfil y el cambio de contraseña. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// logica de login y perfil
import pool from '../config/database';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { getRolLabel } from '../utils/roles';
import type { LoginRequest, UsuarioDB, UsuarioPublico } from '../types';
import type { RowDataPacket } from 'mysql2';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { sendPasswordRecoveryCode } from './emailService';

const RECOVERY_CODE_TTL_MINUTES = 10;
const RECOVERY_RESEND_COOLDOWN_SECONDS = 60;
const RECOVERY_MAX_DAILY_SENDS = 5;
const RECOVERY_MAX_ATTEMPTS = 5;

// Esta función genera un HMAC del código ligado al usuario; la base de datos conserva el hash y no el código que se manda por correo.
function passwordRecoveryDigest(userId: number, code: string): string {
  const secret = process.env.VERIFICATION_CODE_SECRET;
  if (!secret || secret.length < 32) throw new Error('VERIFICATION_CODE_SECRET debe tener al menos 32 caracteres.');
  return createHmac('sha256', secret).update(`${userId}:recuperacion:${code}`).digest('hex');
}

// Contrato de datos UsuarioRow: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface UsuarioRow extends RowDataPacket, UsuarioDB {}

// busco usuario por email incluyendo nombre del rol
async function findByEmail(email: string): Promise<UsuarioRow | null> {
  const [rows] = await pool.query<UsuarioRow[]>(
    `SELECT u.*, r.nombre AS rol_nombre
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.email = ? AND u.activo = 1 AND u.estado_cuenta = 'activo'
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
     WHERE u.id_usuario = ? AND u.activo = 1 AND u.estado_cuenta = 'activo'
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
    token_version: Number(usuario.token_version),
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
  if (!nuevaPassword || nuevaPassword.length < 10 || Buffer.byteLength(nuevaPassword, 'utf8') > 72) {
    throw new Error('la contraseña debe tener entre 10 y 72 bytes');
  }

  const passwordHash = await hashPassword(nuevaPassword);
  await pool.query(
    `UPDATE usuarios SET password_hash = ?, debe_cambiar_password = 0 WHERE id_usuario = ?`,
    [passwordHash, idUsuario],
  );

  return getProfile(idUsuario);
}

// Esta función emite un código de recuperación solo para cuentas activas; responde igual para correos inexistentes y limita los reenvíos para evitar enumeración y abuso.
export async function requestPasswordRecovery(emailInput: string): Promise<void> {
  const email = emailInput.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 150) return;
  const [users] = await pool.query<RowDataPacket[]>(
    "SELECT id_usuario, nombre FROM usuarios WHERE email = ? AND activo = 1 AND estado_cuenta = 'activo' LIMIT 1", [email],
  );
  if (!users.length) return;
  const userId = Number(users[0].id_usuario);
  const [stats] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total, MAX(creado_at) AS ultimo FROM codigos_recuperacion_password
     WHERE id_usuario = ? AND creado_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`, [userId],
  );
  const total = Number(stats[0]?.total ?? 0);
  const lastSent = stats[0]?.ultimo ? new Date(stats[0].ultimo).getTime() : 0;
  if (total >= RECOVERY_MAX_DAILY_SENDS || (lastSent && Date.now() - lastSent < RECOVERY_RESEND_COOLDOWN_SECONDS * 1000)) return;

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [lockedUsers] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND activo = 1 AND estado_cuenta = 'activo' FOR UPDATE", [userId],
    );
    if (!lockedUsers.length) { await connection.commit(); return; }
    await connection.execute(
      `UPDATE codigos_recuperacion_password SET invalidado_at = NOW()
       WHERE id_usuario = ? AND consumido_at IS NULL AND invalidado_at IS NULL`, [userId],
    );
    await connection.execute(
      `INSERT INTO codigos_recuperacion_password (id_usuario, codigo_hash, expira_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${RECOVERY_CODE_TTL_MINUTES} MINUTE))`,
      [userId, passwordRecoveryDigest(userId, code)],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  await sendPasswordRecoveryCode(email, String(users[0].nombre), code);
}

// Esta función verifica el código temporal, cambia el hash de contraseña y aumenta la versión de sesión para invalidar todos los JWT emitidos antes de la recuperación.
export async function resetPasswordWithCode(emailInput: string, code: string, newPassword: string): Promise<void> {
  const email = emailInput.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) throw new Error('El correo o el código no son válidos.');
  if (typeof newPassword !== 'string' || newPassword.length < 10 || Buffer.byteLength(newPassword, 'utf8') > 72) {
    throw new Error('La contraseña debe tener entre 10 y 72 bytes.');
  }
  const passwordHash = await hashPassword(newPassword);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE email = ? AND activo = 1 AND estado_cuenta = 'activo' LIMIT 1 FOR UPDATE", [email],
    );
    if (!users.length) throw new Error('El código no es válido o venció.');
    const userId = Number(users[0].id_usuario);
    const [codes] = await connection.query<RowDataPacket[]>(
      `SELECT id_codigo, codigo_hash, intentos FROM codigos_recuperacion_password
       WHERE id_usuario = ? AND consumido_at IS NULL AND invalidado_at IS NULL AND expira_at > NOW()
       ORDER BY creado_at DESC LIMIT 1 FOR UPDATE`, [userId],
    );
    if (!codes.length || Number(codes[0].intentos) >= RECOVERY_MAX_ATTEMPTS) throw new Error('El código no es válido o venció.');
    const expected = Buffer.from(String(codes[0].codigo_hash), 'hex');
    const received = Buffer.from(passwordRecoveryDigest(userId, code), 'hex');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      await connection.execute('UPDATE codigos_recuperacion_password SET intentos = intentos + 1 WHERE id_codigo = ?', [codes[0].id_codigo]);
      await connection.commit();
      throw new Error('El código no es válido o venció.');
    }
    await connection.execute('UPDATE codigos_recuperacion_password SET consumido_at = NOW() WHERE id_codigo = ?', [codes[0].id_codigo]);
    await connection.execute(
      'UPDATE usuarios SET password_hash = ?, token_version = token_version + 1 WHERE id_usuario = ?', [passwordHash, userId],
    );
    await connection.execute(
      'UPDATE codigos_recuperacion_password SET invalidado_at = NOW() WHERE id_usuario = ? AND id_codigo <> ? AND consumido_at IS NULL AND invalidado_at IS NULL',
      [userId, codes[0].id_codigo],
    );
    await connection.commit();
  } catch (error) {
    try { await connection.rollback(); } catch { /* La transacción pudo haberse confirmado al registrar un intento inválido. */ }
    throw error;
  } finally {
    connection.release();
  }
}

// Esta función revoca todas las sesiones JWT del usuario al incrementar la versión que valida el middleware en cada petición.
export async function revokeUserSessions(idUsuario: number): Promise<void> {
  await pool.execute('UPDATE usuarios SET token_version = token_version + 1 WHERE id_usuario = ?', [idUsuario]);
}

