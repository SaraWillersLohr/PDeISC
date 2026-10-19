-- Crea y selecciona la base propia de ScanStock sin afectar otras bases.
CREATE DATABASE IF NOT EXISTS scanstock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scanstock;

-- Guarda los datos generales y el saldo vigente de cada producto.
CREATE TABLE IF NOT EXISTS productos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(100) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  precio DECIMAL(10,2) NULL,
  stock_actual INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 0,
  fecha_vencimiento DATE NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT ck_producto_stock CHECK (stock_actual >= 0 AND stock_minimo >= 0),
  CONSTRAINT ck_producto_precio CHECK (precio IS NULL OR precio >= 0),
  INDEX idx_productos_activo_nombre (activo, nombre), INDEX idx_productos_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB;

-- Mantiene nombres únicos sin importar mayúsculas ni espacios equivalentes.
CREATE TABLE IF NOT EXISTS categorias (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  nombre_normalizado VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Relaciona productos y categorías con una asociación por cada par.
CREATE TABLE IF NOT EXISTS producto_categorias (
  producto_id INT UNSIGNED NOT NULL,
  categoria_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (producto_id, categoria_id),
  CONSTRAINT fk_pc_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT fk_pc_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Conserva cada cambio de stock, incluso si el producto se desactiva.
CREATE TABLE IF NOT EXISTS movimientos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  producto_id INT UNSIGNED NOT NULL,
  tipo ENUM('entrada','salida') NOT NULL,
  cantidad INT NOT NULL,
  stock_anterior INT NOT NULL,
  stock_posterior INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT ck_mov_cantidades CHECK (cantidad > 0 AND stock_anterior >= 0 AND stock_posterior >= 0),
  INDEX idx_movimientos_fecha (created_at), INDEX idx_movimientos_producto (producto_id, created_at)
) ENGINE=InnoDB;
