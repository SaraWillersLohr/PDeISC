// conecto tareas, reproducción y eventos con las rutas autenticadas del backend.
import { apiUrl } from '../config/api';
import { apiConfigurationMessage, apiFetch, friendlyApiMessage } from './apiErrors';
import type { Session } from '../types/auth';
import type { AnimalGender } from './livestockApi';

export interface TaskRecord { id_tarea: number; titulo: string; descripcion: string | null; fecha_vencimiento: string | null; estado: string; responsable: string | null; apellido_responsable: string | null; }
export interface MatingService { id_servicio: number; fecha: string; metodo: string; estado: string; observaciones: string | null; fecha_estimada_nacimiento: string | null; prenez_confirmada_en: string | null; especie: string; madre: string; nombre_madre: string | null; padre: string | null; padre_texto: string | null; }
export interface BirthRecord { id_nacimiento: number; fecha: string; observaciones: string | null; cria: string; nombre_cria: string | null; madre: string | null; madre_texto: string | null; padre: string | null; padre_texto: string | null; }
export interface ReproductionData { servicios: MatingService[]; nacimientos: BirthRecord[]; }
export interface FieldEvent { id_evento: string; titulo: string; descripcion: string | null; tipo_evento: string | null; fecha_inicio: string; fecha_fin: string | null; ubicacion: string | null; provincia: string | null; localidad: string | null; organizador: string | null; especie: string | null; raza: string | null; fuente: string | null; url: string | null; }
export interface EventSourceStatus { nombre: string; url: string; especie: string | null; raza: string | null; consultada_en: string | null; ultimo_error: string | null; estado: string | null; eventos_leidos: number | null; }
export interface FieldEventsData { eventos: FieldEvent[]; especies: string[]; razas: string[]; provincias: string[]; total_nacional: number; fuentes?: EventSourceStatus[]; }

async function request<T>(session: Session, path: string, method = 'GET', body?: unknown): Promise<T> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}${path}`, { method, headers: { Authorization: `Bearer ${session.accessToken}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const payload = await response.json().catch(() => ({})) as { data?: T; message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudo completar la operación.'));
  return payload.data as T;
}

export function listTasks(session: Session): Promise<TaskRecord[]> { return request(session, '/tasks'); }
export function createTask(session: Session, input: { titulo: string; descripcion?: string; fecha_vencimiento?: string; id_responsable: number }): Promise<void> { return request(session, '/tasks', 'POST', input); }
export function updateTask(session: Session, id: number, estado: string): Promise<void> { return request(session, `/tasks/${id}`, 'PATCH', { estado }); }
export function listReproduction(session: Session): Promise<ReproductionData> { return request(session, '/reproduction'); }
export function createMatingService(session: Session, input: { id_madre: number; id_padre?: number; padre_texto?: string; fecha: string; metodo: string; observaciones?: string }): Promise<void> { return request(session, '/reproduction/mating-services', 'POST', input); }
export function confirmPregnancy(session: Session, id: number): Promise<{ fecha_estimada_nacimiento: string; ya_confirmada?: boolean }> { return request(session, `/reproduction/mating-services/${id}/confirm-pregnancy`, 'POST'); }
export function createBirth(session: Session, input: { identificador: string; nombre?: string; foto?: string | null; genero?: AnimalGender; id_raza: number; id_corral: number; fecha: string; id_madre?: number; madre_texto?: string; id_padre?: number; padre_texto?: string; observaciones?: string }): Promise<void> { return request(session, '/reproduction/births', 'POST', input); }
export function deleteMatingService(session: Session, id: number): Promise<void> { return request(session, `/reproduction/mating-services/${id}`, 'DELETE'); }
export function deleteBirthRecord(session: Session, id: number): Promise<void> { return request(session, `/reproduction/births/${id}`, 'DELETE'); }
export function listFieldEvents(session: Session, todos = false): Promise<FieldEventsData> { return request(session, `/events${todos ? '?todos=1' : ''}`); }
