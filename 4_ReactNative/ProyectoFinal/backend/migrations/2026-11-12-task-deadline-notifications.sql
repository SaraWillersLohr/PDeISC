ALTER TABLE tareas ADD COLUMN IF NOT EXISTS vencimiento_notificado_en DATETIME NULL;
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS id_usuario_destino INT UNSIGNED NULL;
