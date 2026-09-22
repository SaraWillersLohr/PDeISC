// llamadas api de especies y razas
import axiosInstance, { getApiErrorMessage } from './axiosInstance';
import type { Especie, Raza } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ejecuto listespeciesapi
export async function listEspeciesApi(): Promise<Especie[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<Especie[]>>('/especies');
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// ejecuto createespecieapi
export async function createEspecieApi(nombre: string): Promise<Especie> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Especie>>('/especies', { nombre });
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// ejecuto createrazaapi
export async function createRazaApi(idEspecie: number, nombre: string): Promise<Raza> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Raza>>(`/especies/${idEspecie}/razas`, { nombre });
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

