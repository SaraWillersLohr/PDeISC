// comparto tipos y validaciones usadas por los controladores ganaderos.
import type { RowDataPacket } from 'mysql2';
import { validDateOnly } from '../utils/dateOnly.js';

export interface MovementRow extends RowDataPacket { id_animal: number; id_corral: number; activo: number; origen_enfermeria: number; estado_salud: string; identificador: string; }

export interface CorralRow extends RowDataPacket { capacidad: number; nombre: string; activo: number; es_enfermeria: number; }

export const animalGenders = ['hembra', 'macho', 'no_especificado'] as const;

export type AnimalGender = typeof animalGenders[number];

export function isAnimalGender(value: string): value is AnimalGender { return (animalGenders as readonly string[]).includes(value); }

export function readPhoto(value: unknown): string | null | false {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) || Buffer.byteLength(value, 'utf8') > 1_500_000) return false;
  return value;
}

// valido fechas reales y evito nacimientos posteriores al día actual.
const estanciaCalendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function validBirthDate(value: string): boolean {
  return validDateOnly(value) !== null && value <= estanciaCalendar.format(new Date());
}
