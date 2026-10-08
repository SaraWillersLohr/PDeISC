// Este archivo reúne la dirección base y la función para construir rutas de la API.
// En desarrollo queda vacío y Vite usa el proxy local. En producción apunta al backend desplegado.
// Guarda la dirección base configurada y elimina una barra final si existe.
const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
//la api es la ruta base para hacer fetch a la API del backend
// Devuelve la dirección completa para una ruta de la API.
export const apiUrl = (path: string) => `${baseUrl}${path}`;
