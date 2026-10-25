-- Ejecutar una vez antes de habilitar fotos de perfil.
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS foto_perfil LONGTEXT NULL AFTER apellido;
