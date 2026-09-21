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
  debe_cambiar_password?: boolean;
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

/** tipos de gestión de corrales, animales y especies (fase 5) */
export interface Corral {
  id_corral: number;
  nombre: string;
  capacidad: number;
  es_enfermeria: boolean;
  activo: boolean;
  ocupados: number;
}

export interface Raza {
  id_raza: number;
  id_especie: number;
  nombre: string;
}

export interface Especie {
  id_especie: number;
  nombre: string;
  razas: Raza[];
}

export type EstadoSalud = 'sano' | 'enfermo' | 'herido' | 'en_tratamiento';

export interface Animal {
  id_animal: number;
  identificador: string;
  nombre: string | null;
  id_corral: number;
  corral_nombre: string;
  corral_es_enfermeria: boolean;
  id_raza: number;
  raza_nombre: string;
  id_especie: number;
  especie_nombre: string;
  fecha_nacimiento: string | null;
  peso_kg: number | null;
  estado_salud: EstadoSalud;
  id_corral_origen: number | null;
  activo: boolean;
  created_at: string;
}

/** notas médicas y tratamientos veterinarios */
export interface Tratamiento {
  id_tratamiento: number;
  id_animal: number;
  id_veterinario: number;
  veterinario_nombre: string;
  descripcion: string;
  medicamento: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  observaciones: string | null;
  created_at: string;
}

/** alertas del sistema para campanita y avisos */
export interface NotificacionAlerta {
  id: string;
  id_notificacion?: number;
  id_animal?: number | null;
  identificador?: string;
  nombre?: string | null;
  estado_salud?: string;
  corral_nombre?: string;
  corral_origen_nombre?: string | null;
  titulo?: string;
  mensaje: string;
  fecha: string;
  tipo: 'alerta_sanitaria' | 'en_tratamiento' | 'alta' | 'info';
}


