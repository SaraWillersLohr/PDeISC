// valido credenciales contra mariadb y preparo una sesión segura.
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';
import { env } from '../config/env.js';
import type { AuthenticatedUser, LoginInput } from '../types/auth.js';
import { createAccessToken, createPasswordRecoveryToken, createRefreshToken, verifyPasswordRecoveryToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendPasswordRecoveryCode } from './emailService.js';

const recoveryTtlMinutes = 10;
const recoveryMaxAttempts = 5;
const recoveryResendCooldownSeconds = 60;
const recoveryMaxDailyEmails = 5;
const googleVerifier = new OAuth2Client();

interface UserRow extends RowDataPacket, AuthenticatedUser {
  password_hash: string;
  nombre: string;
  apellido: string;
  foto_perfil: string | null;
}

interface RecoveryUserRow extends RowDataPacket, AuthenticatedUser {
  nombre: string;
  apellido: string;
  foto_perfil: string | null;
  token_version: number;
}

// guardo códigos como HMAC y no como texto para que una filtración de la tabla no los revele.
function recoveryDigest(userId: number, code: string): string {
  const secret = env.email.verificationCodeSecret;
  if (!secret || secret.length < 32) throw new Error('configurá verification_code_secret con al menos 32 caracteres');
  return createHmac('sha256', secret).update(`${userId}:password-recovery:${code}`).digest('hex');
}

