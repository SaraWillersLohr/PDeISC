// conecto el formulario móvil con los endpoints de autenticación del backend.
import { apiUrl } from '../config/api';
import type { Session } from '../types/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

// convierto errores de red y respuestas de api en mensajes entendibles.
async function getErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;

  return body?.message ?? 'no se pudo completar la solicitud';
}

// envío las credenciales al backend y devuelvo una sesión válida.
export async function login(credentials: LoginCredentials): Promise<Session> {
  if (!apiUrl) {
    throw new Error('falta configurar expo_public_api_url');
  }

  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as Session;
}
