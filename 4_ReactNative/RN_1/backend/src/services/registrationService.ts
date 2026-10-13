// Archivo backend/src/services/registrationService.ts: el ciclo de registro, verificación, aprobación administrativa y entrega del token. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import pool from '../config/database';
import { hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { getRolLabel } from '../utils/roles';
import { createNotificacion } from './notificacionService';
import { sendAccessToken, sendAdministratorRegistrationNotice, sendRegistrationRejection, sendVerificationCode } from './emailService';
import type { SocialProvider } from '../types';
// Configuración: CODE_TTL_MINUTES establece minutos durante los que un código de verificación sigue vigente; modificá esta constante solo si querés cambiar esa regla para toda la aplicación.
const CODE_TTL_MINUTES = 10;
// Configuración: MAX_ATTEMPTS establece cantidad máxima de intentos permitidos para verificar un código; modificá esta constante solo si querés cambiar esa regla para toda la aplicación.
const MAX_ATTEMPTS = 5;
// Configuración: RESEND_COOLDOWN_SECONDS establece espera mínima antes de permitir reenviar un código; modificá esta constante solo si querés cambiar esa regla para toda la aplicación.
const RESEND_COOLDOWN_SECONDS = 60;
// Configuración: MAX_DAILY_SENDS establece cantidad máxima de códigos o tokens que pueden enviarse en un día; modificá esta constante solo si querés cambiar esa regla para toda la aplicación.
const MAX_DAILY_SENDS = 5;
// Configuración: ACCESS_TOKEN_TTL_HOURS establece horas de vigencia del token de acceso de una cuenta aprobada; modificá esta constante solo si querés cambiar esa regla para toda la aplicación.
const ACCESS_TOKEN_TTL_HOURS = 24;

// Contrato de datos RegistrationInput: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface RegistrationInput { nombre: string; apellido: string; email: string; password: string }
// Contrato de datos RegistrationRequest: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface RegistrationRequest { id_solicitud: number; nombre: string; apellido: string; email: string; created_at: string }
// Esta función calcula un HMAC del código de verificación asociado a la solicitud con un secreto del servidor; en la base se guarda el hash y no el valor utilizable. Recibe requestId, code como entrada.
function digest(requestId: number, code: string): string {
  const secret = process.env.VERIFICATION_CODE_SECRET;
  if (!secret || secret.length < 32) throw new Error('VERIFICATION_CODE_SECRET debe tener al menos 32 caracteres.');
  return createHmac('sha256', secret).update(`${requestId}:registro:${code}`).digest('hex');
}
// Esta función calcula un HMAC del token de acceso asociado a la cuenta con un secreto del servidor; en la base se guarda el hash y no el valor utilizable. Recibe userId, token como entrada.
function accessDigest(userId: number, token: string): string {
  const secret = process.env.VERIFICATION_CODE_SECRET;
  if (!secret || secret.length < 32) throw new Error('VERIFICATION_CODE_SECRET debe tener al menos 32 caracteres.');
  return createHmac('sha256', secret).update(`${userId}:acceso:${token}`).digest('hex');
}
// Esta función genera un token de acceso aleatorio y criptográficamente seguro que se entrega una sola vez a la persona aprobada.
function createAccessToken(): string {
  return randomBytes(32).toString('base64url');
}
// Esta función invalida tokens de acceso anteriores, guarda el hash del token nuevo con su vencimiento dentro de la transacción y devuelve el token en claro para enviarlo por correo. Recibe connection, userId como entrada.
async function storeAccessToken(connection: PoolConnection, userId: number): Promise<string> {
  const token = createAccessToken();
  await connection.query(
    `UPDATE codigos_acceso_usuario SET invalidado_at = NOW()
     WHERE id_usuario = ? AND consumido_at IS NULL AND invalidado_at IS NULL`, [userId],
  );
  await connection.execute(
    `INSERT INTO codigos_acceso_usuario (id_usuario, token_hash, expira_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${ACCESS_TOKEN_TTL_HOURS} HOUR))`,
    [userId, accessDigest(userId, token)],
  );
  return token;
}
// Esta función impide habilitar el flujo de registro si faltan el secreto para firmar códigos o las credenciales SMTP necesarias para enviar correo.
function assertMailAndCodeConfig(): void {
  if (!process.env.VERIFICATION_CODE_SECRET || process.env.VERIFICATION_CODE_SECRET.length < 32) throw new Error('Configurá VERIFICATION_CODE_SECRET (mínimo 32 caracteres).');
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) throw new Error('Configurá SMTP antes de habilitar el registro.');
}
// Esta función aplica los límites de frecuencia, genera un código de seis dígitos, guarda su HMAC con vencimiento en una transacción y lo envía al correo de la solicitud. Recibe requestId, email como entrada.
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

