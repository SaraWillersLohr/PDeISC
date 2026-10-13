// Archivo src/services/farmApi.ts: agrupa las llamadas tipadas para las funciones ganaderas que comparte RN_1 con R5.
import { apiRequest } from './api';
import type { Animal, AnimalMovement, AnimalWeight, Corral, Especie, EstadoSalud, Raza, ReproductionEvent, ReproductionEventType, ReproductionResult, SexoAnimal, Tratamiento } from '../types/domain';

// Contrato de datos AnimalPayload: describe los campos que se pueden registrar o modificar en la ficha actual del animal.
export interface AnimalPayload {
  identificador: string;
  nombre?: string | null;
  sexo?: SexoAnimal;
  id_madre?: number | null;
  id_padre?: number | null;
  id_corral: number;
  id_raza: number;
  fecha_nacimiento?: string | null;
  peso_kg?: number | null;
  estado_salud?: EstadoSalud;
}

// Contrato de datos CorralPayload: representa el alta y la edición de capacidad y uso sanitario de un corral.
export interface CorralPayload {
  nombre: string;
  capacidad: number;
  es_enfermeria: boolean;
}

// Contrato de datos TratamientoPayload: contiene los datos clínicos que ingresa el veterinario para el historial.
export interface TratamientoPayload {
  id_animal: number;
  descripcion: string;
  medicamento?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  observaciones?: string | null;
}

// Contrato ReproductionEventPayload: describe las fechas, participantes y resultado que se registran por evento.
export interface ReproductionEventPayload {
  id_animal: number;
  id_reproductor?: number | null;
  id_cria?: number | null;
  tipo: ReproductionEventType;
  fecha_evento: string;
  resultado?: ReproductionResult | null;
  fecha_probable_parto?: string | null;
  observaciones?: string | null;
}

// Esta función consulta el catálogo de animales y envía filtros opcionales al backend para reutilizar la API de R5.
export function listAnimals(token: string, filters: { id_corral?: number; id_especie?: number; sexo?: SexoAnimal; estado_salud?: EstadoSalud; search?: string } = {}): Promise<Animal[]> {
  const params = new URLSearchParams();
  if (filters.id_corral) params.set('id_corral', String(filters.id_corral));
  if (filters.id_especie) params.set('id_especie', String(filters.id_especie));
  if (filters.estado_salud) params.set('estado_salud', filters.estado_salud);
  if (filters.sexo) params.set('sexo', filters.sexo);
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  const query = params.toString();
  return apiRequest<Animal[]>(`/animales${query ? `?${query}` : ''}`, token);
}

// Esta función registra un animal individual con su caravana, raza, corral y datos productivos disponibles.
export function createAnimal(token: string, payload: AnimalPayload): Promise<Animal> {
  return apiRequest<Animal>('/animales', token, { method: 'POST', body: JSON.stringify(payload) });
}

// Esta función actualiza una ficha existente y permite cambiar de corral respetando las validaciones del backend.
export function updateAnimal(token: string, id: number, payload: Partial<AnimalPayload>): Promise<Animal> {
  return apiRequest<Animal>(`/animales/${id}`, token, { method: 'PATCH', body: JSON.stringify(payload) });
}

// Esta función da de baja lógicamente al animal para conservar su identificación en la base existente.
export function deactivateAnimal(token: string, id: number): Promise<void> {
  return apiRequest<void>(`/animales/${id}`, token, { method: 'DELETE' });
}

// Esta función reporta síntomas de campo; el backend registra la notificación y deriva el animal a enfermería.
export function reportAnimalIllness(token: string, id: number, comentarios: string): Promise<Animal> {
  return apiRequest<Animal>(`/animales/${id}/reportar-enfermedad`, token, { method: 'POST', body: JSON.stringify({ comentarios }) });
}

// Esta función registra el alta veterinaria y permite que la API restituya el animal a su corral de origen disponible.
export function dischargeAnimal(token: string, id: number, notas_alta?: string): Promise<Animal> {
  return apiRequest<Animal>(`/animales/${id}/alta`, token, { method: 'POST', body: JSON.stringify({ notas_alta }) });
}

