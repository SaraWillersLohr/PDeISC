-- agrego tablas de operaciones productivas sin borrar ni alterar registros existentes.
CREATE TABLE IF NOT EXISTS pesajes (
  id_pesaje INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_animal INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  peso_kg DECIMAL(8,2) NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_pesajes_animal_fecha (id_animal, fecha),
  CONSTRAINT fk_pesajes_animal FOREIGN KEY (id_animal) REFERENCES animales (id_animal),
  CONSTRAINT fk_pesajes_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nacimientos (
  id_nacimiento INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_cria INT UNSIGNED NOT NULL,
  id_madre INT UNSIGNED NULL,
  madre_texto VARCHAR(120) NULL,
  id_padre INT UNSIGNED NULL,
  padre_texto VARCHAR(120) NULL,
  fecha DATE NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  observaciones VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_nacimiento_cria (id_cria),
  KEY idx_nacimientos_fecha (fecha),
  CONSTRAINT fk_nacimiento_cria FOREIGN KEY (id_cria) REFERENCES animales (id_animal),
  CONSTRAINT fk_nacimiento_madre FOREIGN KEY (id_madre) REFERENCES animales (id_animal),
  CONSTRAINT fk_nacimiento_padre FOREIGN KEY (id_padre) REFERENCES animales (id_animal),
  CONSTRAINT fk_nacimiento_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS servicios_monta (
  id_servicio INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_madre INT UNSIGNED NOT NULL,
  id_padre INT UNSIGNED NULL,
  padre_texto VARCHAR(120) NULL,
  fecha DATE NOT NULL,
  metodo VARCHAR(60) NOT NULL,
  estado ENUM('programado','realizado','anulado') NOT NULL DEFAULT 'realizado',
  observaciones VARCHAR(500) NULL,
  id_usuario INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_monta_madre_fecha (id_madre, fecha),
  CONSTRAINT fk_monta_madre FOREIGN KEY (id_madre) REFERENCES animales (id_animal),
  CONSTRAINT fk_monta_padre FOREIGN KEY (id_padre) REFERENCES animales (id_animal),
  CONSTRAINT fk_monta_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reportes_muerte (
  id_reporte INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_animal INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  motivo VARCHAR(500) NOT NULL,
  latitud DECIMAL(10,7) NULL,
  longitud DECIMAL(10,7) NULL,
  estado ENUM('pendiente','confirmado','rechazado') NOT NULL DEFAULT 'pendiente',
  id_revisor INT UNSIGNED NULL,
  motivo_revision VARCHAR(500) NULL,
  revisado_en DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_muerte_estado_fecha (estado, fecha),
  CONSTRAINT fk_muerte_animal FOREIGN KEY (id_animal) REFERENCES animales (id_animal),
  CONSTRAINT fk_muerte_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
  CONSTRAINT fk_muerte_revisor FOREIGN KEY (id_revisor) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tratamientos (
  id_tratamiento INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_animal INT UNSIGNED NOT NULL,
  id_veterinario INT UNSIGNED NOT NULL,
  descripcion TEXT NOT NULL,
  medicamento VARCHAR(150) NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  observaciones TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY fk_tratamiento_animal (id_animal),
  KEY fk_tratamiento_vet (id_veterinario),
  CONSTRAINT fk_tratamiento_animal FOREIGN KEY (id_animal) REFERENCES animales (id_animal),
  CONSTRAINT fk_tratamiento_vet FOREIGN KEY (id_veterinario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reportes_sanitarios (
  id_reporte_sanitario INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_animal INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  motivo VARCHAR(500) NOT NULL,
  estado ENUM('pendiente','atendido') NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reporte_sanitario_animal (id_animal, estado, fecha),
  CONSTRAINT fk_reporte_sanitario_animal FOREIGN KEY (id_animal) REFERENCES animales (id_animal),
  CONSTRAINT fk_reporte_sanitario_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS especies_razas_pendientes (
  id_solicitud_catalogo INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('especie','raza') NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  id_especie INT UNSIGNED NULL,
  id_usuario INT UNSIGNED NOT NULL,
  estado ENUM('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  id_revisor INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_catalogo_especie FOREIGN KEY (id_especie) REFERENCES especies (id_especie),
  CONSTRAINT fk_catalogo_solicitante FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
  CONSTRAINT fk_catalogo_revisor FOREIGN KEY (id_revisor) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tareas (
  id_tarea INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  id_responsable INT UNSIGNED NULL,
  fecha_vencimiento DATE NULL,
  estado ENUM('pendiente','en_progreso','completada','cancelada') NOT NULL DEFAULT 'pendiente',
  id_creador INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tarea_responsable FOREIGN KEY (id_responsable) REFERENCES usuarios (id_usuario),
  CONSTRAINT fk_tarea_creador FOREIGN KEY (id_creador) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eventos_campo (
  id_evento INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  ubicacion VARCHAR(200) NULL,
  fuente VARCHAR(120) NULL,
  url VARCHAR(500) NULL,
  id_creador INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evento_creador FOREIGN KEY (id_creador) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS areas_mapa (
  id_area INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_corral INT UNSIGNED NOT NULL,
  puntos JSON NOT NULL,
  updated_by INT UNSIGNED NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_area_corral (id_corral),
  CONSTRAINT fk_area_corral FOREIGN KEY (id_corral) REFERENCES corrales (id_corral),
  CONSTRAINT fk_area_usuario FOREIGN KEY (updated_by) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_cambios (
  id_cambio BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  entidad VARCHAR(80) NOT NULL,
  id_entidad INT UNSIGNED NOT NULL,
  accion VARCHAR(40) NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  detalle JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_auditoria_entidad_fecha (entidad, id_entidad, created_at),
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS operaciones_sincronizacion (
  id_operacion CHAR(36) NOT NULL PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  tipo_operacion VARCHAR(80) NOT NULL,
  entidad VARCHAR(80) NOT NULL,
  id_entidad_remota INT UNSIGNED NULL,
  resultado JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_sincronizacion_usuario_fecha (id_usuario, created_at),
  CONSTRAINT fk_sincronizacion_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE corrales ADD COLUMN IF NOT EXISTS puntos_mapa JSON NULL;
ALTER TABLE animales ADD COLUMN IF NOT EXISTS version_dato INT UNSIGNED NOT NULL DEFAULT 1;
