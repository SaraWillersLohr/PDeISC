// Archivo src/types/auth.ts: tipos e interfaces compartidos relacionado con auth. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// Perfil sin credenciales que devuelve la API después del login.
import type { Role } from './domain';

// Contrato de datos PublicUser: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
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

// Contrato de datos LoginResult: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface LoginResult {
  token: string;
  usuario: PublicUser;
}

// Contrato de datos ApiResponse: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
