/** llamadas api para notificaciones y alertas en tiempo real */
import axiosInstance, { getApiErrorMessage } from './axiosInstance';
import type { NotificacionAlerta } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** obtiene las alertas sanitarias vigentes */
export async function listNotificacionesApi(): Promise<NotificacionAlerta[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<NotificacionAlerta[]>>('/notificaciones');
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/** elimina una notificación por su identificador */
export async function deleteNotificacionApi(id: string | number): Promise<void> {
  try {
    await axiosInstance.delete(`/notificaciones/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/** elimina todas las alertas sanitarias acumuladas */
export async function clearNotificacionesApi(): Promise<void> {
  try {
    await axiosInstance.delete('/notificaciones');
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
