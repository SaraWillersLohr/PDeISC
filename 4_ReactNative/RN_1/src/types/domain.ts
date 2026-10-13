// Archivo src/types/domain.ts: tipos e interfaces compartidos relacionado con domain. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
export type Role = 'administrador' | 'dueno' | 'copropietario' | 'peon' | 'veterinario' | 'empleado';

// Contrato de datos EstadoSalud: enumera los estados sanitarios que acepta actualmente la API del proyecto.
export type EstadoSalud = 'sano' | 'enfermo' | 'herido' | 'en_tratamiento';

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
  resumenMensual: { mes: string; bovinos: number; ovinos: number; equinos: number }[];
}

// Contrato de datos Animal: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
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

// Contrato de datos Corral: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface Corral {
  id_corral: number;
  nombre: string;
  capacidad: number;
  es_enfermeria: boolean;
  activo: boolean;
  ocupados: number;
}

// Contrato de datos Raza: identifica una raza y la especie a la que pertenece en los formularios ganaderos.
export interface Raza {
  id_raza: number;
  id_especie: number;
  nombre: string;
}

// Contrato de datos Especie: agrupa el catálogo de razas que se pueden asignar a cada animal.
export interface Especie {
  id_especie: number;
  nombre: string;
  razas: Raza[];
}

// Contrato de datos Tratamiento: conserva cada nota clínica que aparece en el historial veterinario.
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
