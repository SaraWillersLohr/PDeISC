// Archivo backend/src/types/index.ts: tipos e interfaces compartidos relacionado con index. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// tipos compartidos del backend

export type RolNombre = 'administrador' | 'dueno' | 'copropietario' | 'peon' | 'veterinario' | 'empleado';

// Contrato de datos Rol: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface Rol {
  id_rol: number;
  nombre: RolNombre;
  descripcion: string | null;
}

// Contrato de datos UsuarioDB: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
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

// Contrato de datos UsuarioPublico: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
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

// Contrato de datos ApiResponse: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// Contrato de datos LoginRequest: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface LoginRequest {
  email: string;
  password: string;
}

// Contrato de datos CreateUsuarioRequest: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface CreateUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol?: Exclude<RolNombre, 'administrador' | 'empleado'>;
}

// Contrato de datos UpdateUsuarioRequest: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface UpdateUsuarioRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  rol?: Exclude<RolNombre, 'administrador' | 'empleado'>;
  activo?: boolean;
}

