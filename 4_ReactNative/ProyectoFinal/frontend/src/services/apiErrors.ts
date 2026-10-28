// traduzco errores http y de red a mensajes breves para la interfaz.
export const apiConfigurationMessage = 'La aplicación no está conectada al servicio. Avisale al administrador.';

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try { return await fetch(input, init); }
  catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('La solicitud tardó demasiado. Intentá de nuevo.');
    throw new Error('No pudimos conectar con el servicio. Revisá tu conexión e intentá nuevamente.');
  }
}

export function friendlyApiMessage(message: string | undefined, status: number, fallback: string): string {
  if (status === 503 || status >= 500) return 'Hay un problema temporal al cargar la información. Intentá de nuevo en unos segundos.';
  if (status === 401 && /sesión|token/i.test(message ?? '')) return 'Tu sesión venció. Iniciá sesión nuevamente.';
  if (status === 403) return 'Tu perfil no tiene permiso para realizar esta acción.';
  const text = message?.trim();
  if (!text) return fallback;
  if (/migraci[oó]n|\bER_[A-Z0-9_]+\b|\bSQL\b|\bJWT\b|token_version|endpoint|stack trace|syntax error|fetch failed|network request failed|\bECONN[A-Z]+\b|\bETIMEDOUT\b|smtp_|verification_code_secret|jwt_secret|\b.env\b|access denied|connection (refused|lost)|cannot connect|socket hang up|internal server error/i.test(text)) {
    return 'No pudimos completar esta acción. Probá de nuevo más tarde o consultá al administrador.';
  }
  if (/entre 10 y 72 bytes/i.test(text)) return 'La contraseña debe tener al menos 10 caracteres y no superar el límite permitido.';
  if (/base de datos no est[aá] disponible/i.test(text)) return 'Hay un problema temporal al cargar la información. Intentá de nuevo en unos segundos.';
  return text;
}

// limpio excepciones de red, almacenamiento y base local antes de mostrarlas en pantalla.
export function friendlyErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.trim();
  if (/network request failed|failed to fetch|fetch failed|\bECONN[A-Z]+\b|\bETIMEDOUT\b|time.?out|timed out|network error|connection refused|socket hang up/i.test(message)) {
    return 'No pudimos conectar con el servicio. Revisá tu conexión e intentá nuevamente.';
  }
  if (/quotaexceeded|storage.*(denied|unavailable|full|allowed)|secure.?store/i.test(message)) {
    return 'No pudimos guardar la sesión en este dispositivo. Revisá el espacio disponible e intentá nuevamente.';
  }
  if (/SQLITE_|SQLSTATE|no such table|database is locked|syntax error|unexpected token|JSON Parse error|cannot read propert|is not a function|stack trace|\bER_[A-Z0-9_]+\b/i.test(message)) {
    return 'No pudimos procesar la información. Intentá de nuevo y, si el problema continúa, avisale al administrador.';
  }
  return friendlyApiMessage(message, 400, fallback);
}

export async function apiErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null) as { message?: string } | null;
  return friendlyApiMessage(body?.message, response.status, fallback);
}
