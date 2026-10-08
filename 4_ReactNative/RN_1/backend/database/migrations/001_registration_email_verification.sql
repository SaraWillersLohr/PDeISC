-- Ejecutar una sola vez sobre la base existente seleccionada en HeidiSQL.
-- No borra ni reemplaza datos del dump.

ALTER TABLE usuarios
  ADD COLUMN estado_cuenta VARCHAR(32) NOT NULL DEFAULT 'activo',
  ADD COLUMN email_verificado_at DATETIME NULL,
  ADD COLUMN token_version INT UNSIGNED NOT NULL DEFAULT 0;

-- Conserva los accesos preexistentes: los activos del dump siguen activos.
UPDATE usuarios
SET estado_cuenta = IF(activo = 1, 'activo', 'inactivo');

-- El registro público asignará únicamente este rol inicial, nunca dueño/admin.
INSERT INTO roles (nombre, descripcion)
VALUES ('empleado', 'Acceso inicial de una persona nueva; pendiente de aprobación para usar el sistema');

CREATE TABLE codigos_verificacion_correo (
  id_codigo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  codigo_hash CHAR(64) NOT NULL,
  expira_at DATETIME NOT NULL,
  intentos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  consumido_at DATETIME NULL,
  invalidado_at DATETIME NULL,
  creado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_codigo_verificacion_hash (codigo_hash),
  KEY ix_codigo_verificacion_usuario_fecha (id_usuario, creado_at),
  CONSTRAINT fk_codigo_verificacion_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
