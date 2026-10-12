-- Ejecutar una sola vez después de las migraciones 001–004.
-- Las notificaciones existentes quedan globales (destinatario NULL).
-- Los avisos de solicitudes de registro se guardan para el administrador destinatario.

ALTER TABLE notificaciones
  ADD COLUMN id_usuario_destinatario INT(10) UNSIGNED NULL AFTER id_animal,
  ADD KEY ix_notificacion_destinatario_fecha (id_usuario_destinatario, created_at),
  ADD CONSTRAINT fk_notificacion_destinatario
    FOREIGN KEY (id_usuario_destinatario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE;
