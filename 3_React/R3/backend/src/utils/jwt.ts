// generacion y verificacion de tokens
import jwt, { type SignOptions } from "jsonwebtoken";
import type { RolNombre } from "../types";

export interface JwtPayload {
  id_usuario: number;
  email: string;
  rol: RolNombre;
}

const JWT_SECRET =
  process.env.JWT_SECRET ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoxNywiZW1haWwiOiJzYXJhd2lsbGVyc2xvaHIwOEBnbWFpbC5jb20iLCJyb2wiOiJjb3Byb3BpZXRhcmlvIiwiaWF0IjoxNzkwMDA4ODk5LCJleHAiOjE3OTAwMzc2OTl9.C7vGoroHdsr3AYtA3wGSbQ7WZZTFPIrBVt86M81Q3yo";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ??
  "8h") as SignOptions["expiresIn"];

// genero token firmado con datos m�nimos del usuario
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// verifico y decodifico el token � lanza error si es inv�lido
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
