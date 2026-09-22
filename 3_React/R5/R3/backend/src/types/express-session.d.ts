// Amplía la sesión temporal de Express con el dato mínimo requerido por OAuth.
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    rememberMe?: boolean;
  }
}

export {};
