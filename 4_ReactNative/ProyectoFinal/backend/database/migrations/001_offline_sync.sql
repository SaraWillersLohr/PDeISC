-- agrego una bitácora idempotente para las operaciones enviadas desde la app sin conexión.
-- esta migración no modifica ni elimina las tablas ni los datos existentes.

CREATE TABLE IF NOT EXISTS operaciones_sincronizacion (
  id_operacion CHAR(36) NOT NULL,
  id_usuario INT(10) UNSIGNED NOT NULL,
  tipo_operacion VARCHAR(80) NOT NULL,
  entidad VARCHAR(80) NOT NULL,
  id_entidad_remota INT(10) UNSIGNED NULL,
  resultado JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_operacion),
  KEY idx_sincronizacion_usuario_fecha (id_usuario, created_at),
  CONSTRAINT fk_sincronizacion_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
