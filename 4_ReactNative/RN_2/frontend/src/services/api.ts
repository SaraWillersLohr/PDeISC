// Lee la dirección pública de la API; en un teléfono debe ser la IP del servidor, no localhost.
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/$/, "");
// Llama a la API y convierte fallas de red o HTTP en mensajes comprensibles.
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Revisá la conexión e intentá nuevamente.",
    );
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("El servidor respondió con un formato inesperado.");
  }
  if (!response.ok)
    throw new Error(
      (data as { error?: string })?.error ||
        "No se pudo completar la operación.",
    );
  return data as T;
}
