-- Ejecutar una sola vez sobre la base existente seleccionada en HeidiSQL.
-- Guarda la identidad OAuth en la solicitud para vincularla durante la aprobación.
-- No crea bases ni modifica las cuentas existentes.

ALTER TABLE solicitudes_registro
  ADD COLUMN proveedor_social VARCHAR(30) NULL AFTER password_hash,
  ADD COLUMN proveedor_usuario_id VARCHAR(255) NULL AFTER proveedor_social;
