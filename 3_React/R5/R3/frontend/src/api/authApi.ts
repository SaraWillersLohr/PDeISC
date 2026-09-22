// llamadas api de autenticacion
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

interface SocialLoginResponse extends LoginResponse {
  rememberMe: boolean;
}

// inicio sesi�n contra la api � devuelve token jwt y datos del usuario
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

/** Canjea el código efímero recibido de OAuth por una sesión JWT normal de la aplicación. */
export async function exchangeSocialCodeApi(code: string): Promise<SocialLoginResponse> {
  const { data } = await axiosInstance.post<ApiResponse<SocialLoginResponse>>('/auth/social/exchange', { code });
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// valido token existente y obtengo perfil actualizado
export async function getMeApi(): Promise<Usuario> {
  const { data } = await axiosInstance.get<ApiResponse<Usuario>>('/auth/me');

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
}

// actualiza la contrase�a inicial del usuario para remover la contrase�a predeterminada
export async function cambiarPasswordInicialApi(password: string): Promise<Usuario> {
  const { data } = await axiosInstance.post<ApiResponse<Usuario>>('/auth/cambiar-password-inicial', {
    password,
  });

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
}

