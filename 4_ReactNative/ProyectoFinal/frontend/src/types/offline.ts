// describo los cambios pendientes que la app debe enviar cuando vuelva la conexión.
export interface PendingOperation {
  id_operacion: string;
  tipo_operacion: string;
  entidad: string;
  payload: string;
  created_at: string;
}

// describo una copia local de un recurso que puede leerse sin conexión.
export interface CachedResource {
  clave: string;
  contenido: string;
  actualizado_en: string;
}
