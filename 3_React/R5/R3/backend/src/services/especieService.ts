// servicio de especies y razas
import pool from '../config/database';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface RazaItem {
  id_raza: number;
  id_especie: number;
  nombre: string;
}

export interface EspecieItem {
  id_especie: number;
  nombre: string;
  razas: RazaItem[];
}

interface EspecieRow extends RowDataPacket {
  id_especie: number;
  nombre: string;
}

interface RazaRow extends RowDataPacket {
  id_raza: number;
  id_especie: number;
  nombre: string;
}

// ejecuto listespecies
export async function listEspecies(): Promise<EspecieItem[]> {
  const [especies] = await pool.query<EspecieRow[]>(
    'SELECT id_especie, nombre FROM especies ORDER BY nombre ASC',
  );
  const [razas] = await pool.query<RazaRow[]>(
    'SELECT id_raza, id_especie, nombre FROM razas ORDER BY nombre ASC',
  );

  return especies.map((esp) => ({
    id_especie: esp.id_especie,
    nombre: esp.nombre,
    razas: razas.filter((r) => r.id_especie === esp.id_especie),
  }));
}

// ejecuto createespecie
export async function createEspecie(nombre: string): Promise<EspecieItem> {
  const cleanNombre = nombre.trim();
  if (!cleanNombre) throw new Error('el nombre de la especie es requerido');

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO especies (nombre) VALUES (?)',
      [cleanNombre],
    );
    return {
      id_especie: result.insertId,
      nombre: cleanNombre,
      razas: [],
    };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ER_DUP_ENTRY') {
      throw new Error('ya existe una especie con ese nombre');
    }
    throw err;
  }
}

// ejecuto createraza
export async function createRaza(idEspecie: number, nombre: string): Promise<RazaItem> {
  const cleanNombre = nombre.trim();
  if (!cleanNombre) throw new Error('el nombre de la raza es requerido');

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO razas (id_especie, nombre) VALUES (?, ?)',
      [idEspecie, cleanNombre],
    );
    return {
      id_raza: result.insertId,
      id_especie: idEspecie,
      nombre: cleanNombre,
    };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ER_DUP_ENTRY') {
      throw new Error('ya existe esa raza para esta especie');
    }
    throw err;
  }
}

