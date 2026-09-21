/** llamadas api de corrales */
import axiosInstance, { getApiErrorMessage } from './axiosInstance';
import type { Corral } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateCorralPayload {
  nombre: string;
  capacidad: number;
  es_enfermeria?: boolean;
}

export interface UpdateCorralPayload {
  nombre?: string;
  capacidad?: number;
  es_enfermeria?: boolean;
  activo?: boolean;
}

export async function listCorralesApi(): Promise<Corral[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<Corral[]>>('/corrales');
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function createCorralApi(payload: CreateCorralPayload): Promise<Corral> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Corral>>('/corrales', payload);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateCorralApi(id: number, payload: UpdateCorralPayload): Promise<Corral> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Corral>>(`/corrales/${id}`, payload);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function deleteCorralApi(id: number): Promise<void> {
  try {
    await axiosInstance.delete(`/corrales/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