function digestMatches(expectedHex: string, receivedHex: string): boolean {
  const expected = Buffer.from(expectedHex, 'hex');
  const received = Buffer.from(receivedHex, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

// inicio sesión después de comprobar la contraseña hasheada.
export async function login(input: LoginInput) {
  const [rows] = await database.execute<UserRow[]>(
    `select u.id_usuario, u.email, u.password_hash, u.nombre, u.apellido, u.foto_perfil, r.nombre as rol
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
    usuario: { ...sessionUser, nombre: user.nombre, apellido: user.apellido, foto_perfil: user.foto_perfil },
  };
}

type SocialProvider = 'google' | 'facebook' | 'github';

// verifico la identidad directamente con el proveedor antes de asociarla a una cuenta ya aprobada.
export async function loginWithSocial(provider: SocialProvider, code: string, redirectUri?: string, codeVerifier?: string, clientId?: string) {
  if (!code || code.length > 4096 || !redirectUri || redirectUri.length > 500) throw new Error('La credencial social no es válida.');
  let providerClientId = clientId ?? '';
  let tokenEndpoint = '';
  let tokenBody: Record<string, string> = {};
  if (provider === 'google') {
    const { googleClientIds, googleClientSecret } = env.socialAuth;
    if (!googleClientIds.includes(providerClientId)) throw new Error('El acceso con Google todavía no está configurado.');
    tokenEndpoint = 'https://oauth2.googleapis.com/token';
    tokenBody = { client_id: providerClientId, ...(googleClientSecret ? { client_secret: googleClientSecret } : {}), code, redirect_uri: redirectUri, grant_type: 'authorization_code', ...(codeVerifier ? { code_verifier: codeVerifier } : {}) };
  } else if (provider === 'facebook') {
    const { facebookAppId, facebookAppSecret } = env.socialAuth;
    if (!facebookAppId || !facebookAppSecret || providerClientId !== facebookAppId) throw new Error('El acceso con Facebook todavía no está configurado.');
    tokenEndpoint = 'https://graph.facebook.com/oauth/access_token';
    tokenBody = { client_id: facebookAppId, client_secret: facebookAppSecret, code, redirect_uri: redirectUri };
  } else {
    const { githubClientId, githubClientSecret } = env.socialAuth;
    if (!githubClientId || !githubClientSecret || providerClientId !== githubClientId) throw new Error('El acceso con GitHub todavía no está configurado.');
    tokenEndpoint = 'https://github.com/login/oauth/access_token';
    tokenBody = { client_id: githubClientId, client_secret: githubClientSecret, code, redirect_uri: redirectUri, ...(codeVerifier ? { code_verifier: codeVerifier } : {}) };
  }
  const tokenUrl = new URL(tokenEndpoint);
  if (provider === 'facebook') for (const [key, value] of Object.entries(tokenBody)) tokenUrl.searchParams.set(key, value);
  const tokenResponse = await fetch(tokenUrl, {
    method: provider === 'facebook' ? 'GET' : 'POST',
    headers: { Accept: 'application/json', ...(provider === 'facebook' ? {} : { 'Content-Type': 'application/json' }) },
    ...(provider === 'facebook' ? { } : { body: JSON.stringify(tokenBody) }),
  });
  if (!tokenResponse.ok) throw new Error('El proveedor no pudo validar el inicio de sesión.');
  const tokenData = await tokenResponse.json() as { access_token?: string; id_token?: string };
  const accessToken = tokenData.access_token;
  if (!accessToken) throw new Error('El proveedor no pudo validar el inicio de sesión.');
  let email = '';
  let fullName = '';

  if (provider === 'google') {
    if (!tokenData.id_token) throw new Error('Google no pudo verificar la cuenta.');
    const ticket = await googleVerifier.verifyIdToken({ idToken: tokenData.id_token, audience: providerClientId });
    const identity = ticket.getPayload();
    if (!identity?.email_verified) throw new Error('Google no pudo verificar el correo.');
    email = identity.email ?? '';
    fullName = identity.name ?? '';
  } else if (provider === 'facebook') {
    const { facebookAppId, facebookAppSecret } = env.socialAuth;
    if (!facebookAppId || !facebookAppSecret) throw new Error('El acceso con Facebook todavía no está configurado.');
    const debugUrl = new URL('https://graph.facebook.com/debug_token');
    debugUrl.searchParams.set('input_token', accessToken);
    debugUrl.searchParams.set('access_token', `${facebookAppId}|${facebookAppSecret}`);
    const debugResponse = await fetch(debugUrl);
    const debug = await debugResponse.json() as { data?: { app_id?: string; user_id?: string; is_valid?: boolean } };
    if (!debugResponse.ok || !debug.data?.is_valid || debug.data.app_id !== facebookAppId || !debug.data.user_id) throw new Error('Facebook no pudo verificar la cuenta.');
    const profileResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`);
    const profile = await profileResponse.json() as { id?: string; name?: string; email?: string };
    if (!profileResponse.ok || profile.id !== debug.data.user_id) throw new Error('Facebook no pudo verificar la cuenta.');
    email = profile.email ?? '';
    fullName = profile.name ?? '';
  } else {
    const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    const [profileResponse, emailsResponse] = await Promise.all([
      fetch('https://api.github.com/user', { headers }), fetch('https://api.github.com/user/emails', { headers }),
    ]);
    const profile = await profileResponse.json() as { name?: string; login?: string };
    const emails = await emailsResponse.json() as Array<{ email?: string; primary?: boolean; verified?: boolean }>;
    if (!profileResponse.ok || !emailsResponse.ok) throw new Error('GitHub no pudo verificar la cuenta.');
    email = emails.find((item) => item.primary && item.verified)?.email ?? '';
    fullName = profile.name || profile.login || '';
  }

  email = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('El proveedor no devolvió un correo verificado.');
  const [users] = await database.execute<UserRow[]>(
    `SELECT u.id_usuario, u.email, u.nombre, u.apellido, u.foto_perfil, r.nombre AS rol
     FROM usuarios u INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.email = ? AND u.activo = 1 AND u.estado_cuenta = 'activo' LIMIT 1`, [email],
  );
  const user = users[0];
  if (!user) throw new Error('No hay una cuenta activa con ese correo. Solicitá acceso primero.');
  const sessionUser: AuthenticatedUser = { id_usuario: user.id_usuario, email: user.email, rol: user.rol };
  return {
    accessToken: createAccessToken(sessionUser),
    refreshToken: createRefreshToken(sessionUser),
    usuario: { ...sessionUser, nombre: user.nombre || fullName, apellido: user.apellido, foto_perfil: user.foto_perfil },
  };
}

// actualizo únicamente el perfil de la persona autenticada.
export async function updateProfile(userId: number, input: { nombre?: unknown; apellido?: unknown; foto_perfil?: unknown }) {
  const nombre = typeof input.nombre === 'string' ? input.nombre.trim() : '';
  const apellido = typeof input.apellido === 'string' ? input.apellido.trim() : '';
  const photo = input.foto_perfil == null || input.foto_perfil === '' ? null : String(input.foto_perfil);
  if (!nombre || nombre.length > 100 || !apellido || apellido.length > 100) throw new Error('Completá nombre y apellido válidos.');
  if (photo && (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) || Buffer.byteLength(photo, 'utf8') > 1_500_000)) {
    throw new Error('La foto debe ser una imagen válida de hasta 1,5 MB.');
  }
  await database.execute('UPDATE usuarios SET nombre = ?, apellido = ?, foto_perfil = ? WHERE id_usuario = ? AND activo = 1', [nombre, apellido, photo, userId]);
  const [rows] = await database.execute<RowDataPacket[]>(`SELECT u.id_usuario,u.email,u.nombre,u.apellido,u.foto_perfil,r.nombre AS rol FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE u.id_usuario=? AND u.activo=1 LIMIT 1`, [userId]);
  if (!rows.length) throw new Error('No se encontró el perfil activo.');
  return rows[0];
}

