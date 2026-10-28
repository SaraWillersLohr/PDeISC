-- registro confirmación y recordatorio único de preñez sin tocar servicios previos.
ALTER TABLE servicios_monta MODIFY COLUMN estado ENUM('programado','realizado','anulado','preñada') NOT NULL DEFAULT 'realizado';
ALTER TABLE servicios_monta ADD COLUMN IF NOT EXISTS fecha_estimada_nacimiento DATE NULL;
ALTER TABLE servicios_monta ADD COLUMN IF NOT EXISTS prenez_confirmada_en DATETIME NULL;
ALTER TABLE servicios_monta ADD COLUMN IF NOT EXISTS recordatorio_nacimiento_en DATETIME NULL;
