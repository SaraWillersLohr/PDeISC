import '../backend/node_modules/dotenv/config.js';
import bcrypt from '../backend/node_modules/bcryptjs/index.js';
import mysql from '../backend/node_modules/mysql2/promise.js';
import { changePassword } from '../backend/src/services/authService.ts';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? {} : undefined,
});
const testEmail = `codex-password-check-${Date.now()}@example.invalid`;
let testUserId;
try {
  const [roles] = await connection.query('SELECT id_rol FROM roles ORDER BY id_rol LIMIT 1');
  const initialHash = await bcrypt.hash('ClaveInicial2026', 4);
  const [insert] = await connection.execute(
    "INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, activo, estado_cuenta, token_version) VALUES (?, 'Prueba', 'Temporal', ?, ?, 1, 'activo', 0)",
    [roles[0].id_rol, testEmail, initialHash],
  );
  testUserId = insert.insertId;
  let rejectedWrongPassword = false;
  try { await changePassword(testUserId, 'ClaveIncorrecta2026', 'ClaveNueva2026!'); }
  catch { rejectedWrongPassword = true; }
  if (!rejectedWrongPassword) throw new Error('Se aceptó una contraseña actual incorrecta');
  await changePassword(testUserId, 'ClaveInicial2026', 'ClaveNueva2026!');
  const [after] = await connection.query('SELECT password_hash, token_version FROM usuarios WHERE id_usuario = ?', [testUserId]);
  if (!(await bcrypt.compare('ClaveNueva2026!', after[0].password_hash)) || Number(after[0].token_version) !== 1) throw new Error('No se guardó correctamente la contraseña nueva');
  console.log('PASSWORD_CHANGE_FLOW_OK');
} finally {
  if (testUserId) await connection.execute('DELETE FROM usuarios WHERE id_usuario = ?', [testUserId]);
  await connection.end();
}
