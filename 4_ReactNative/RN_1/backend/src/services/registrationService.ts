import { createHmac, randomInt } from 'node:crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { hashPassword } from '../utils/password';
import { sendAdministratorRegistrationNotice, sendRegistrationDecision, sendVerificationCode } from './emailService';

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_DAILY_SENDS = 5;

export interface RegistrationInput { nombre: string; apellido: string; email: string; password: string }
export interface RegistrationRequest { id_solicitud: number; nombre: string; apellido: string; email: string; created_at: string }

function digest(requestId: number, code: string): string {
  const secret = process.env.VERIFICATION_CODE_SECRET;
  if (!secret || secret.length < 32) throw new Error('VERIFICATION_CODE_SECRET debe tener al menos 32 caracteres.');
  return createHmac('sha256', secret).update(`${requestId}:registro:${code}`).digest('hex');
}

function assertMailAndCodeConfig(): void {
  if (!process.env.VERIFICATION_CODE_SECRET || process.env.VERIFICATION_CODE_SECRET.length < 32) throw new Error('Configurá VERIFICATION_CODE_SECRET (mínimo 32 caracteres).');
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) throw new Error('Configurá SMTP antes de habilitar el registro.');
}

async function issueCode(requestId: number, email: string): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total, MAX(creado_at) AS ultimo FROM codigos_verificacion_solicitud
     WHERE id_solicitud = ? AND creado_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`, [requestId],
  );
  const total = Number(rows[0]?.total ?? 0);
  const lastSent = rows[0]?.ultimo ? new Date(rows[0].ultimo).getTime() : 0;
  if (total >= MAX_DAILY_SENDS) throw new Error('Se alcanzó el límite diario de códigos. Intentá mañana.');
  if (lastSent && Date.now() - lastSent < RESEND_COOLDOWN_SECONDS * 1000) throw new Error('Esperá un minuto antes de pedir otro código.');
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const codeHash = digest(requestId, code);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(`UPDATE codigos_verificacion_solicitud SET invalidado_at = NOW() WHERE id_solicitud = ? AND consumido_at IS NULL AND invalidado_at IS NULL`, [requestId]);
    await connection.query(`INSERT INTO codigos_verificacion_solicitud (id_solicitud, codigo_hash, expira_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${CODE_TTL_MINUTES} MINUTE))`, [requestId, codeHash]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  await sendVerificationCode(email, code);
}

/** Solicitudes permanecen fuera de usuarios hasta aprobación del administrador. */
export async function register(input: RegistrationInput): Promise<void> {
  assertMailAndCodeConfig();
  if (!input || typeof input.nombre !== 'string' || typeof input.apellido !== 'string' || typeof input.email !== 'string') throw new Error('Completá todos los campos del registro.');
  const nombre = input.nombre.trim(); const apellido = input.apellido.trim(); const email = input.email.trim().toLowerCase();
  if (!nombre || !apellido || nombre.length > 100 || apellido.length > 100) throw new Error('Ingresá nombre y apellido válidos.');
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 150) throw new Error('Ingresá un correo válido.');
  if (typeof input.password !== 'string' || input.password.length < 10 || Buffer.byteLength(input.password, 'utf8') > 72) throw new Error('La contraseña debe tener entre 10 y 72 bytes.');

  const [users] = await pool.query<RowDataPacket[]>('SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1', [email]);
  if (users.length) throw new Error('Ya existe una cuenta con ese correo.');
  const [existing] = await pool.query<RowDataPacket[]>('SELECT id_solicitud, estado FROM solicitudes_registro WHERE email = ? LIMIT 1', [email]);
  if (existing.length && existing[0].estado === 'pendiente_aprobacion') throw new Error('Tu solicitud ya está verificada y espera la decisión del administrador.');
  if (existing.length && existing[0].estado === 'aprobada') throw new Error('Ya existe una cuenta con ese correo.');

  const passwordHash = await hashPassword(input.password);
  let requestId: number;
  if (existing.length) {
    requestId = Number(existing[0].id_solicitud);
    await pool.execute(
      `UPDATE solicitudes_registro SET nombre = ?, apellido = ?, password_hash = ?, estado = 'pendiente_verificacion',
       email_verificado_at = NULL, resuelta_at = NULL, resuelta_por = NULL WHERE id_solicitud = ?`,
      [nombre, apellido, passwordHash, requestId],
    );
  } else {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO solicitudes_registro (nombre, apellido, email, password_hash) VALUES (?, ?, ?, ?)`,
      [nombre, apellido, email, passwordHash],
    );
    requestId = result.insertId;
  }
  await issueCode(requestId, email);
}

export async function resendVerification(emailInput: string): Promise<void> {
  assertMailAndCodeConfig();
  const email = emailInput.trim().toLowerCase();
  const [rows] = await pool.query<RowDataPacket[]>("SELECT id_solicitud FROM solicitudes_registro WHERE email = ? AND estado = 'pendiente_verificacion' LIMIT 1", [email]);
  if (rows.length) await issueCode(Number(rows[0].id_solicitud), email);
}

