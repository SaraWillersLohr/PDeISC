// generacion y verificacion de tokens
import jwt, { type SignOptions } from "jsonwebtoken";
import type { RolNombre } from "../types";

export interface JwtPayload {
  id_usuario: number;
  email: string;
  rol: RolNombre;
}

const JWT_SECRET: string = process.env.JWT_SECRET ?? '';
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET debe configurarse con al menos 32 caracteres aleatorios');
}
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
