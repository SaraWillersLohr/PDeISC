/** hash bcrypt de contrasenas */
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/** hasheo seguro de contraseña con bcrypt */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** comparo contraseña en texto plano contra el hash almacenado */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
