-- Ejecutar una sola vez sobre la base existente seleccionada en HeidiSQL.
-- Las solicitudes no crean filas en usuarios hasta que el administrador aprueba.
-- La migración 002 debe haber creado el rol 'administrador'.

CREATE TABLE solicitudes_registro (
  id_solicitud INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  estado ENUM('pendiente_verificacion','pendiente_aprobacion','aprobada','rechazada') NOT NULL DEFAULT 'pendiente_verificacion',
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
