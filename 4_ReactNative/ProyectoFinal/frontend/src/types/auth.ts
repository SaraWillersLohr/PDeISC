// describo la información de sesión que comparte la app móvil.
export interface Usuario {
  id_usuario: number;
  email: string;
  rol: string;
  nombre: string;
  apellido: string;
}

// describo los tokens y el perfil que persisto en el dispositivo.
export interface Session {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}
