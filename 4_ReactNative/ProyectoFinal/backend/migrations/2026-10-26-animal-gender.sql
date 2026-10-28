-- agrego el género a las fichas y conservo los animales existentes como no especificados.
ALTER TABLE animales
  ADD COLUMN IF NOT EXISTS genero ENUM('hembra','macho','no_especificado') NOT NULL DEFAULT 'no_especificado' AFTER nombre;
