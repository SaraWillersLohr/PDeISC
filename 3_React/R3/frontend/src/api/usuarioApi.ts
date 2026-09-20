/** llamadas api de usuarios */
import axiosInstance, { getApiErrorMessage } from './axiosInstance';
import type { RolNombre, Usuario } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateUsuarioPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: RolNombre;
}

/** listo empleados — solo admins (dueño/copropietario) */
export async function listUsuariosApi(): Promise<Usuario[]> {
  const { data } = await axiosInstance.get<ApiResponse<Usuario[]>>('/usuarios');
  return data.data;
}

/** doy de alta un empleado o copropietario */
export async function createUsuarioApi(payload: CreateUsuarioPayload): Promise<Usuario> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Usuario>>('/usuarios', payload);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export interface UpdateUsuarioPayload {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  rol?: RolNombre;
  activo?: boolean;
}

/** actualizo datos de un empleado */
export async function updateUsuarioApi(id: number, payload: UpdateUsuarioPayload): Promise<Usuario> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Usuario>>(`/usuarios/${id}`, payload);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/** desactivo un empleado (soft delete) */
export async function deleteUsuarioApi(id: number): Promise<void> {
  try {
    await axiosInstance.delete(`/usuarios/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
