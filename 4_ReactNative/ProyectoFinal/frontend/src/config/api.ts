// expongo la url del backend desde una variable de entorno pública de expo.
export const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
