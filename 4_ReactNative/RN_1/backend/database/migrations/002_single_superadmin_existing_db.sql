-- ADVERTENCIA: modifica la base seleccionada en HeidiSQL y elimina las demás cuentas.
-- No crea ni selecciona una base nueva. Hacé primero un respaldo desde HeidiSQL.
-- El dump de EstanciaApp contiene sarawillerslohr08@gmail.com; se usa el correo completo.
-- Contraseña inicial solicitada: admin123. El valor guardado es un hash bcrypt.

-- Conservar los tratamientos aunque se elimine el usuario veterinario.
ALTER TABLE tratamientos DROP FOREIGN KEY fk_tratamiento_vet;
ALTER TABLE tratamientos MODIFY id_veterinario INT(10) UNSIGNED NULL;
ALTER TABLE tratamientos
  ADD CONSTRAINT fk_tratamiento_vet
  FOREIGN KEY (id_veterinario) REFERENCES usuarios(id_usuario)
  ON DELETE SET NULL;

START TRANSACTION;

INSERT INTO roles (nombre, descripcion)
VALUES ('administrador', 'Administrador superior de EstanciaApp')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

SET @id_rol_admin = (SELECT id_rol FROM roles WHERE nombre = 'administrador' LIMIT 1);

-- En el dump actual esta cuenta ya existe (Sara, id_usuario 26).
-- Si no existe en la base seleccionada, se crea.
INSERT INTO usuarios
  (id_rol, nombre, apellido, email, password_hash, activo, debe_cambiar_password)
SELECT @id_rol_admin, 'Sara', 'Willers Löhr', 'sarawillerslohr08@gmail.com',
       '$2a$10$JuAy3zRuYwnN3Ao1s0ElROFypEN5WPdgKRzXz9cp/oYQzOPu1wekS', 1, 1
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios WHERE email = 'sarawillerslohr08@gmail.com'
);

UPDATE usuarios
SET id_rol = @id_rol_admin,
    nombre = 'Sara',
    apellido = 'Willers Löhr',
    password_hash = '$2a$10$JuAy3zRuYwnN3Ao1s0ElROFypEN5WPdgKRzXz9cp/oYQzOPu1wekS',
    activo = 1,
    debe_cambiar_password = 1
WHERE email = 'sarawillerslohr08@gmail.com';

SET @id_admin = (SELECT id_usuario FROM usuarios WHERE email = 'sarawillerslohr08@gmail.com' LIMIT 1);

-- Si ya se creó la tabla de códigos en esta base, limpiar códigos de las cuentas que se quitarán.
SET @borrar_codigos_sql = IF(
  EXISTS (SELECT 1 FROM information_schema.tables
          WHERE table_schema = DATABASE() AND table_name = 'codigos_verificacion_correo'),
  'DELETE FROM codigos_verificacion_correo WHERE id_usuario <> @id_admin',
  'DO 0'
);
PREPARE borrar_codigos FROM @borrar_codigos_sql;
EXECUTE borrar_codigos;
DEALLOCATE PREPARE borrar_codigos;

-- Las identidades sociales se eliminan; los tratamientos se conservan con veterinario NULL.
DELETE FROM identidades_sociales WHERE id_usuario <> @id_admin;
DELETE FROM usuarios WHERE id_usuario <> @id_admin;

COMMIT;

-- Resultado esperado: una fila en usuarios y una cuenta con rol administrador.
SELECT u.id_usuario, u.nombre, u.apellido, u.email, r.nombre AS rol, u.activo,
       u.debe_cambiar_password
FROM usuarios u
JOIN roles r ON r.id_rol = u.id_rol;