// Esta función obtiene los corrales activos y su ocupación calculada por el backend.
export function listCorrals(token: string): Promise<Corral[]> {
  return apiRequest<Corral[]>('/corrales', token);
}

// Esta función crea un corral con capacidad máxima y una marca opcional de enfermería.
export function createCorral(token: string, payload: CorralPayload): Promise<Corral> {
  return apiRequest<Corral>('/corrales', token, { method: 'POST', body: JSON.stringify(payload) });
}

// Esta función modifica los datos del corral seleccionado sin reemplazar los campos que no cambiaron.
export function updateCorral(token: string, id: number, payload: Partial<CorralPayload>): Promise<Corral> {
  return apiRequest<Corral>(`/corrales/${id}`, token, { method: 'PATCH', body: JSON.stringify(payload) });
}

// Esta función archiva un corral vacío; el backend rechaza el cambio cuando todavía contiene animales activos.
export function deactivateCorral(token: string, id: number): Promise<void> {
  return apiRequest<void>(`/corrales/${id}`, token, { method: 'DELETE' });
}

// Esta función carga las especies y las razas existentes para los selectores de las fichas de animales.
export function listSpecies(token: string): Promise<Especie[]> {
  return apiRequest<Especie[]>('/especies', token);
}

// Esta función consulta todas las notas clínicas asociadas a la ficha de un animal.
export function listTreatments(token: string, idAnimal: number): Promise<Tratamiento[]> {
  return apiRequest<Tratamiento[]>(`/tratamientos?id_animal=${idAnimal}`, token);
}

// Esta función registra el diagnóstico y los detalles del tratamiento con la identidad del veterinario tomada de la sesión.
export function createTreatment(token: string, payload: TratamientoPayload): Promise<Tratamiento> {
  return apiRequest<Tratamiento>('/tratamientos', token, { method: 'POST', body: JSON.stringify(payload) });
}

// Esta función crea una especie en el catálogo compartido por todas las fichas del establecimiento.
export function createSpecies(token: string, nombre: string): Promise<Especie> {
  return apiRequest<Especie>('/especies', token, { method: 'POST', body: JSON.stringify({ nombre }) });
}

// Esta función agrega una raza bajo una especie existente y conserva la relación definida por la API.
export function createBreed(token: string, idEspecie: number, nombre: string): Promise<Raza> {
  return apiRequest<Raza>(`/especies/${idEspecie}/razas`, token, { method: 'POST', body: JSON.stringify({ nombre }) });
}

// Esta función consulta eventos reproductivos recientes o el historial asociado a una hembra concreta.
export function listReproductionEvents(token: string, idAnimal?: number): Promise<ReproductionEvent[]> {
  return apiRequest<ReproductionEvent[]>(`/reproduccion${idAnimal ? `?id_animal=${idAnimal}` : ''}`, token);
}

// Esta función registra el evento reproductivo; la API valida sexos, especie y reglas del tipo seleccionado.
export function createReproductionEvent(token: string, payload: ReproductionEventPayload): Promise<ReproductionEvent> {
  return apiRequest<ReproductionEvent>('/reproduccion', token, { method: 'POST', body: JSON.stringify(payload) });
}

// Esta función obtiene el historial de pesajes que respalda el peso actual de una ficha.
export function listAnimalWeights(token: string, id: number): Promise<AnimalWeight[]> {
  return apiRequest<AnimalWeight[]>(`/animales/${id}/pesajes`, token);
}

// Esta función registra una medición, actualiza el peso vigente y devuelve el historial reciente.
export function createAnimalWeight(token: string, id: number, payload: { peso_kg: number; fecha_pesaje: string; observaciones?: string | null }): Promise<AnimalWeight[]> {
  return apiRequest<AnimalWeight[]>(`/animales/${id}/pesajes`, token, { method: 'POST', body: JSON.stringify(payload) });
}

// Esta función lista la trazabilidad de movimientos entre corrales para una ficha individual.
export function listAnimalMovements(token: string, id: number): Promise<AnimalMovement[]> {
  return apiRequest<AnimalMovement[]>(`/animales/${id}/movimientos`, token);
}
