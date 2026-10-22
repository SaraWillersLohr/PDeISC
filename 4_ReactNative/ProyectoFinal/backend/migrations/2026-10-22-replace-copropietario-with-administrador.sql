-- aplicar solo después de respaldar estancia_app.
-- conservo el id del rol para mantener las relaciones de usuarios existentes.
START TRANSACTION;

UPDATE roles
SET nombre = 'administrador',
    descripcion = 'Gestion administrativa de la estancia'
WHERE nombre = 'copropietario';

COMMIT;
