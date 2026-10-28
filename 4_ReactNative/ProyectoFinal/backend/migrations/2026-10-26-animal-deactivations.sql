-- conservo el motivo y la fecha de las bajas sin eliminar la ficha del animal.
CREATE TABLE IF NOT EXISTS bajas_animales (
  id_baja INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_animal INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  motivo ENUM('venta','muerte','otro') NOT NULL,
  detalle VARCHAR(500) NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_baja_animal (id_animal),
  KEY idx_baja_motivo_fecha (motivo,fecha),
  CONSTRAINT fk_baja_animal FOREIGN KEY (id_animal) REFERENCES animales (id_animal),
  CONSTRAINT fk_baja_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
