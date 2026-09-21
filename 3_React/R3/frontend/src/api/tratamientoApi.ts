/** llamadas api para tratamientos médicos veterinarios */
import axiosInstance, { getApiErrorMessage } from './axiosInstance';
import type { Tratamiento } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateTratamientoPayload {
  id_animal: number;
  descripcion: string;
  medicamento?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  observaciones?: string | null;
}

/** obtiene el historial clínico de un animal */
export async function listTratamientosApi(idAnimal: number): Promise<Tratamiento[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<Tratamiento[]>>(`/tratamientos?id_animal=${idAnimal}`);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/** registra una nueva nota clínica o tratamiento */
export async function createTratamientoApi(payload: CreateTratamientoPayload): Promise<Tratamiento> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Tratamiento>>('/tratamientos', payload);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
