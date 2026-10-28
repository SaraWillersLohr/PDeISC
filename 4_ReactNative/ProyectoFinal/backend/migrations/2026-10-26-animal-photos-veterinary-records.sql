ALTER TABLE animales ADD COLUMN IF NOT EXISTS foto LONGTEXT NULL AFTER nombre;
ALTER TABLE tratamientos ADD COLUMN IF NOT EXISTS tipo ENUM('tratamiento','nota') NOT NULL DEFAULT 'tratamiento' AFTER id_veterinario;
ALTER TABLE tratamientos ADD COLUMN IF NOT EXISTS foto LONGTEXT NULL AFTER observaciones;
