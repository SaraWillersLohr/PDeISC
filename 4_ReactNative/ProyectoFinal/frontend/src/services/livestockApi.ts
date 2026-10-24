// consulto los recursos ganaderos protegidos por la sesión vigente.
import { apiUrl } from '../config/api';
import type { Session } from '../types/auth';

export interface AnimalRecord {
  id_animal: number;
  id_raza: number;
  version_dato: number;
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
  reporte_sanitario: string | null;
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

export function listAnimals(session: Session): Promise<AnimalRecord[]> { return getData<AnimalRecord>('/animals', session); }
export function listCorrals(session: Session): Promise<CorralRecord[]> { return getData<CorralRecord>('/corrals', session); }

export async function createAnimal(session: Session, input: { identificador: string; nombre?: string; id_raza: number; id_corral: number; fecha_nacimiento?: string; peso_kg?: number }): Promise<void> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}/animals`, { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'No se pudo registrar el animal.');
}

// actualizo la ficha optimista usando versionado para detectar cambios simultáneos.
export async function updateAnimal(session: Session, animal: AnimalRecord, data: { nombre: string; identificador: string; fecha_nacimiento: string }): Promise<void> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}/animals/${animal.id_animal}`, { method: 'PUT', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id_raza: animal.id_raza, version_dato: animal.version_dato }) });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'No se pudo actualizar el animal.');
}

// creo y edito corrales desde el panel del dueño o administrador.
export async function saveCorral(session: Session, corral: { id_corral?: number; nombre: string; capacidad: number }): Promise<void> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}/corrals${corral.id_corral ? `/${corral.id_corral}` : ''}`, { method: corral.id_corral ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(corral) });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'No se pudo guardar el corral.');
}

// doy de baja un corral vacío; el servidor bloquea si conserva animales.
export async function deleteCorral(session: Session, id: number): Promise<void> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}/corrals/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.accessToken}` } });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'No se pudo dar de baja el corral.');
}

// registro el movimiento sin permitir que la app omita validaciones del backend.
export async function moveAnimal(session: Session, animalId: number, destinationId: number): Promise<void> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}/animals/${animalId}/movements`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_corral_destino: destinationId }),
  });
  const payload = await response.json() as { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'No se pudo registrar el traslado.');
}

// consulto animales en enfermería y registro el alta veterinaria.
export function listNursingAnimals(session: Session): Promise<NursingAnimalRecord[]> { return getData<NursingAnimalRecord>('/health/nursing', session); }
export async function dischargeAnimal(session: Session, animalId: number, notes: string): Promise<void> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}/health/animals/${animalId}/discharge`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ observaciones: notes }),
  });
  const payload = await response.json() as { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'No se pudo registrar el alta.');
}

// consulto avisos dirigidos al rol autenticado.
export function listNotifications(session: Session): Promise<NotificationRecord[]> { return getData<NotificationRecord>('/notifications', session); }
