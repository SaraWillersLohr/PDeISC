// gestiono solicitudes de acceso, verificación por correo y aprobación administrativa.
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { database } from '../config/database.js';
import { env } from '../config/env.js';
import { sendAccessCode, sendNewRequestNotice, sendRegistrationRejection, sendVerificationCode } from './emailService.js';
import { createAccessToken, createRefreshToken } from '../utils/jwt.js';

const codeTtlMinutes = 10;
const maxCodeAttempts = 5;
const resendCooldownSeconds = 60;
const maxDailyEmails = 5;
const allowedRoles = ['dueno', 'peon', 'veterinario'] as const;
export type RequestedRole = (typeof allowedRoles)[number];

export interface RegistrationInput {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

export interface PendingRequest extends RowDataPacket {
  id_solicitud: number;
  nombre: string;
  apellido: string;
  email: string;
  created_at: Date;
}

interface UserRow extends RowDataPacket {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  token_version: number;
}

// convierto una cadena a hmac y detengo el flujo si no hay un secreto robusto.
function digest(subject: string, purpose: string, code: string): string {
  const secret = env.email.verificationCodeSecret;
  if (!secret || secret.length < 32) throw new Error('configurá verification_code_secret con al menos 32 caracteres');
  return createHmac('sha256', secret).update(`${subject}:${purpose}:${code}`).digest('hex');
}

// genero un código numérico aleatorio de seis dígitos.
function createCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

// comparo hashes en tiempo constante para no filtrar información por duración de respuesta.
function matchesDigest(expectedHex: string, receivedHex: string): boolean {
  const expected = Buffer.from(expectedHex, 'hex');
  const received = Buffer.from(receivedHex, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

// valido que el smtp esté listo antes de crear una solicitud que requiera correo.
function assertMailConfiguration(): void {
  const { smtpHost, smtpUser, smtpPassword, mailFrom, verificationCodeSecret } = env.email;
  if (!smtpHost || !smtpUser || !smtpPassword || !mailFrom) throw new Error('el registro todavía no está habilitado: falta configurar smtp');
  if (!verificationCodeSecret || verificationCodeSecret.length < 32) throw new Error('el registro requiere verification_code_secret de al menos 32 caracteres');
}

// invalido códigos anteriores, limita reenvíos y persiste solo el hash del código nuevo.
async function issueCode(connection: PoolConnection, table: 'codigos_verificacion_solicitud' | 'codigos_acceso_usuario', idColumn: 'id_solicitud' | 'id_usuario', id: number, purpose: 'verificacion' | 'acceso'): Promise<string> {
  const [stats] = await connection.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total, MAX(creado_at) AS ultimo FROM ${table}
     WHERE ${idColumn} = ? AND creado_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`, [id],
  );
  const total = Number(stats[0]?.total ?? 0);
  const lastSent = stats[0]?.ultimo ? new Date(stats[0].ultimo).getTime() : 0;
  if (total >= maxDailyEmails) throw new Error('alcanzaste el límite diario de códigos; intentá mañana');
  if (lastSent && Date.now() - lastSent < resendCooldownSeconds * 1000) throw new Error('esperá un minuto antes de pedir otro código');
  await connection.execute(
    `UPDATE ${table} SET invalidado_at = NOW() WHERE ${idColumn} = ? AND consumido_at IS NULL AND invalidado_at IS NULL`, [id],
  );
  const code = createCode();
  const codeHash = digest(String(id), purpose, code);
  await connection.execute(
    `INSERT INTO ${table} (${idColumn}, ${table === 'codigos_verificacion_solicitud' ? 'codigo_hash' : 'token_hash'}, expira_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${codeTtlMinutes} MINUTE))`, [id, codeHash],
  );
  return code;
}

// crea la solicitud pendiente y envía el primer código para verificar el correo.
export async function createRegistrationRequest(input: RegistrationInput): Promise<void> {
  assertMailConfiguration();
  const nombre = input?.nombre?.trim();
  const apellido = input?.apellido?.trim();
  const email = input?.email?.trim().toLowerCase();
  const password = input?.password;
  if (!nombre || !apellido || nombre.length > 100 || apellido.length > 100 || !/^\S+@\S+\.\S+$/.test(email ?? '') || email!.length > 150) {
    throw new Error('completá nombre, apellido y un correo válido');
  }
  if (typeof password !== 'string' || password.length < 10 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('la contraseña debe tener entre 10 y 72 bytes');
  }
  const [users] = await database.query<RowDataPacket[]>('SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1', [email]);
  if (users.length) throw new Error('ya existe una cuenta con ese correo');
  const passwordHash = await bcrypt.hash(password, 12);
  const connection = await database.getConnection();
  let idRequest = 0;
  let code = '';
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query<RowDataPacket[]>('SELECT id_solicitud, estado FROM solicitudes_registro WHERE email = ? LIMIT 1 FOR UPDATE', [email]);
    if (existing.length && existing[0].estado !== 'rechazada') throw new Error('ya existe una solicitud para ese correo; revisá tu correo o pedí otro código');
    if (existing.length) {
      idRequest = Number(existing[0].id_solicitud);
      await connection.execute(
        `UPDATE solicitudes_registro SET nombre = ?, apellido = ?, password_hash = ?, estado = 'pendiente_verificacion',
         email_verificado_at = NULL, resuelta_at = NULL, resuelta_por = NULL WHERE id_solicitud = ?`,
        [nombre, apellido, passwordHash, idRequest],
      );
    } else {
      const [created] = await connection.execute<ResultSetHeader>(
        'INSERT INTO solicitudes_registro (nombre, apellido, email, password_hash) VALUES (?, ?, ?, ?)',
        [nombre, apellido, email, passwordHash],
      );
      idRequest = created.insertId;
    }
    code = await issueCode(connection, 'codigos_verificacion_solicitud', 'id_solicitud', idRequest, 'verificacion');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  await sendVerificationCode(email, nombre, code);
}

// verifica el correo y mueve la solicitud a la cola que revisa el administrador.
export async function verifyRegistrationEmail(emailInput: string, code: string): Promise<void> {
  const email = emailInput.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) throw new Error('el correo o el código no son válidos');
  const connection = await database.getConnection();
  let wrongCode = false;
  let requestName = '';
  try {
    await connection.beginTransaction();
    const [requests] = await connection.query<PendingRequest[]>(
      `SELECT id_solicitud, nombre, apellido, email, created_at FROM solicitudes_registro
       WHERE email = ? AND estado = 'pendiente_verificacion' LIMIT 1 FOR UPDATE`, [email],
    );
    if (!requests.length) throw new Error('no hay solicitud pendiente de verificación para ese correo');
    const request = requests[0];
    const [codes] = await connection.query<RowDataPacket[]>(
      `SELECT id_codigo, codigo_hash, intentos FROM codigos_verificacion_solicitud
       WHERE id_solicitud = ? AND consumido_at IS NULL AND invalidado_at IS NULL AND expira_at > NOW()
       ORDER BY creado_at DESC LIMIT 1 FOR UPDATE`, [request.id_solicitud],
    );
    if (!codes.length || Number(codes[0].intentos) >= maxCodeAttempts) throw new Error('el código venció o superó el límite de intentos');
    if (!matchesDigest(String(codes[0].codigo_hash), digest(String(request.id_solicitud), 'verificacion', code))) {
      await connection.execute('UPDATE codigos_verificacion_solicitud SET intentos = intentos + 1 WHERE id_codigo = ?', [codes[0].id_codigo]);
      wrongCode = true;
      await connection.commit();
    } else {
      await connection.execute('UPDATE codigos_verificacion_solicitud SET consumido_at = NOW() WHERE id_codigo = ?', [codes[0].id_codigo]);
      await connection.execute("UPDATE solicitudes_registro SET estado = 'pendiente_aprobacion', email_verificado_at = NOW() WHERE id_solicitud = ?", [request.id_solicitud]);
      requestName = `${request.nombre} ${request.apellido}`;
      await connection.commit();
    }
  } catch (error) {
    try { await connection.rollback(); } catch { /* la transacción pudo quedar confirmada al contar un intento inválido. */ }
    throw error;
  } finally {
    connection.release();
  }
  if (wrongCode) throw new Error('el código ingresado no es correcto');
  const [admins] = await database.query<RowDataPacket[]>(
    `SELECT u.email FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
     WHERE r.nombre = 'administrador' AND u.activo = 1 AND u.estado_cuenta = 'activo'`,
  );
  for (const admin of admins) {
    try { await sendNewRequestNotice(String(admin.email), requestName, email); }
    catch { console.error('[auth] no se pudo enviar el aviso de una nueva solicitud.'); }
  }
}

// reenvía el código de verificación solo a solicitudes que aún no confirmaron el correo.
export async function resendRegistrationCode(emailInput: string): Promise<void> {
  assertMailConfiguration();
  const email = emailInput.trim().toLowerCase();
  const connection = await database.getConnection();
  let name = '';
  let code = '';
  try {
    await connection.beginTransaction();
    const [requests] = await connection.query<RowDataPacket[]>(
      "SELECT id_solicitud, nombre FROM solicitudes_registro WHERE email = ? AND estado = 'pendiente_verificacion' LIMIT 1 FOR UPDATE", [email],
    );
    if (!requests.length) throw new Error('no hay una solicitud pendiente de verificación para ese correo');
    name = String(requests[0].nombre);
    code = await issueCode(connection, 'codigos_verificacion_solicitud', 'id_solicitud', Number(requests[0].id_solicitud), 'verificacion');
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  await sendVerificationCode(email, name, code);
}

// lista las solicitudes con correo verificado y todavía sin resolución administrativa.
export async function listPendingRegistrationRequests(): Promise<PendingRequest[]> {
  const [rows] = await database.query<PendingRequest[]>(
    `SELECT id_solicitud, nombre, apellido, email, created_at FROM solicitudes_registro
     WHERE estado = 'pendiente_aprobacion' ORDER BY created_at ASC`,
  );
  return rows;
}

// aprueba la solicitud, asigna el rol y envía el código temporal de primer acceso.
export async function approveRegistrationRequest(id: number, adminId: number, role: RequestedRole): Promise<void> {
  if (!allowedRoles.includes(role)) throw new Error('elegí un rol permitido para la cuenta');
  const connection = await database.getConnection();
  let email = '';
  let name = '';
  let code = '';
  let idUser = 0;
  try {
    await connection.beginTransaction();
    const [requests] = await connection.query<PendingRequest[]>(
      `SELECT id_solicitud, nombre, apellido, email, password_hash, created_at FROM solicitudes_registro
       WHERE id_solicitud = ? AND estado = 'pendiente_aprobacion' FOR UPDATE`, [id],
    );
    if (!requests.length) throw new Error('la solicitud no existe o ya fue resuelta');
    const request = requests[0] as PendingRequest & { password_hash: string };
    const [roles] = await connection.query<RowDataPacket[]>('SELECT id_rol FROM roles WHERE nombre = ? LIMIT 1', [role]);
    if (!roles.length) throw new Error(`no existe el rol ${role}; aplicá primero la migración de roles`);
    const [created] = await connection.execute<ResultSetHeader>(
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, activo, debe_cambiar_password, estado_cuenta, email_verificado_at)
       VALUES (?, ?, ?, ?, ?, 1, 0, 'pendiente_acceso', NOW())`,
      [roles[0].id_rol, request.nombre, request.apellido, request.email, request.password_hash],
    );
    idUser = created.insertId;
    code = await issueCode(connection, 'codigos_acceso_usuario', 'id_usuario', idUser, 'acceso');
    await connection.execute(
      "UPDATE solicitudes_registro SET estado = 'aprobada', password_hash = '', resuelta_at = NOW(), resuelta_por = ? WHERE id_solicitud = ?",
      [adminId, id],
    );
    email = request.email;
    name = request.nombre;
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
  await sendAccessCode(email, name, code);
}

// rechaza una solicitud pendiente y deja la decisión vinculada al administrador.
export async function rejectRegistrationRequest(id: number, adminId: number): Promise<void> {
  const connection = await database.getConnection();
  let email = '';
  let name = '';
  try {
    await connection.beginTransaction();
    const [requests] = await connection.query<RowDataPacket[]>(
      "SELECT email, nombre, apellido FROM solicitudes_registro WHERE id_solicitud = ? AND estado = 'pendiente_aprobacion' FOR UPDATE", [id],
    );
    if (!requests.length) throw new Error('la solicitud no existe o ya fue resuelta');
    email = String(requests[0].email);
    name = `${requests[0].nombre} ${requests[0].apellido}`;
    await connection.execute(
      "UPDATE solicitudes_registro SET estado = 'rechazada', password_hash = '', resuelta_at = NOW(), resuelta_por = ? WHERE id_solicitud = ?",
      [adminId, id],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
  try { await sendRegistrationRejection(email, name); }
  catch { throw new Error('la solicitud fue rechazada, pero no se pudo enviar el aviso por correo'); }
}

// canjea el código enviado por el administrador, activa la cuenta e inicia la sesión.
export async function redeemAccessCode(emailInput: string, code: string) {
  const email = emailInput.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) throw new Error('el correo o el código no son válidos');
  const connection = await database.getConnection();
  let user: UserRow | undefined;
  let wrongCode = false;
  try {
    await connection.beginTransaction();
    const [users] = await connection.query<UserRow[]>(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.token_version, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.email = ? AND u.activo = 1 AND u.estado_cuenta = 'pendiente_acceso' LIMIT 1 FOR UPDATE`, [email],
    );
    if (!users.length) throw new Error('no hay una cuenta aprobada pendiente de activación para ese correo');
    user = users[0];
    const [codes] = await connection.query<RowDataPacket[]>(
      `SELECT id_codigo, token_hash, intentos FROM codigos_acceso_usuario
       WHERE id_usuario = ? AND consumido_at IS NULL AND invalidado_at IS NULL AND expira_at > NOW()
       ORDER BY creado_at DESC LIMIT 1 FOR UPDATE`, [user.id_usuario],
    );
    if (!codes.length || Number(codes[0].intentos) >= maxCodeAttempts) throw new Error('el código venció o superó el límite de intentos; pedí uno nuevo');
    if (!matchesDigest(String(codes[0].token_hash), digest(String(user.id_usuario), 'acceso', code))) {
      await connection.execute('UPDATE codigos_acceso_usuario SET intentos = intentos + 1 WHERE id_codigo = ?', [codes[0].id_codigo]);
      wrongCode = true;
      await connection.commit();
    } else {
      await connection.execute('UPDATE codigos_acceso_usuario SET consumido_at = NOW() WHERE id_codigo = ?', [codes[0].id_codigo]);
      await connection.execute("UPDATE usuarios SET estado_cuenta = 'activo' WHERE id_usuario = ?", [user.id_usuario]);
      await connection.commit();
    }
  } catch (error) {
    try { await connection.rollback(); } catch { /* la transacción pudo confirmarse al contar un intento inválido. */ }
    throw error;
  } finally { connection.release(); }
  if (wrongCode || !user) throw new Error('el código ingresado no es correcto');
  const authenticated = { id_usuario: user.id_usuario, email: user.email, rol: user.rol };
  return {
    accessToken: createAccessToken(authenticated),
    refreshToken: createRefreshToken(authenticated),
    usuario: { ...authenticated, nombre: user.nombre, apellido: user.apellido },
  };
}

// reenvío un código solo cuando la cuenta ya fue aprobada y sigue pendiente de activación.
export async function resendAccessCode(emailInput: string): Promise<void> {
  assertMailConfiguration();
  const email = emailInput.trim().toLowerCase();
  const [users] = await database.query<RowDataPacket[]>(
    `SELECT id_usuario, nombre FROM usuarios
     WHERE email = ? AND activo = 1 AND estado_cuenta = 'pendiente_acceso' LIMIT 1`, [email],
  );
  if (!users.length) return;
  const connection = await database.getConnection();
  let code = '';
  try {
    await connection.beginTransaction();
    const [locked] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND estado_cuenta = 'pendiente_acceso' AND activo = 1 FOR UPDATE", [users[0].id_usuario],
    );
    if (!locked.length) { await connection.commit(); return; }
    code = await issueCode(connection, 'codigos_acceso_usuario', 'id_usuario', Number(users[0].id_usuario), 'acceso');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
  await sendAccessCode(email, String(users[0].nombre), code);
}
