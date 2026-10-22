-- ejecutar una sola vez sobre la base existente, después de hacer un respaldo.
-- una base representa una estancia; por eso las solicitudes quedan asociadas a esta base.

ALTER TABLE usuarios
  ADD COLUMN estado_cuenta ENUM('activo', 'pendiente_acceso', 'inactivo') NOT NULL DEFAULT 'activo',
  ADD COLUMN email_verificado_at DATETIME NULL;

CREATE TABLE solicitudes_registro (
  id_solicitud INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  estado ENUM('pendiente_verificacion', 'pendiente_aprobacion', 'aprobada', 'rechazada') NOT NULL DEFAULT 'pendiente_verificacion',
  email_verificado_at DATETIME NULL,
  resuelta_at DATETIME NULL,
  resuelta_por INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_solicitud_email (email),
  KEY ix_solicitud_estado_fecha (estado, created_at),
  CONSTRAINT fk_solicitud_admin FOREIGN KEY (resuelta_por)
    REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE codigos_verificacion_solicitud (
  id_codigo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_solicitud INT UNSIGNED NOT NULL,
  codigo_hash CHAR(64) NOT NULL,
  expira_at DATETIME NOT NULL,
  intentos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  consumido_at DATETIME NULL,
  invalidado_at DATETIME NULL,
  creado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_codigo_solicitud_fecha (id_solicitud, creado_at),
  CONSTRAINT fk_codigo_solicitud FOREIGN KEY (id_solicitud)
    REFERENCES solicitudes_registro(id_solicitud) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE codigos_acceso_usuario (
  id_codigo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expira_at DATETIME NOT NULL,
  intentos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  consumido_at DATETIME NULL,
  invalidado_at DATETIME NULL,
  creado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_acceso_usuario_fecha (id_usuario, creado_at),
  CONSTRAINT fk_codigo_acceso_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
