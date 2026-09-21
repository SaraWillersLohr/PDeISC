// llamadas api de animales
import axiosInstance, { getApiErrorMessage } from './axiosInstance';
import type { Animal, EstadoSalud } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AnimalFilterParams {
  id_corral?: number;
  estado_salud?: EstadoSalud;
  id_especie?: number;
  search?: string;
}

export interface CreateAnimalPayload {
  identificador: string;
  nombre?: string | null;
  id_corral: number;
  id_raza: number;
  fecha_nacimiento?: string | null;
  peso_kg?: number | null;
  estado_salud?: EstadoSalud;
}

export interface UpdateAnimalPayload {
  identificador?: string;
  nombre?: string | null;
  id_corral?: number;
  id_raza?: number;
  fecha_nacimiento?: string | null;
  peso_kg?: number | null;
  estado_salud?: EstadoSalud;
  activo?: boolean;
}

// ejecuto listanimalesapi
export async function listAnimalesApi(filters: AnimalFilterParams = {}): Promise<Animal[]> {
  try {
    const params = new URLSearchParams();
    if (filters.id_corral) params.append('id_corral', String(filters.id_corral));
    if (filters.estado_salud) params.append('estado_salud', filters.estado_salud);
    if (filters.id_especie) params.append('id_especie', String(filters.id_especie));
    if (filters.search) params.append('search', filters.search);

    const url = `/animales${params.toString() ? `?${params.toString()}` : ''}`;
    const { data } = await axiosInstance.get<ApiResponse<Animal[]>>(url);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// ejecuto createanimalapi
export async function createAnimalApi(payload: CreateAnimalPayload): Promise<Animal> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Animal>>('/animales', payload);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// ejecuto updateanimalapi
export async function updateAnimalApi(id: number, payload: UpdateAnimalPayload): Promise<Animal> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Animal>>(`/animales/${id}`, payload);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// ejecuto deleteanimalapi
export async function deleteAnimalApi(id: number): Promise<void> {
  try {
    await axiosInstance.delete(`/animales/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// reporta un animal como enfermo y lo traslada autom�ticamente a enfermer�a
export async function reportarEnfermedadApi(id: number, comentarios: string): Promise<Animal> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Animal>>(`/animales/${id}/reportar-enfermedad`, {
      comentarios,
    });
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// da el alta sanitaria a un animal internado en enfermer�a y lo reintegra
export async function darDeAltaApi(id: number, notas_alta?: string): Promise<Animal> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Animal>>(`/animales/${id}/alta`, {
      notas_alta,
    });
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

