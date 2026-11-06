-- Ejecutar junto con el cambio de aplicación, después de identificar al Dueño
-- y reasignar explícitamente las cuentas Administrador y Copropietario.
START TRANSACTION;

INSERT INTO roles (nombre, descripcion)
SELECT 'gestor_usuarios', 'Gestión de solicitudes y cuentas operativas'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'gestor_usuarios');

UPDATE usuarios u
JOIN solicitudes_registro s ON s.email = u.email AND s.estado = 'aprobada'
SET u.estado_cuenta = 'activo'
WHERE u.estado_cuenta = 'pendiente_acceso'
  AND u.activo = 1
  AND u.email_verificado_at IS NOT NULL;

UPDATE notificaciones
SET rol_destino = 'dueno'
WHERE rol_destino = 'administrador';

COMMIT;
