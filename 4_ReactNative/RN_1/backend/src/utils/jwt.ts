// Archivo backend/src/utils/jwt.ts: utilidades compartidas del backend relacionado con jwt. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// generacion y verificacion de tokens
import jwt, { type SignOptions } from "jsonwebtoken";
import type { RolNombre } from "../types";

// Contrato de datos JwtPayload: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface JwtPayload {
  id_usuario: number;
  email: string;
  rol: RolNombre;
  token_version: number;
}

const JWT_SECRET: string = process.env.JWT_SECRET ?? '';
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET debe configurarse con al menos 32 caracteres aleatorios');
}
// Configuración: JWT_EXPIRES_IN establece duración configurada de los tokens de sesión JWT; modificá esta constante solo si querés cambiar esa regla para toda la aplicación.
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ??
  "8h") as SignOptions["expiresIn"];

// genero token firmado con datos m�nimos del usuario
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// verifico y decodifico el token � lanza error si es inv�lido
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
}
