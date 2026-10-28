-- agrego campos de agenda sin modificar ni borrar eventos existentes.
ALTER TABLE eventos_campo ADD COLUMN IF NOT EXISTS tipo_evento VARCHAR(40) NULL;
ALTER TABLE eventos_campo ADD COLUMN IF NOT EXISTS provincia VARCHAR(80) NULL;
ALTER TABLE eventos_campo ADD COLUMN IF NOT EXISTS localidad VARCHAR(100) NULL;
ALTER TABLE eventos_campo ADD COLUMN IF NOT EXISTS organizador VARCHAR(160) NULL;
ALTER TABLE eventos_campo ADD COLUMN IF NOT EXISTS especie VARCHAR(60) NULL;
ALTER TABLE eventos_campo ADD COLUMN IF NOT EXISTS raza VARCHAR(100) NULL;
ALTER TABLE eventos_campo ADD COLUMN IF NOT EXISTS codigo_fuente VARCHAR(80) NULL;

-- registro asociaciones oficiales y estado de cada consulta automática.
CREATE TABLE IF NOT EXISTS fuentes_eventos (
  codigo_fuente VARCHAR(80) NOT NULL PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  url VARCHAR(500) NOT NULL,
  especie VARCHAR(60) NULL,
  raza VARCHAR(100) NULL,
  pais VARCHAR(80) NOT NULL DEFAULT 'Argentina',
  habilitada TINYINT(1) NOT NULL DEFAULT 1,
  consultada_en DATETIME NULL,
  ultimo_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- conservo eventos publicados por asociaciones aparte de los creados por usuarios.
CREATE TABLE IF NOT EXISTS eventos_importados (
  id_evento_importado BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo_fuente VARCHAR(80) NOT NULL,
  clave_externa VARCHAR(191) NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  tipo_evento VARCHAR(40) NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  provincia VARCHAR(80) NULL,
  localidad VARCHAR(100) NULL,
  ubicacion VARCHAR(200) NULL,
  organizador VARCHAR(160) NULL,
  especie VARCHAR(60) NULL,
  raza VARCHAR(100) NULL,
  url VARCHAR(500) NULL,
  detectado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_evento_fuente_clave (codigo_fuente, clave_externa),
  KEY idx_evento_fecha (fecha_inicio),
  KEY idx_evento_especie_raza (especie, raza),
  KEY idx_evento_provincia (provincia),
  CONSTRAINT fk_evento_importado_fuente FOREIGN KEY (codigo_fuente) REFERENCES fuentes_eventos (codigo_fuente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- guardo cada intento para poder detectar fuentes que cambiaron su página.
CREATE TABLE IF NOT EXISTS sincronizaciones_eventos (
  id_sincronizacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo_fuente VARCHAR(80) NOT NULL,
  iniciada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finalizada_en DATETIME NULL,
  estado VARCHAR(24) NOT NULL DEFAULT 'iniciada',
  eventos_leidos INT UNSIGNED NOT NULL DEFAULT 0,
  mensaje TEXT NULL,
  KEY idx_sync_eventos_fuente_fecha (codigo_fuente, iniciada_en),
  CONSTRAINT fk_sync_eventos_fuente FOREIGN KEY (codigo_fuente) REFERENCES fuentes_eventos (codigo_fuente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- mantengo las asociaciones iniciales del plan como fuentes editables.
INSERT INTO fuentes_eventos (codigo_fuente,nombre,url,especie,raza,pais) VALUES
('angus_argentina','Asociación Argentina de Angus','https://angus.org.ar/','bovino','angus','Argentina'),
('hereford_argentina','Asociación Argentina de Criadores de Hereford','https://hereford.org.ar/','bovino','hereford','Argentina'),
('brangus_argentina','Asociación Argentina de Brangus','https://brangus.org.ar/','bovino','brangus','Argentina'),
('bonsmara_argentina','Asociación Argentina de Criadores de Bonsmara','https://bonsmara.org.ar/','bovino','bonsmara','Argentina'),
('bovino_criollo_argentina','Asociación Argentina de Criadores de Ganado Bovino Criollo','https://bovinocriollo.com.ar/','bovino','criollo','Argentina'),
('cuarto_de_milla_argentina','Criadores Argentinos de Caballos Cuarto de Milla','https://www.caccm.com.ar/','equino','cuarto de milla','Argentina'),
('caballo_de_polo_argentina','Asociación Argentina de Criadores de Caballos de Polo','https://criapoloargentino.com.ar/','equino','caballo de polo','Argentina'),
('caballos_arabes_argentina','Asociación Argentina de Criadores de Caballos Árabes','https://www.aacca.com.ar/','equino','árabe','Argentina'),
('spc_argentina','Criadores Argentinos del Sangre Pura de Carrera','https://criadores-spc.com.ar/','equino','sangre pura de carrera','Argentina'),
('caballo_peruano_argentina','Asociación Argentina de Criadores de Caballos Peruanos','https://aaccpp.org.ar/','equino','caballo peruano','Argentina'),
('caballos_criollos_argentina','Asociación Argentina de Criadores de Caballos Criollos','https://caballoscriollos.com/','equino','criollo','Argentina'),
('braford_argentina','Asociación Braford Argentina','https://www.braford.org.ar/','bovino','braford','Argentina'),
('merino_argentina','Asociación Argentina Criadores de Merino','https://www.merino.org.ar/','ovino','merino','Argentina'),
('hampshire_down_argentina','Asociación Criadores de Hampshire Down','https://hampshiredown.org.ar/','ovino','hampshire down','Argentina'),
('corriedale_argentina','Asociación Argentina Criadores de Corriedale','https://www.corriedale.org.ar/','ovino','corriedale','Argentina'),
('porcinos_argentina','Asociación Argentina Productores de Porcinos','https://porcinos.org.ar/','porcino',NULL,'Argentina')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),url=VALUES(url),especie=VALUES(especie),raza=VALUES(raza),pais=VALUES(pais);
