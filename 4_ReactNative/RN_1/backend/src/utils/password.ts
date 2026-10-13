// Archivo backend/src/utils/password.ts: utilidades compartidas del backend relacionado con password. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.



// hash bcrypt de contrasenas
import bcrypt from 'bcryptjs';



// Configuración: SALT_ROUNDS establece costo de cálculo usado al generar hashes de contraseñas; modificá esta constante solo si querés cambiar esa regla para toda la aplicación.

const SALT_ROUNDS = 10;

// hasheo seguro de contrase�a con bcrypt
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// comparo contrase�a en texto plano contra el hash almacenado
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

