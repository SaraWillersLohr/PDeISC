/** Perfil sin credenciales que devuelve la API después del login. */
import type { Role } from './domain';

export interface PublicUser {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Role;
  rolLabel: string;
  activo: boolean;
  debe_cambiar_password?: boolean;
}

export interface LoginResult {
  token: string;
  usuario: PublicUser;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
