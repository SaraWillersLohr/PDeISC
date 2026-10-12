-- Ejecutar en la base de RN_1 que usa backend/.env, después de las migraciones 001–003.
-- Guarda hashes HMAC de los tokens enviados después de aprobar un registro;
-- el token original nunca queda almacenado en la base.

CREATE TABLE IF NOT EXISTS codigos_acceso_usuario (
  id_codigo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT(10) UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expira_at DATETIME NOT NULL,
  intentos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  consumido_at DATETIME NULL,
  invalidado_at DATETIME NULL,
  creado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_acceso_usuario_fecha (id_usuario, creado_at),
  KEY ix_acceso_usuario_estado (id_usuario, consumido_at, invalidado_at, expira_at),
  CONSTRAINT fk_acceso_token_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