// Solicitudes permanecen fuera de usuarios hasta aprobación del administrador.
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

// Crea una solicitud mediante OAuth: la identidad del proveedor confirma el correo; aun así requiere aprobación y token.
export async function registerSocial(input: { nombre: string; apellido: string; email: string; provider: SocialProvider; providerUserId: string }): Promise<void> {
  assertMailAndCodeConfig();
  const nombre = input.nombre.trim().slice(0, 100) || 'Usuario';
  const apellido = input.apellido.trim().slice(0, 100) || 'Social';
  const email = input.email.trim().toLowerCase();
  if (!input.providerUserId || input.providerUserId.length > 255) throw new Error('No se pudo validar el identificador de la cuenta social.');
  // Hash aleatorio válido: estas cuentas autentican con OAuth y nunca quedan con hash vacío.
  const socialPasswordHash = await hashPassword(randomBytes(32).toString('hex'));
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 150) throw new Error('El proveedor no entregó un correo válido. Elegí otro método de registro.');
  const [users] = await pool.query<RowDataPacket[]>('SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1', [email]);
  if (users.length) throw new Error('Ya existe una cuenta con ese correo. Ingresá con tu cuenta o vinculá este proveedor desde el administrador.');
  const [existing] = await pool.query<RowDataPacket[]>('SELECT id_solicitud, estado FROM solicitudes_registro WHERE email = ? LIMIT 1', [email]);
  if (existing.length && existing[0].estado === 'pendiente_aprobacion') throw new Error('Tu solicitud ya fue verificada y espera la decisión del administrador.');
  if (existing.length && existing[0].estado === 'aprobada') throw new Error('Ya existe una cuenta con ese correo. Ingresá con tu cuenta.');
  if (existing.length) {
    await pool.execute(`UPDATE solicitudes_registro SET nombre = ?, apellido = ?, email = ?, password_hash = ?, proveedor_social = ?, proveedor_usuario_id = ?, estado = 'pendiente_aprobacion', email_verificado_at = NOW(), resuelta_at = NULL, resuelta_por = NULL WHERE id_solicitud = ?`, [nombre, apellido, email, socialPasswordHash, input.provider, input.providerUserId, Number(existing[0].id_solicitud)]);
    await pool.execute('UPDATE codigos_verificacion_solicitud SET invalidado_at = NOW() WHERE id_solicitud = ? AND consumido_at IS NULL AND invalidado_at IS NULL', [Number(existing[0].id_solicitud)]);
  } else {
    await pool.execute(`INSERT INTO solicitudes_registro (nombre, apellido, email, password_hash, proveedor_social, proveedor_usuario_id, estado, email_verificado_at) VALUES (?, ?, ?, ?, ?, ?, 'pendiente_aprobacion', NOW())`, [nombre, apellido, email, socialPasswordHash, input.provider, input.providerUserId]);
  }
  await notifyAdminsOfRegistration(nombre, email);
}

// Envía aviso in-app y por correo al administrador luego de verificar un correo.
export async function notifyAdminsOfRegistration(applicantName: string, email: string): Promise<void> {
  const [admins] = await pool.query<RowDataPacket[]>("SELECT u.id_usuario, u.email FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE r.nombre = 'administrador' AND u.activo = 1 ORDER BY u.id_usuario");
  for (const admin of admins) {
    try { await createNotificacion('Nueva solicitud de acceso', `${applicantName} (${email}) verificó su correo. Revisá Solicitudes para aceptar o denegar el acceso.`, 'info', null, Number(admin.id_usuario)); }
    catch { console.error('[registration] No se pudo guardar el aviso de solicitud para el administrador.'); }
    try { await sendAdministratorRegistrationNotice(String(admin.email), applicantName, email); }
    catch { console.error('[registration] No se pudo enviar el correo de aviso al administrador.'); }
  }
}
// Esta función aplica los límites de reenvío y genera un nuevo código de verificación para una solicitud que todavía no confirmó su correo. Recibe emailInput como entrada.
export async function resendVerification(emailInput: string): Promise<void> {
  assertMailAndCodeConfig();
  const email = emailInput.trim().toLowerCase();
  const [rows] = await pool.query<RowDataPacket[]>("SELECT id_solicitud FROM solicitudes_registro WHERE email = ? AND estado = 'pendiente_verificacion' LIMIT 1", [email]);
  if (rows.length) await issueCode(Number(rows[0].id_solicitud), email);
}

