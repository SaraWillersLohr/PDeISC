// En desarrollo queda vacío y Vite usa el proxy local. En producción apunta al backend desplegado.
const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (path: string) => `${baseUrl}${path}`;
