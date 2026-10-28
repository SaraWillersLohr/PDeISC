// describo los datos mínimos que viajan dentro de la sesión autenticada.
export interface AuthenticatedUser {
  id_usuario: number;
  email: string;
  rol: string;
  token_version?: number;
}

// describo las credenciales recibidas al iniciar sesión.
export interface LoginInput {
  email: string;
  password: string;
}
