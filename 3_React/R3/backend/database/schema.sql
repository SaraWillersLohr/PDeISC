-- ============================================================
-- estanciaapp — esquema mariaDB en tercera forma normal (3FN)
-- puerto: 3307
-- ============================================================

CREATE DATABASE IF NOT EXISTS estancia_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE estancia_app;

-- ------------------------------------------------------------
-- 1. roles (tabla independiente — evita redundancia en usuarios)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id_rol       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(50) NOT NULL UNIQUE,
  descripcion  VARCHAR(255) NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. usuarios (depende solo de roles — 3FN)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_rol       INT UNSIGNED NOT NULL,
  nombre       VARCHAR(100) NOT NULL,
  apellido     VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  debe_cambiar_password TINYINT(1) DEFAULT 1,
  activo       TINYINT(1) DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. corrales (incluye corral especial "enfermería")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS corrales (
  id_corral    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(80) NOT NULL UNIQUE,
  capacidad    INT UNSIGNED NOT NULL DEFAULT 50,
  es_enfermeria TINYINT(1) DEFAULT 0,
  activo       TINYINT(1) DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. especies (tabla de catálogo — evita repetir nombre de especie)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS especies (
  id_especie   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(60) NOT NULL UNIQUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. razas (depende de especies — 3FN)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS razas (
  id_raza      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_especie   INT UNSIGNED NOT NULL,
  nombre       VARCHAR(80) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_raza_especie (id_especie, nombre),
  CONSTRAINT fk_raza_especie FOREIGN KEY (id_especie) REFERENCES especies(id_especie)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. animales (referencias a corral, raza — sin datos duplicados)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS animales (
  id_animal         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_corral         INT UNSIGNED NOT NULL,
  id_raza           INT UNSIGNED NOT NULL,
  identificador     VARCHAR(50) NOT NULL UNIQUE,
  nombre            VARCHAR(100) NULL,
  fecha_nacimiento  DATE NULL,
  peso_kg           DECIMAL(8,2) NULL,
  estado_salud      ENUM('sano','enfermo','herido','en_tratamiento') DEFAULT 'sano',
  id_corral_origen  INT UNSIGNED NULL COMMENT 'corral previo antes de enfermería',
  activo            TINYINT(1) DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_animal_corral FOREIGN KEY (id_corral) REFERENCES corrales(id_corral),
  CONSTRAINT fk_animal_raza FOREIGN KEY (id_raza) REFERENCES razas(id_raza),
  CONSTRAINT fk_animal_corral_origen FOREIGN KEY (id_corral_origen) REFERENCES corrales(id_corral)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. tratamientos (relación N:1 animal + veterinario — 3FN)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tratamientos (
  id_tratamiento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_animal      INT UNSIGNED NOT NULL,
  id_veterinario INT UNSIGNED NOT NULL,
  descripcion    TEXT NOT NULL,
  medicamento    VARCHAR(150) NULL,
  fecha_inicio   DATE NOT NULL,
  fecha_fin      DATE NULL,
  observaciones  TEXT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tratamiento_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal),
  CONSTRAINT fk_tratamiento_vet FOREIGN KEY (id_veterinario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. notificaciones (alertas sanitarias y eventos del sistema)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_animal       INT UNSIGNED NULL,
  titulo          VARCHAR(150) NOT NULL,
  mensaje         TEXT NOT NULL,
  tipo            VARCHAR(50) DEFAULT 'alerta_sanitaria',
  leida           TINYINT(1) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificacion_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- datos iniciales (seeds)
-- ============================================================

INSERT INTO roles (nombre, descripcion) VALUES
  ('dueno', 'Dueño original de la estancia — acceso total'),
  ('copropietario', 'Copropietario con permisos administrativos'),
  ('peon', 'Operativo de campo — traslados y alertas'),
  ('veterinario', 'Sanidad — corral enfermería y tratamientos')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

INSERT INTO corrales (nombre, capacidad, es_enfermeria) VALUES
  ('Corral Norte', 40, 0),
  ('Corral Sur', 35, 0),
  ('Corral Este', 30, 0),
  ('Corral Oeste', 25, 0),
  ('Potrero Central', 50, 0),
  ('Enfermería', 15, 1)
ON DUPLICATE KEY UPDATE capacidad = VALUES(capacidad);

INSERT INTO especies (nombre) VALUES
  ('Bovino'), ('Ovino'), ('Equino')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO razas (id_especie, nombre)
SELECT e.id_especie, r.nombre FROM especies e
JOIN (SELECT 'Bovino' AS esp, 'Angus' AS nombre UNION ALL
      SELECT 'Bovino', 'Hereford' UNION ALL
      SELECT 'Ovino', 'Merino' UNION ALL
      SELECT 'Equino', 'Criollo') r ON e.nombre = r.esp
ON DUPLICATE KEY UPDATE razas.nombre = VALUES(nombre);

-- usuarios demo — contraseña: Estancia2025!
-- recomendado: ejecutar "npm run seed" para hashes bcrypt actualizados
INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash)
SELECT r.id_rol, u.nombre, u.apellido, u.email, u.password_hash
FROM roles r
JOIN (
  SELECT 'dueno' AS rol, 'Sara' AS nombre, 'Willers' AS apellido,
         'dueno@estancia.app' AS email,
         '$2a$10$iUPQz4RpoI3/8quXCvGcRu2srRMZ9j1V58wJ9fLH47f4CNFq3.Myq' AS password_hash
  UNION ALL
  SELECT 'copropietario', 'Martín', 'López', 'coprop@estancia.app',
         '$2a$10$iUPQz4RpoI3/8quXCvGcRu2srRMZ9j1V58wJ9fLH47f4CNFq3.Myq'
  UNION ALL
  SELECT 'peon', 'Juan', 'García', 'peon@estancia.app',
         '$2a$10$iUPQz4RpoI3/8quXCvGcRu2srRMZ9j1V58wJ9fLH47f4CNFq3.Myq'
  UNION ALL
  SELECT 'veterinario', 'Laura', 'Fernández', 'vet@estancia.app',
         '$2a$10$iUPQz4RpoI3/8quXCvGcRu2srRMZ9j1V58wJ9fLH47f4CNFq3.Myq'
) u ON r.nombre = u.rol
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellido = VALUES(apellido),
  password_hash = VALUES(password_hash),
  activo = 1;
