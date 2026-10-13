-- Ejecutar una sola vez en la misma base configurada en backend/.env, después de 001.
-- La migración 001 ya agrega token_version; esta migración solo crea la tabla de recuperación.

-- Los códigos de recuperación se almacenan como HMAC, vencen y permiten intentos limitados.
CREATE TABLE IF NOT EXISTS codigos_recuperacion_password (
  id_codigo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT(10) UNSIGNED NOT NULL,
  codigo_hash CHAR(64) NOT NULL,
  expira_at DATETIME NOT NULL,
  intentos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  consumido_at DATETIME NULL,
  invalidado_at DATETIME NULL,
  creado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_recuperacion_usuario_fecha (id_usuario, creado_at),
  KEY ix_recuperacion_usuario_estado (id_usuario, consumido_at, invalidado_at, expira_at),
  CONSTRAINT fk_codigo_recuperacion_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