export async function verifyEmail(emailInput: string, code: string): Promise<void> {
  const email = emailInput.trim().toLowerCase();
  if (!/^\d{6}$/.test(code)) throw new Error('El código debe tener 6 dígitos.');
  const connection = await pool.getConnection();
  let applicantName = '';
  try {
    await connection.beginTransaction();
    const [requests] = await connection.query<RowDataPacket[]>("SELECT id_solicitud, nombre FROM solicitudes_registro WHERE email = ? AND estado = 'pendiente_verificacion' FOR UPDATE", [email]);
    if (!requests.length) throw new Error('No hay una solicitud pendiente de verificación para ese correo.');
    const requestId = Number(requests[0].id_solicitud);
    applicantName = String(requests[0].nombre);
    const [codes] = await connection.query<RowDataPacket[]>(
      `SELECT id_codigo, codigo_hash, intentos FROM codigos_verificacion_solicitud
       WHERE id_solicitud = ? AND consumido_at IS NULL AND invalidado_at IS NULL AND expira_at > NOW()
       ORDER BY creado_at DESC LIMIT 1 FOR UPDATE`, [requestId],
    );
    if (!codes.length || Number(codes[0].intentos) >= MAX_ATTEMPTS) throw new Error('El código venció o superó el límite de intentos. Pedí uno nuevo.');
    if (digest(requestId, code) !== codes[0].codigo_hash) {
      await connection.query('UPDATE codigos_verificacion_solicitud SET intentos = intentos + 1 WHERE id_codigo = ?', [codes[0].id_codigo]);
      await connection.commit();
      throw new Error('El código ingresado no es correcto.');
    }
    await connection.query('UPDATE codigos_verificacion_solicitud SET consumido_at = NOW() WHERE id_codigo = ?', [codes[0].id_codigo]);
    await connection.query("UPDATE solicitudes_registro SET estado = 'pendiente_aprobacion', email_verificado_at = NOW() WHERE id_solicitud = ?", [requestId]);
    await connection.commit();
  } catch (error) { try { await connection.rollback(); } catch { /* transacción ya confirmada */ } throw error; }
  finally { connection.release(); }
  try {
    const [admins] = await pool.query<RowDataPacket[]>("SELECT u.email FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE r.nombre = 'administrador' AND u.activo = 1 ORDER BY u.id_usuario LIMIT 1");
    if (admins.length) await sendAdministratorRegistrationNotice(String(admins[0].email), applicantName, email);
  } catch { /* la verificación ya quedó guardada; el administrador verá la solicitud en la app */ }
}

export async function listPendingRequests(): Promise<RegistrationRequest[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id_solicitud, nombre, apellido, email, created_at FROM solicitudes_registro
     WHERE estado = 'pendiente_aprobacion' ORDER BY created_at ASC`,
  );
  return rows as RegistrationRequest[];
}

export async function approveRequest(requestId: number, adminId: number): Promise<void> {
  const connection = await pool.getConnection();
  let email = ''; let nombre = '';
  try {
    await connection.beginTransaction();
    const [requests] = await connection.query<RowDataPacket[]>(
      `SELECT id_solicitud, nombre, apellido, email, password_hash FROM solicitudes_registro
       WHERE id_solicitud = ? AND estado = 'pendiente_aprobacion' FOR UPDATE`, [requestId],
    );
    if (!requests.length) throw new Error('La solicitud no existe o ya fue resuelta.');
    const request = requests[0];
    const [roles] = await connection.query<RowDataPacket[]>("SELECT id_rol FROM roles WHERE nombre = 'peon' LIMIT 1");
    if (!roles.length) throw new Error("Falta el rol inicial 'peon' en la tabla roles.");
    await connection.execute(
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, activo, debe_cambiar_password)
       VALUES (?, ?, ?, ?, ?, 1, 0)`,
      [roles[0].id_rol, request.nombre, request.apellido, request.email, request.password_hash],
    );
    await connection.query("UPDATE solicitudes_registro SET estado = 'aprobada', password_hash = '', resuelta_at = NOW(), resuelta_por = ? WHERE id_solicitud = ?", [adminId, requestId]);
    await connection.commit();
    email = request.email; nombre = request.nombre;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  try { await sendRegistrationDecision(email, nombre, true); }
  catch { throw new Error('La cuenta fue creada, pero no se pudo enviar el correo de aprobación.'); }
}

export async function rejectRequest(requestId: number, adminId: number): Promise<void> {
  const connection = await pool.getConnection(); let email = ''; let nombre = '';
  try {
    await connection.beginTransaction();
    const [requests] = await connection.query<RowDataPacket[]>("SELECT email, nombre FROM solicitudes_registro WHERE id_solicitud = ? AND estado = 'pendiente_aprobacion' FOR UPDATE", [requestId]);
    if (!requests.length) throw new Error('La solicitud no existe o ya fue resuelta.');
    await connection.execute("UPDATE solicitudes_registro SET estado = 'rechazada', password_hash = '', resuelta_at = NOW(), resuelta_por = ? WHERE id_solicitud = ?", [adminId, requestId]);
    await connection.commit(); email = requests[0].email; nombre = requests[0].nombre;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  try { await sendRegistrationDecision(email, nombre, false); } catch { /* no revierte la decisión guardada */ }
}
