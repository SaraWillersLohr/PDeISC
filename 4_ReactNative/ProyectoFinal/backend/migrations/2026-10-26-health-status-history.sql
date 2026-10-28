CREATE TABLE IF NOT EXISTS historial_estado_salud (
  id_historial INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_animal INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  estado_anterior VARCHAR(30) NOT NULL,
  estado_nuevo VARCHAR(30) NOT NULL,
  observaciones VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_historial_salud_animal_fecha (id_animal, created_at),
  CONSTRAINT fk_historial_salud_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal),
  CONSTRAINT fk_historial_salud_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
