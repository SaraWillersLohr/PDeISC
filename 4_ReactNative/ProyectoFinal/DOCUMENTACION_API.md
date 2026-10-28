# Referencia de la API

Base local: `http://localhost:3010/api`. En producción, usar la URL HTTPS configurada para la estancia. Las rutas protegidas reciben `Authorization: Bearer <accessToken>` y validan el rol vigente en el backend.

Las respuestas exitosas usan `{ data: ... }` cuando devuelven recursos y `{ message: ... }` para confirmar acciones. Los errores usan `{ message: ... }`; los códigos comunes son `400` (entrada inválida), `401` (sesión inválida), `403` (rol sin permiso), `404` (recurso ausente), `409` (regla de negocio o conflicto), `500` (error interno) y `503` (base no disponible).

## Autenticación

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `POST /auth/login` | Público | Iniciar sesión con correo y contraseña. |
| `POST /auth/social/:provider` | Público | Iniciar sesión con `google`, `facebook` o `github`. |
| `POST /auth/refresh` | Token de renovación | Renovar la sesión. |
| `POST /auth/register` | Público | Solicitar acceso con nombre, apellido, correo y contraseña. |
| `POST /auth/verify-email` | Público | Verificar el correo con el código recibido. |
| `POST /auth/resend-verification` | Público | Reenviar el código de verificación. |
| `POST /auth/access-code` | Público | Activar una cuenta aprobada. |
| `POST /auth/resend-access-code` | Público | Reenviar el código de activación. |
| `POST /auth/password-recovery/request` | Público | Solicitar un código de recuperación. |
| `POST /auth/password-recovery/redeem` | Público | Validar el código y recibir un permiso de recuperación. |
| `POST /auth/password-recovery/reset` | Permiso de recuperación | Cambiar la contraseña con el permiso emitido. |
| `GET /auth/me` | Sesión activa | Consultar usuario y rol actuales. |
| `PUT /auth/profile` | Sesión activa | Actualizar nombre, apellido y foto de perfil. |
| `PUT /auth/password` | Sesión activa | Cambiar contraseña verificando la actual. |

## Animales, corrales y sanidad

| Método y ruta | Roles | Uso y parámetros principales |
| --- | --- | --- |
| `GET /animals` | admin, dueño, peón | Lista de animales; `?incluir_inactivos=true` incluye bajas. |
| `POST /animals` | dueño, peón | Alta con identificador, raza y corral. |
| `PUT /animals/:id` | dueño, peón | Editar ficha; requiere `version_dato`. |
| `POST /animals/:id/deactivate` | dueño | Baja lógica por motivo. |
| `DELETE /animals/:id` | dueño | Eliminar ficha animal inactiva y registros vinculados. |
| `GET /corrals` | admin, dueño, peón | Lista corrales activos y ocupación. |
| `POST /corrals` | dueño | Crear corral. |
| `PUT /corrals/:id` | dueño | Editar nombre/capacidad. |
| `DELETE /corrals/:id` | dueño | Baja lógica de corral vacío. |
| `POST /animals/:id/movements` | peón | Trasladar con `id_corral_destino`. |
| `POST /animals/:id/weights` | peón | Crear pesaje con `peso_kg` y `fecha`. |
| `POST /reports/sanitario` | peón | Reporte sanitario con animal, fecha, motivo y corral de enfermería. |
| `POST /reports/muerte` | peón | Reporte de muerte con coordenadas GPS; queda pendiente de revisión. |
| `GET /deaths` | admin | Listar reportes de muerte pendientes. |
| `PATCH /deaths/:id/review` | admin | Confirmar o rechazar con motivo obligatorio al rechazar. |
| `GET /health/nursing` | admin, dueño, veterinario | Listar enfermería. |
| `GET /health/animals/:id/records` | admin, dueño, veterinario | Consultar evolución clínica. |
| `POST /health/animals/:id/records` | veterinario | Agregar tratamiento o nota. |
| `PATCH /health/animals/:id/status` | veterinario | Actualizar diagnóstico. |
| `POST /health/animals/:id/discharge` | veterinario | Dar el alta, cambiar el estado sanitario a sano y dejar pendiente el traslado físico del peón. |

## Organización, tareas y producción

| Método y ruta | Roles | Uso |
| --- | --- | --- |
| `GET /organization/users` | admin, dueño | Consultar equipo. |
| `PUT /organization/users/:id` | admin | Editar cuenta y rol. |
| `DELETE /organization/users/:id` | admin | Baja lógica; acepta `id_responsable_reasignacion` para transferir tareas abiertas. |
| `GET /organization/catalog` | admin, dueño, peón | Consultar especies, razas y propuestas. |
| `POST /organization/catalog/species` | dueño | Agregar especie. |
| `POST /organization/catalog/species/:id/breeds` | dueño | Agregar raza. |
| `DELETE /organization/catalog/species/:id` | dueño | Eliminar especie sin animales asociados. |
| `DELETE /organization/catalog/breeds/:id` | dueño | Eliminar raza sin animales asociados. |
| `POST /organization/catalog/requests` | peón | Proponer especie o raza. |
| `PATCH /organization/catalog/requests/:id` | dueño | Aprobar o rechazar propuesta. |
| `GET /tasks` | admin, peón | Consultar tareas del usuario; el administrador consulta todas. |
| `POST /tasks` | admin | Asignar tarea a un peón activo. |
| `PATCH /tasks/:id` | admin, responsable | Cambiar estado de tarea. |
| `GET /reproduction` | admin, dueño, peón | Consultar montas y nacimientos. |
| `POST /reproduction/mating-services` | dueño, peón | Crear servicio de monta. |
| `POST /reproduction/mating-services/:id/confirm-pregnancy` | dueño, peón | Confirmar preñez y estimar fecha de nacimiento. |
| `POST /reproduction/births` | dueño, peón | Registrar nacimiento con progenitores registrados o texto. |
| `DELETE /reproduction/mating-services/:id` | dueño | Borrado permanente con auditoría. |
| `DELETE /reproduction/births/:id` | dueño | Borrar registro de nacimiento y conservar ficha de cría. |
| `GET /events` | admin, dueño | Consultar agenda relevante a las especies y razas activas; `?todos=1` incluye toda la agenda nacional. |
| `GET /dashboard` | admin, dueño | Consultar indicadores productivos. |
| `GET /notifications` | todos los roles activos | Consultar avisos con paginación por `before`. |
| `PATCH /notifications/:id` | todos los roles activos | Leer, eliminar o responder una notificación según su tipo. |
| `POST /sync/operations` | todos los roles activos | Sincronizar hasta 50 operaciones de campo con UUID idempotente. |

Los tipos aceptados por `/sync/operations` son `pesaje`, `movimiento`, `reporte_sanitario`, `reporte_muerte` y `nota_veterinaria`. El resultado incluye estado `aplicada`, `repetida` o `rechazada` para cada operación. Una muerte sincronizada produce la baja operativa y conserva el estado pendiente para revisión administrativa.
