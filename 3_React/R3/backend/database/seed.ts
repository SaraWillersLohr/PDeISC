/**
 * script de seed — inserta usuarios demo con contraseñas hasheadas
 * ejecutar: npm run seed
 * contraseña de todos los usuarios demo: Estancia2025!
 */
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

async function seed(): Promise<void> {
  console.log('[seed] iniciando...');
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
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nombre = VALUES(nombre),
         apellido = VALUES(apellido),
         password_hash = VALUES(password_hash),
         activo = 1`,
      [idRol, u.nombre, u.apellido, u.email, passwordHash],
    );

    console.log(`[seed] ✓ ${u.email} (${u.rol})`);
  }

  // animales demo para métricas del dashboard (fase 4)
  const [[countRow]] = await pool.query<{ n: number }[]>(
    'SELECT COUNT(*) AS n FROM animales',
  );
  if (Number((countRow as { n: number }).n) === 0) {
    const [corrales] = await pool.query<{ id_corral: number }[]>(
      'SELECT id_corral FROM corrales WHERE es_enfermeria = 0 LIMIT 5',
    );
    const [razas] = await pool.query<{ id_raza: number; especie: string }[]>(
      `SELECT r.id_raza, e.nombre AS especie FROM razas r JOIN especies e ON e.id_especie = r.id_especie`,
    );
    const listaRazas = razas as { id_raza: number; especie: string }[];
    const listaCorrales = corrales as { id_corral: number }[];
    let n = 0;
    for (const esp of ['Bovino', 'Ovino', 'Equino'] as const) {
      const raza = listaRazas.find((r) => r.especie === esp);
      if (!raza) continue;
      const cant = esp === 'Bovino' ? 80 : esp === 'Ovino' ? 30 : 14;
      for (let i = 0; i < cant; i++) {
        n++;
        const mesAtras = Math.floor(Math.random() * 11);
        await pool.query(
          `INSERT INTO animales (id_corral, id_raza, identificador, estado_salud, created_at)
           VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? MONTH))`,
          [
            listaCorrales[i % listaCorrales.length].id_corral,
            raza.id_raza,
            `AN-${String(n).padStart(4, '0')}`,
            i < 3 ? 'enfermo' : 'sano',
            mesAtras,
          ],
        );
      }
    }
    console.log(`[seed] ✓ ${n} animales demo insertados`);
  }

  console.log(`[seed] listo — contraseña demo: ${DEMO_PASSWORD}`);
  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] error:', err);
  process.exit(1);
});
