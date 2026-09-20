/** tipos compartidos del backend */

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
