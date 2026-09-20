/** tipos globales del frontend */

export type RolNombre = 'dueno' | 'copropietario' | 'peon' | 'veterinario';

export type LoginMode = 'useState' | 'router';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolNombre;
  rolLabel: string;
}

export interface AuthSession {
  token: string;
  usuario: Usuario;
  loginMode: LoginMode;
  rememberMe: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/** métricas del dashboard dueño/copropietario (fase 4) */
export interface DashboardSummary {
  totalAnimales: number;
  variacionMes: number;
  alertasActivas: number;
  alertasSanitarias: number;
  alertasReproductivas: number;
  corralesTotal: number;
  corralesEnUso: number;
  corralesLibres: number;
  clima: { temperatura: number; descripcion: string };
  resumenMensual: { mes: string; bovinos: number; ovinos: number; equinos: number }[];
}
