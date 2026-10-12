-- Ejecutar una sola vez sobre la base existente seleccionada en HeidiSQL.
-- No borra ni reemplaza usuarios ni crea solicitudes; esas van en la migración 003.

ALTER TABLE usuarios
  ADD COLUMN estado_cuenta VARCHAR(32) NOT NULL DEFAULT 'activo',
  ADD COLUMN email_verificado_at DATETIME NULL,
  ADD COLUMN token_version INT UNSIGNED NOT NULL DEFAULT 0;

-- Conserva los accesos preexistentes: los activos del dump siguen activos.
UPDATE usuarios
SET estado_cuenta = IF(activo = 1, 'activo', 'inactivo');
