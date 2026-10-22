-- conservo las tablas y las definiciones de roles, pero limpio los datos de la estancia.
-- preservo una cuenta activa por rol administrador y dueno, seleccionada por fecha de alta.
-- selecciona la base correcta en el cliente sql y respalda los datos antes de ejecutar.
-- ejecutar antes las migraciones de acceso y el cambio de copropietario a administrador.

DELIMITER $$

DROP PROCEDURE IF EXISTS limpiar_datos_operativos_estancia$$

CREATE PROCEDURE limpiar_datos_operativos_estancia()
BEGIN
  DECLARE v_fin BOOLEAN DEFAULT FALSE;
  DECLARE v_tabla VARCHAR(64);
  DECLARE v_cantidad_roles INT DEFAULT 0;
  DECLARE v_tablas_no_transaccionales INT DEFAULT 0;
  DECLARE v_base VARCHAR(64);
  DECLARE cur_tablas CURSOR FOR
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
      AND TABLE_NAME NOT IN ('roles', 'usuarios')
    ORDER BY TABLE_NAME;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = TRUE;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET FOREIGN_KEY_CHECKS = 1;
    RESIGNAL;
  END;

  SET v_base = DATABASE();
  IF v_base IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'selecciona la base de la estancia antes de ejecutar';
  END IF;

  SELECT COUNT(*) INTO v_tablas_no_transaccionales
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = v_base
    AND TABLE_TYPE = 'BASE TABLE'
    AND ENGINE <> 'InnoDB';
  IF v_tablas_no_transaccionales > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'la limpieza requiere que todas las tablas usen InnoDB; no se limpio ningun dato';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS usuarios_a_conservar;
  CREATE TEMPORARY TABLE usuarios_a_conservar (
    id_usuario INT UNSIGNED NOT NULL PRIMARY KEY
  ) ENGINE=MEMORY;

  INSERT INTO usuarios_a_conservar (id_usuario)
  SELECT u.id_usuario
  FROM usuarios u
  JOIN roles r ON r.id_rol = u.id_rol
  WHERE r.nombre = 'administrador'
    AND u.activo = 1
    AND u.estado_cuenta = 'activo'
  ORDER BY u.created_at, u.id_usuario
  LIMIT 1;

  INSERT INTO usuarios_a_conservar (id_usuario)
  SELECT u.id_usuario
  FROM usuarios u
  JOIN roles r ON r.id_rol = u.id_rol
  WHERE r.nombre = 'dueno'
    AND u.activo = 1
    AND u.estado_cuenta = 'activo'
  ORDER BY u.created_at, u.id_usuario
  LIMIT 1;

  SELECT COUNT(*) INTO v_cantidad_roles FROM usuarios_a_conservar;
  IF v_cantidad_roles <> 2 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'se requiere una cuenta activa de administrador y otra de dueno; no se limpio ningun dato';
  END IF;

  START TRANSACTION;
  SET FOREIGN_KEY_CHECKS = 0;

  OPEN cur_tablas;
  bucle_tablas: LOOP
    FETCH cur_tablas INTO v_tabla;
    IF v_fin THEN
      LEAVE bucle_tablas;
    END IF;

    SET @limpieza_sql = CONCAT('DELETE FROM `', REPLACE(v_tabla, '`', '``'), '`');
    PREPARE sentencia_limpieza FROM @limpieza_sql;
    EXECUTE sentencia_limpieza;
    DEALLOCATE PREPARE sentencia_limpieza;
  END LOOP;
  CLOSE cur_tablas;

  DELETE u
  FROM usuarios u
  LEFT JOIN usuarios_a_conservar c ON c.id_usuario = u.id_usuario
  WHERE c.id_usuario IS NULL;

  COMMIT;
  SET FOREIGN_KEY_CHECKS = 1;
  DROP TEMPORARY TABLE usuarios_a_conservar;
END$$

CALL limpiar_datos_operativos_estancia()$$
DROP PROCEDURE limpiar_datos_operativos_estancia$$

DELIMITER ;
