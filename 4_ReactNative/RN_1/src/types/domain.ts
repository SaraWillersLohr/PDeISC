export type Role = 'administrador' | 'dueno' | 'copropietario' | 'peon' | 'veterinario' | 'empleado';

export interface PublicUser {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Role;
  rolLabel: string;
  activo: boolean;
  debe_cambiar_password?: boolean;
}

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
}

export interface Animal {
  id_animal: number;
  identificador: string;
  nombre: string | null;
  id_corral: number;
  corral_nombre: string;
  id_raza: number;
  raza_nombre: string;
  especie_nombre: string;
  fecha_nacimiento: string | null;
  peso_kg: number | null;
  estado_salud: 'sano' | 'enfermo' | 'herido' | 'en_tratamiento';
  activo: boolean;
}

export interface Corral {
  id_corral: number;
  nombre: string;
  capacidad: number;
  es_enfermeria: boolean;
  activo: boolean;
  ocupados: number;
}

export interface Notification {
  id: string;
  id_notificacion?: number;
  titulo?: string;
  mensaje: string;
  fecha: string;
  tipo: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
