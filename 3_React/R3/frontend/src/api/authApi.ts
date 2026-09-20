/** llamadas api de autenticacion */
import axiosInstance from './axiosInstance';
import type { LoginFormData, Usuario } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

/** inicio sesión contra la api — devuelve token jwt y datos del usuario */
export async function loginApi(credentials: LoginFormData): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', {
    email: credentials.email,
    password: credentials.password,
  });

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
}

/** valido token existente y obtengo perfil actualizado */
export async function getMeApi(): Promise<Usuario> {
  const { data } = await axiosInstance.get<ApiResponse<Usuario>>('/auth/me');

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
}
