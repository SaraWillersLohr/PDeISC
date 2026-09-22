// tipos compartidos del backend

export type RolNombre = 'dueno' | 'copropietario' | 'peon' | 'veterinario';

export interface Rol {
  id_rol: number;
  nombre: RolNombre;
  descripcion: string | null;
}

export interface UsuarioDB {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  password_hash: string;
  activo: number;
  debe_cambiar_password?: number;
  rol_nombre?: RolNombre;
}

export interface UsuarioPublico {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolNombre;
  rolLabel: string;
  activo: boolean;
  debe_cambiar_password?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type SocialProvider =
  | 'google'
  | 'facebook'
  | 'github'
  | 'discord'
  | 'twitch'
  | 'twitter';

export interface CreateUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: RolNombre;
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  rol?: RolNombre;
  activo?: boolean;
}

