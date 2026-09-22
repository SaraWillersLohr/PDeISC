// ejecuto el seed para crear usuarios demo con contraseñas hasheadas
// ejecuto este archivo con npm run seed
// uso estancia2025! como contraseña inicial de los usuarios demo
import dotenv from 'dotenv';
import pool from '../src/config/database';
import { hashPassword } from '../src/utils/password';

dotenv.config();

const DEMO_PASSWORD = 'Estancia2025!';

interface SeedUser {
  rol: string;
  nombre: string;
  apellido: string;
  email: string;
}

const USUARIOS_DEMO: SeedUser[] = [
  { rol: 'dueno', nombre: 'Sara', apellido: 'Willers', email: 'dueno@estancia.app' },
  { rol: 'copropietario', nombre: 'Martín', apellido: 'López', email: 'coprop@estancia.app' },
  { rol: 'peon', nombre: 'Juan', apellido: 'García', email: 'peon@estancia.app' },
  { rol: 'veterinario', nombre: 'Laura', apellido: 'Fernández', email: 'vet@estancia.app' },
];

// cargo datos demo y limpio los registros operativos anteriores
async function seed(): Promise<void> {
  console.log('[seed] iniciando...');

  // aseguro la existencia de la columna debe_cambiar_password
  try {
    await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS debe_cambiar_password TINYINT(1) DEFAULT 1`);
  } catch {
    // compatibilidad si el motor no admite if not exists
  }

  // aseguro la existencia de la tabla notificaciones
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id_notificacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      id_animal INT UNSIGNED NULL,
      titulo VARCHAR(150) NOT NULL,
      mensaje TEXT NOT NULL,
      tipo VARCHAR(50) DEFAULT 'alerta_sanitaria',
      leida TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_notificacion_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const u of USUARIOS_DEMO) {
    const [roles] = await pool.query<{ id_rol: number }[]>(
      'SELECT id_rol FROM roles WHERE nombre = ?',
      [u.rol],
    );
    const idRol = (roles as { id_rol: number }[])[0]?.id_rol;

    if (!idRol) {
      console.warn(`[seed] rol "${u.rol}" no encontrado — ejecutá schema.sql primero`);
      continue;
    }

    await pool.query(
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, debe_cambiar_password)
       VALUES (?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         nombre = VALUES(nombre),
         apellido = VALUES(apellido),
         password_hash = VALUES(password_hash),
         debe_cambiar_password = 1,
         activo = 1`,
      [idRol, u.nombre, u.apellido, u.email, passwordHash],
    );

    console.log(`[seed] ✓ ${u.email} (${u.rol})`);
  }

  // limpieza para iniciar desde cero sin animales ficticios ni tratamientos simulados
  await pool.query('DELETE FROM tratamientos');
  await pool.query('DELETE FROM notificaciones');
  await pool.query('DELETE FROM animales');

  console.log('[seed] ✓ base de datos reiniciada desde cero (0 animales, 0 alertas)');
  console.log(`[seed] listo — contraseña demo inicial: ${DEMO_PASSWORD}`);
  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] error:', err);
  process.exit(1);
});
