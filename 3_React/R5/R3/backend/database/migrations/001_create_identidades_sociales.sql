-- Migración no destructiva: añade las identidades OAuth sin alterar usuarios existentes.
-- Ejecutar una única vez sobre la base elegida para R5.

CREATE TABLE IF NOT EXISTS identidades_sociales (
  id_identidad         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario           INT UNSIGNED NOT NULL,
  proveedor            VARCHAR(30) NOT NULL,
  proveedor_usuario_id VARCHAR(255) NOT NULL,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_identidad_proveedor_usuario (proveedor, proveedor_usuario_id),
  UNIQUE KEY uk_usuario_proveedor (id_usuario, proveedor),
  CONSTRAINT fk_identidad_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;
