// Archivo src/types/domain.ts: tipos e interfaces compartidos relacionado con domain. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
export type Role = 'administrador' | 'dueno' | 'copropietario' | 'peon' | 'veterinario' | 'empleado';

// Contrato de datos PublicUser: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
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

// Contrato de datos DashboardSummary: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
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

// Contrato de datos Animal: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
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

// Contrato de datos Corral: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface Corral {
  id_corral: number;
  nombre: string;
  capacidad: number;
  es_enfermeria: boolean;
  activo: boolean;
  ocupados: number;
}

// Contrato de datos Notification: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface Notification {
  id: string;
  id_notificacion?: number;
  titulo?: string;
  mensaje: string;
  fecha: string;
  tipo: string;
}

// Contrato de datos ApiResponse: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
