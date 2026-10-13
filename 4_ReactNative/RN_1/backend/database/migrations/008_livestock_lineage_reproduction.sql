-- Fase 2: agrega sexo y parentesco a las fichas y crea el historial de eventos reproductivos.
-- Ejecutar una sola vez en HeidiSQL sobre la base indicada por DB_NAME en backend/.env.
-- Antes de ejecutar, hacer un respaldo. Esta migración no borra ni reemplaza animales existentes.
-- Los animales anteriores quedan con sexo 'indeterminado' y sin parentesco; completar esos datos desde la app.

ALTER TABLE animales
  ADD COLUMN sexo ENUM('hembra','macho','indeterminado') NOT NULL DEFAULT 'indeterminado' AFTER nombre,
  ADD COLUMN id_madre INT(10) UNSIGNED NULL AFTER sexo,
  ADD COLUMN id_padre INT(10) UNSIGNED NULL AFTER id_madre,
  ADD KEY ix_animal_madre (id_madre),
  ADD KEY ix_animal_padre (id_padre),
  ADD CONSTRAINT fk_animal_madre FOREIGN KEY (id_madre)
    REFERENCES animales(id_animal) ON DELETE SET NULL,
  ADD CONSTRAINT fk_animal_padre FOREIGN KEY (id_padre)
    REFERENCES animales(id_animal) ON DELETE SET NULL;

CREATE TABLE eventos_reproductivos (
  id_evento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_animal INT(10) UNSIGNED NOT NULL COMMENT 'Hembra a la que corresponde el evento',
  id_reproductor INT(10) UNSIGNED NULL COMMENT 'Macho usado en servicio o reproductor conocido',
  id_cria INT(10) UNSIGNED NULL COMMENT 'Cría vinculada a un parto o destete concreto',
  tipo ENUM('servicio','inseminacion','diagnostico_gestacion','parto','aborto','destete') NOT NULL,
  fecha_evento DATE NOT NULL,
  resultado ENUM('pendiente','prenada','vacia','inconcluso','exitoso','fallido') NULL,
  fecha_probable_parto DATE NULL,
  observaciones TEXT NULL,
  id_usuario_registro INT(10) UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_evento_animal_fecha (id_animal, fecha_evento),
  KEY ix_evento_reproductor_fecha (id_reproductor, fecha_evento),
  KEY ix_evento_tipo_fecha (tipo, fecha_evento),
  CONSTRAINT fk_evento_animal FOREIGN KEY (id_animal)
    REFERENCES animales(id_animal) ON DELETE CASCADE,
  CONSTRAINT fk_evento_reproductor FOREIGN KEY (id_reproductor)
    REFERENCES animales(id_animal) ON DELETE SET NULL,
  CONSTRAINT fk_evento_cria FOREIGN KEY (id_cria)
    REFERENCES animales(id_animal) ON DELETE SET NULL,
  CONSTRAINT fk_evento_usuario FOREIGN KEY (id_usuario_registro)
    REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE historial_pesajes (
  id_pesaje BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_animal INT(10) UNSIGNED NOT NULL,
  fecha_pesaje DATE NOT NULL,
  peso_kg DECIMAL(8,2) NOT NULL,
  observaciones TEXT NULL,
  id_usuario_registro INT(10) UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_pesaje_animal_fecha (id_animal, fecha_pesaje),
  CONSTRAINT fk_pesaje_animal FOREIGN KEY (id_animal)
    REFERENCES animales(id_animal) ON DELETE CASCADE,
  CONSTRAINT fk_pesaje_usuario FOREIGN KEY (id_usuario_registro)
    REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conserva el peso ya cargado como punto de partida; no inventa mediciones anteriores.
INSERT INTO historial_pesajes (id_animal, fecha_pesaje, peso_kg, observaciones)
SELECT id_animal, DATE(COALESCE(updated_at, created_at)), peso_kg, 'Peso vigente al migrar la Fase 2'
FROM animales
WHERE peso_kg IS NOT NULL;

CREATE TABLE historial_movimientos_animales (
  id_movimiento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_animal INT(10) UNSIGNED NOT NULL,
  id_corral_origen INT(10) UNSIGNED NULL,
  id_corral_destino INT(10) UNSIGNED NOT NULL,
  fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  motivo VARCHAR(80) NOT NULL DEFAULT 'traslado',
  observaciones TEXT NULL,
  id_usuario_registro INT(10) UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_movimiento_animal_fecha (id_animal, fecha_movimiento),
  CONSTRAINT fk_movimiento_animal FOREIGN KEY (id_animal)
    REFERENCES animales(id_animal) ON DELETE CASCADE,
  CONSTRAINT fk_movimiento_origen FOREIGN KEY (id_corral_origen)
    REFERENCES corrales(id_corral) ON DELETE SET NULL,
  CONSTRAINT fk_movimiento_destino FOREIGN KEY (id_corral_destino)
    REFERENCES corrales(id_corral) ON DELETE RESTRICT,
  CONSTRAINT fk_movimiento_usuario FOREIGN KEY (id_usuario_registro)
    REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