// verifico la contraseña actual antes de reemplazarla por una nueva.
export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
  if (!currentPassword) throw new Error('Ingresá tu contraseña actual.');
  if (newPassword.length < 10 || Buffer.byteLength(newPassword, 'utf8') > 72) throw new Error('La contraseña nueva debe tener entre 10 y 72 bytes.');
  const [rows] = await database.execute<UserRow[]>('SELECT password_hash FROM usuarios WHERE id_usuario=? AND activo=1 LIMIT 1', [userId]);
  if (!rows.length || !(await bcrypt.compare(currentPassword, rows[0].password_hash))) throw new Error('La contraseña actual no es correcta.');
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await database.execute('UPDATE usuarios SET password_hash=?, token_version=token_version+1 WHERE id_usuario=?', [passwordHash, userId]);
}

// renuevo los tokens usando un refresh token que ya fue validado.
export function refresh(refreshToken: string) {
  const user = verifyRefreshToken(refreshToken);

  return {
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
  };
}

// envío códigos de recuperación con límite de reenvíos y respuesta neutra para correos desconocidos.
export async function requestPasswordRecovery(emailInput: string): Promise<void> {
  const email = emailInput.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 150) return;
  const [users] = await database.query<RecoveryUserRow[]>(
    "SELECT id_usuario, email, nombre, apellido, token_version, '' AS rol FROM usuarios WHERE email = ? AND activo = 1 AND estado_cuenta = 'activo' LIMIT 1",
    [email],
  );
  if (!users.length) return;
  const userId = Number(users[0].id_usuario);
  const [stats] = await database.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total, MAX(creado_at) AS ultimo FROM codigos_recuperacion_password
     WHERE id_usuario = ? AND creado_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`, [userId],
  );
  const total = Number(stats[0]?.total ?? 0);
  const lastSent = stats[0]?.ultimo ? new Date(stats[0].ultimo as string | Date).getTime() : 0;
  if (total >= recoveryMaxDailyEmails || (lastSent && Date.now() - lastSent < recoveryResendCooldownSeconds * 1000)) return;

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [lockedUsers] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND activo = 1 AND estado_cuenta = 'activo' FOR UPDATE", [userId],
    );
    if (!lockedUsers.length) { await connection.commit(); return; }
    await connection.execute(
      'UPDATE codigos_recuperacion_password SET invalidado_at = NOW() WHERE id_usuario = ? AND consumido_at IS NULL AND invalidado_at IS NULL', [userId],
    );
    await connection.execute(
      `INSERT INTO codigos_recuperacion_password (id_usuario, codigo_hash, expira_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${recoveryTtlMinutes} MINUTE))`, [userId, recoveryDigest(userId, code)],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
  await sendPasswordRecoveryCode(email, users[0].nombre, code);
}

// valido el código con intentos limitados y lo canjeo por un permiso de 15 minutos.
export async function redeemPasswordRecoveryCode(emailInput: string, code: string): Promise<{ resetToken: string }> {
  const email = emailInput.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) throw new Error('El correo o el código no son válidos.');
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.query<RecoveryUserRow[]>(
      `SELECT u.id_usuario, u.email, u.nombre, u.apellido, u.foto_perfil, u.token_version, r.nombre AS rol
       FROM usuarios u INNER JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.email = ? AND u.activo = 1 AND u.estado_cuenta = 'activo' LIMIT 1 FOR UPDATE`, [email],
    );
    if (!users.length) throw new Error('El código no es válido o venció.');
    const user = users[0];
    const userId = Number(user.id_usuario);
    const [codes] = await connection.query<RowDataPacket[]>(
      `SELECT id_codigo, codigo_hash, intentos FROM codigos_recuperacion_password
       WHERE id_usuario = ? AND consumido_at IS NULL AND invalidado_at IS NULL AND expira_at > NOW()
       ORDER BY creado_at DESC LIMIT 1 FOR UPDATE`, [userId],
    );
    if (!codes.length || Number(codes[0].intentos) >= recoveryMaxAttempts) throw new Error('El código no es válido o venció.');
    if (!digestMatches(String(codes[0].codigo_hash), recoveryDigest(userId, code))) {
      await connection.execute('UPDATE codigos_recuperacion_password SET intentos = intentos + 1 WHERE id_codigo = ?', [codes[0].id_codigo]);
      await connection.commit();
      throw new Error('El código no es válido o venció.');
    }
    const resetToken = createPasswordRecoveryToken({
      id_usuario: userId,
      email: user.email,
      rol: user.rol,
      token_version: Number(user.token_version),
    });
    await connection.execute('UPDATE codigos_recuperacion_password SET consumido_at = NOW() WHERE id_codigo = ?', [codes[0].id_codigo]);
    await connection.execute(
      'UPDATE codigos_recuperacion_password SET invalidado_at = NOW() WHERE id_usuario = ? AND id_codigo <> ? AND consumido_at IS NULL AND invalidado_at IS NULL',
      [userId, codes[0].id_codigo],
    );
    await connection.commit();
    return { resetToken };
  } catch (error) {
    try { await connection.rollback(); } catch { /* El intento inválido pudo haberse confirmado antes del error. */ }
    throw error;
  } finally { connection.release(); }
}

// actualizo la contraseña una sola vez y devuelvo una sesión para continuar en la app.
export async function completePasswordRecovery(resetToken: string, newPassword: string) {
  if (typeof newPassword !== 'string' || newPassword.length < 10 || Buffer.byteLength(newPassword, 'utf8') > 72) {
    throw new Error('La contraseña debe tener entre 10 y 72 bytes.');
  }
  const recovery = verifyPasswordRecoveryToken(resetToken);
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const connection = await database.getConnection();
  let user: RecoveryUserRow;
  let tokenVersion = 0;
  try {
    await connection.beginTransaction();
    const [users] = await connection.query<RecoveryUserRow[]>(
      `SELECT u.id_usuario, u.email, u.nombre, u.apellido, u.foto_perfil, u.token_version, r.nombre AS rol
       FROM usuarios u INNER JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = ? AND u.email = ? AND u.activo = 1 AND u.estado_cuenta = 'activo' LIMIT 1 FOR UPDATE`,
      [recovery.id_usuario, recovery.email],
    );
    if (!users.length || Number(users[0].token_version) !== Number(recovery.token_version)) {
      throw new Error('El permiso de recuperación venció o ya fue utilizado.');
    }
    user = users[0];
    tokenVersion = Number(user.token_version) + 1;
    await connection.execute('UPDATE usuarios SET password_hash = ?, token_version = ? WHERE id_usuario = ?', [passwordHash, tokenVersion, user.id_usuario]);
    await connection.execute(
      'UPDATE codigos_recuperacion_password SET invalidado_at = NOW() WHERE id_usuario = ? AND consumido_at IS NULL AND invalidado_at IS NULL', [user.id_usuario],
    );
    await connection.commit();
  } catch (error) {
    try { await connection.rollback(); } catch { /* La transacción pudo haberse confirmado antes del error. */ }
    throw error;
  } finally { connection.release(); }
  const sessionUser: AuthenticatedUser = { id_usuario: user.id_usuario, email: user.email, rol: user.rol };
  return {
    accessToken: createAccessToken(sessionUser),
    refreshToken: createRefreshToken(sessionUser),
    usuario: { ...sessionUser, nombre: user.nombre, apellido: user.apellido, foto_perfil: user.foto_perfil },
  };
}
