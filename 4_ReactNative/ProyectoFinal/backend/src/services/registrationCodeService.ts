// genero y valido códigos de acceso con vencimiento y límites de reenvío.
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { env } from '../config/env.js';

const codeTtlMinutes = 10;
const resendCooldownSeconds = 60;
const maxDailyEmails = 5;
export const maxCodeAttempts = 5;
const allowedRoles = ['dueno', 'peon', 'veterinario'] as const;
export type RequestedRole = (typeof allowedRoles)[number];

// detengo los flujos de correo si falta configuración segura.
export function assertMailConfiguration(): void {
  const { smtpHost, smtpUser, smtpPassword, mailFrom, verificationCodeSecret } = env.email;
  if (!smtpHost || !smtpUser || !smtpPassword || !mailFrom) throw new Error('el registro todavía no está habilitado: falta configurar smtp');
  if (!verificationCodeSecret || verificationCodeSecret.length < 32) throw new Error('el registro requiere verification_code_secret de al menos 32 caracteres');
}

// calculo el hash del código con su identificador y finalidad.
export function digest(subject: string, purpose: string, code: string): string {
  const secret = env.email.verificationCodeSecret;
  if (!secret || secret.length < 32) throw new Error('configurá verification_code_secret con al menos 32 caracteres');
  return createHmac('sha256', secret).update(`${subject}:${purpose}:${code}`).digest('hex');
}

// comparo hashes en tiempo constante para evitar filtrar información por duración.
export function matchesDigest(expectedHex: string, receivedHex: string): boolean {
  const expected = Buffer.from(expectedHex, 'hex'); const received = Buffer.from(receivedHex, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

// guardo solo el hash del código nuevo e invalido los anteriores.
export async function issueCode(connection: PoolConnection, table: 'codigos_verificacion_solicitud' | 'codigos_acceso_usuario', idColumn: 'id_solicitud' | 'id_usuario', id: number, purpose: 'verificacion' | 'acceso'): Promise<string> {
  const [stats] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total, MAX(creado_at) AS ultimo FROM ${table} WHERE ${idColumn}=? AND creado_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`, [id]);
  const total = Number(stats[0]?.total ?? 0); const lastSent = stats[0]?.ultimo ? new Date(stats[0].ultimo).getTime() : 0;
  if (total >= maxDailyEmails) throw new Error('alcanzaste el límite diario de códigos; intentá mañana');
  if (lastSent && Date.now() - lastSent < resendCooldownSeconds * 1000) throw new Error('esperá un minuto antes de pedir otro código');
  await connection.execute(`UPDATE ${table} SET invalidado_at=NOW() WHERE ${idColumn}=? AND consumido_at IS NULL AND invalidado_at IS NULL`, [id]);
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const hash = digest(String(id), purpose, code);
  await connection.execute(`INSERT INTO ${table} (${idColumn},${table === 'codigos_verificacion_solicitud' ? 'codigo_hash' : 'token_hash'},expira_at) VALUES (?,?,DATE_ADD(NOW(),INTERVAL ${codeTtlMinutes} MINUTE))`, [id, hash]);
  return code;
}

// compruebo si el rol elegido puede asignarse desde la aprobación pública.
export function isRequestedRole(role: string): role is RequestedRole { return allowedRoles.includes(role as RequestedRole); }
