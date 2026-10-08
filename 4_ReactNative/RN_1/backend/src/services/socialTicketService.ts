// Códigos efímeros para completar OAuth sin exponer JWT en la URL.
import crypto from 'crypto';
import type { UsuarioPublico } from '../types';

interface SocialTicket {
  usuario: UsuarioPublico;
  rememberMe: boolean;
  expiresAt: number;
}

const tickets = new Map<string, SocialTicket>();
const TICKET_TTL_MS = 60_000;

/** Elimina códigos vencidos para limitar memoria y evitar que sean reutilizados. */
function removeExpiredTickets(): void {
  const now = Date.now();
  for (const [code, ticket] of tickets.entries()) {
    if (ticket.expiresAt <= now) tickets.delete(code);
  }
}

/** Genera un código aleatorio de un solo uso asociado temporalmente a la sesión social. */
export function createSocialTicket(usuario: UsuarioPublico, rememberMe: boolean): string {
  removeExpiredTickets();
  const code = crypto.randomBytes(32).toString('base64url');
  tickets.set(code, { usuario, rememberMe, expiresAt: Date.now() + TICKET_TTL_MS });
  return code;
}

/** Consume un código OAuth una única vez y devuelve la sesión correspondiente. */
export function consumeSocialTicket(code: string): Omit<SocialTicket, 'expiresAt'> | null {
  const ticket = tickets.get(code);
  tickets.delete(code);
  if (!ticket || ticket.expiresAt <= Date.now()) return null;
  return { usuario: ticket.usuario, rememberMe: ticket.rememberMe };
}