// Reenvía un token de acceso solo a cuentas aprobadas que todavía no lo canjearon.
export async function resendAccessToken(emailInput: string): Promise<void> {
  assertMailAndCodeConfig();
  const email = emailInput.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 150) return;
  const [users] = await pool.query<RowDataPacket[]>(
    `SELECT id_usuario, nombre, debe_cambiar_password FROM usuarios
     WHERE email = ? AND activo = 1 AND estado_cuenta = 'pendiente_acceso' LIMIT 1`, [email],
  );
  if (!users.length) return;
  const userId = Number(users[0].id_usuario);
  const [stats] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total, MAX(creado_at) AS ultimo FROM codigos_acceso_usuario
     WHERE id_usuario = ? AND creado_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`, [userId],
  );
  const total = Number(stats[0]?.total ?? 0);
  const lastSent = stats[0]?.ultimo ? new Date(stats[0].ultimo).getTime() : 0;
  if (total >= MAX_DAILY_SENDS) throw new Error('Se alcanzó el límite diario de reenvíos. Intentá mañana.');
  if (lastSent && Date.now() - lastSent < RESEND_COOLDOWN_SECONDS * 1000) throw new Error('Esperá un minuto antes de pedir otro token.');

  const connection = await pool.getConnection();
  let token: string;
  try {
    await connection.beginTransaction();
    const [lockedUsers] = await connection.query<RowDataPacket[]>(
      `SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND estado_cuenta = 'pendiente_acceso' AND activo = 1 FOR UPDATE`, [userId],
    );
    if (!lockedUsers.length) { await connection.commit(); return; }
    token = await storeAccessToken(connection, userId);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  await sendAccessToken(email, String(users[0].nombre), token, Number(users[0].debe_cambiar_password) === 1);
}

// Canjea el token de aprobación, activa el usuario y devuelve su sesión normal.
export async function redeemAccessToken(emailInput: string, tokenInput: string): Promise<{ token: string; usuario: import('../types').UsuarioPublico }> {
  const email = emailInput.trim().toLowerCase();
  const token = tokenInput.trim();
  if (!/^\S+@\S+\.\S+$/.test(email) || !token || token.length > 128) throw new Error('Correo o token inválido.');
  const connection = await pool.getConnection();
  let userId = 0;
  let userRow: RowDataPacket | undefined;
  try {
    await connection.beginTransaction();
    const [users] = await connection.query<RowDataPacket[]>(
      `SELECT u.id_usuario, u.email, u.nombre, u.apellido, u.id_rol, u.activo, u.debe_cambiar_password, r.nombre AS rol_nombre
       FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.email = ? AND u.activo = 1 AND u.estado_cuenta = 'pendiente_acceso' LIMIT 1 FOR UPDATE`, [email],
    );
    if (!users.length) throw new Error('No hay una cuenta aprobada pendiente de token para ese correo.');
    userRow = users[0];
    userId = Number(userRow.id_usuario);
    const [codes] = await connection.query<RowDataPacket[]>(
      `SELECT id_codigo, token_hash, intentos FROM codigos_acceso_usuario
       WHERE id_usuario = ? AND consumido_at IS NULL AND invalidado_at IS NULL AND expira_at > NOW()
       ORDER BY creado_at DESC LIMIT 1 FOR UPDATE`, [userId],
    );
    if (!codes.length || Number(codes[0].intentos) >= MAX_ATTEMPTS) throw new Error('El token venció o superó el límite de intentos. Pedí uno nuevo.');
    const expected = Buffer.from(String(codes[0].token_hash), 'hex');
    const received = Buffer.from(accessDigest(userId, token), 'hex');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      await connection.query('UPDATE codigos_acceso_usuario SET intentos = intentos + 1 WHERE id_codigo = ?', [codes[0].id_codigo]);
      await connection.commit();
      throw new Error('El token ingresado no es correcto.');
    }
    await connection.query('UPDATE codigos_acceso_usuario SET consumido_at = NOW() WHERE id_codigo = ?', [codes[0].id_codigo]);
    await connection.query("UPDATE usuarios SET estado_cuenta = 'activo' WHERE id_usuario = ?", [userId]);
    await connection.commit();
  } catch (error) {
    try { await connection.rollback(); } catch {
      // La transacción ya se había confirmado antes de propagar el error.
    }
    throw error;
  }
  finally { connection.release(); }

  const rol = String(userRow!.rol_nombre) as import('../types').RolNombre;
  const publicUser: import('../types').UsuarioPublico = {
    id_usuario: userId,
    nombre: String(userRow!.nombre),
    apellido: String(userRow!.apellido),
    email: String(userRow!.email),
    rol,
    rolLabel: getRolLabel(rol),
    activo: Number(userRow!.activo) === 1,
    debe_cambiar_password: Number(userRow!.debe_cambiar_password) === 1,
  };
  return { token: signToken({ id_usuario: userId, email: publicUser.email, rol }), usuario: publicUser };
}
// Esta función comprueba el código de verificación, registra que el correo fue confirmado y deja la solicitud esperando la decisión del administrador. Recibe emailInput, code como entrada.
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
  } catch (error) {
    try { await connection.rollback(); } catch {
      // La transacción ya se había confirmado antes de propagar el error.
    }
    throw error;
  }
  finally { connection.release(); }
  try { await notifyAdminsOfRegistration(applicantName, email); }
  catch {
    // La verificación ya quedó guardada; el administrador también verá la solicitud en la app.
  }
}
// Esta función implementa la operación «list pending requests» sobre registration: valida las reglas de negocio, consulta o modifica MySQL cuando corresponde y devuelve el resultado al controlador.
export async function listPendingRequests(): Promise<RegistrationRequest[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id_solicitud, nombre, apellido, email, created_at FROM solicitudes_registro
     WHERE estado = 'pendiente_aprobacion' ORDER BY created_at ASC`,
  );
  return rows as RegistrationRequest[];
}
// Esta función aprueba la solicitud o cambio solicitado, aplica las reglas de rol y estado, y prepara el token de acceso que se envía a la persona. Recibe requestId, adminId como entrada.
export async function approveRequest(requestId: number, adminId: number): Promise<void> {
  const connection = await pool.getConnection();
  let email = ''; let nombre = ''; let accessToken = ''; let setupPassword = false;
  try {
    await connection.beginTransaction();
    const [requests] = await connection.query<RowDataPacket[]>(
      `SELECT id_solicitud, nombre, apellido, email, password_hash, proveedor_social, proveedor_usuario_id FROM solicitudes_registro
       WHERE id_solicitud = ? AND estado = 'pendiente_aprobacion' FOR UPDATE`, [requestId],
    );
    if (!requests.length) throw new Error('La solicitud no existe o ya fue resuelta.');
    const request = requests[0];
    const [roles] = await connection.query<RowDataPacket[]>("SELECT id_rol FROM roles WHERE nombre = 'peon' LIMIT 1");
    if (!roles.length) throw new Error("Falta el rol inicial 'peon' en la tabla roles.");
    const [created] = await connection.execute<ResultSetHeader>(
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, activo, debe_cambiar_password, estado_cuenta, email_verificado_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, 'pendiente_acceso', NOW())`,
      [roles[0].id_rol, request.nombre, request.apellido, request.email, request.password_hash, request.proveedor_social ? 1 : 0],
    );
    if (request.proveedor_social && request.proveedor_usuario_id) {
      await connection.execute('INSERT INTO identidades_sociales (id_usuario, proveedor, proveedor_usuario_id) VALUES (?, ?, ?)', [created.insertId, request.proveedor_social, request.proveedor_usuario_id]);
    }
    accessToken = await storeAccessToken(connection, created.insertId);
    await connection.query("UPDATE solicitudes_registro SET estado = 'aprobada', password_hash = '', resuelta_at = NOW(), resuelta_por = ? WHERE id_solicitud = ?", [adminId, requestId]);
    await connection.commit();
    email = request.email; nombre = request.nombre; setupPassword = Boolean(request.proveedor_social);
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  try { await sendAccessToken(email, nombre, accessToken, setupPassword); }
  catch { throw new Error('La solicitud fue aprobada, pero no se pudo enviar el token. La persona puede pedir que se lo reenviemos desde la pantalla de ingreso.'); }
}
// Esta función rechaza la solicitud indicada y registra la decisión administrativa; según el flujo, también comunica el resultado por correo. Recibe requestId, adminId como entrada.
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
  try { await sendRegistrationRejection(email, nombre); } catch {
    // Un error de correo no revierte el rechazo administrativo ya guardado.
  }
}
