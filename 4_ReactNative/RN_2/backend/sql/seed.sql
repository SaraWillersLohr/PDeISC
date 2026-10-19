-- Selecciona la base de ScanStock antes de agregar categorías opcionales de ejemplo.
USE scanstock;
-- INSERT IGNORE permite volver a ejecutar este archivo sin duplicar las categorías.
INSERT IGNORE INTO categorias (nombre,nombre_normalizado) VALUES
('Alimentos','alimentos'),('Bebidas','bebidas'),('Limpieza','limpieza');
