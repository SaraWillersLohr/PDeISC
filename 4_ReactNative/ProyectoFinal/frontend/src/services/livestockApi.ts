// consulto los recursos ganaderos protegidos por la sesión vigente.
import { apiUrl } from '../config/api';
import type { Session } from '../types/auth';

export interface AnimalRecord {
  id_animal: number;
  identificador: string;
  nombre: string | null;
  fecha_nacimiento: string | null;
  peso_kg: number | string | null;
  estado_salud: string;
  id_corral: number;
  corral: string;
  raza: string;
  especie: string;
  alta_pendiente_traslado: number;
}

export interface CorralRecord {
  id_corral: number;
  nombre: string;
  capacidad: number;
  es_enfermeria: number;
  ocupacion: number;
}

export interface NursingAnimalRecord {
  id_animal: number;
  identificador: string;
  nombre: string | null;
  estado_salud: string;
  peso_kg: number | string | null;
  corral: string;
  raza: string;
  especie: string;
  alta_pendiente_traslado: number;
}

export interface NotificationRecord {
  id_notificacion: number;
  id_animal: number | null;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: number;
  created_at: string;
}

// solicito un recurso y convierto respuestas fallidas en mensajes legibles.
async function getData<T>(path: string, session: Session): Promise<T[]> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}${path}`, { headers: { Authorization: `Bearer ${session.accessToken}` } });
  const payload = await response.json() as { data?: T[]; message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'No se pudieron cargar los datos.');
  return payload.data ?? [];
}

export function listAnimals(session: Session): Promise<AnimalRecord[]> { return getData<AnimalRecord>('/api/animals', session); }
export function listCorrals(session: Session): Promise<CorralRecord[]> { return getData<CorralRecord>('/api/corrals', session); }

// registro el movimiento sin permitir que la app omita validaciones del backend.
export async function moveAnimal(session: Session, animalId: number, destinationId: number): Promise<void> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}/api/animals/${animalId}/movements`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_corral_destino: destinationId }),
  });
  const payload = await response.json() as { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'No se pudo registrar el traslado.');
}

// consulto animales en enfermería y registro el alta veterinaria.
export function listNursingAnimals(session: Session): Promise<NursingAnimalRecord[]> { return getData<NursingAnimalRecord>('/api/health/nursing', session); }
export async function dischargeAnimal(session: Session, animalId: number, notes: string): Promise<void> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}/api/health/animals/${animalId}/discharge`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ observaciones: notes }),
  });
  const payload = await response.json() as { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'No se pudo registrar el alta.');
}

// consulto avisos dirigidos al rol autenticado.
export function listNotifications(session: Session): Promise<NotificationRecord[]> { return getData<NotificationRecord>('/api/notifications', session); }
