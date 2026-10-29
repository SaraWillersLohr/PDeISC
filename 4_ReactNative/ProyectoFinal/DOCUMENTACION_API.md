# Documentación de la API REST — EstanciaApp

Esta referencia describe la API implementada en `backend/src/routes/` y sus controladores. Si un cambio del código modifica un método, permiso, parámetro o forma de respuesta, actualizá este documento junto con la implementación.

## Convenciones

- URL local por defecto: `http://localhost:3010/api` (el puerto se puede cambiar con `PORT`). En producción se debe usar la URL HTTPS configurada para el despliegue.
- El cuerpo y las respuestas de la API usan JSON, salvo el callback OAuth, que redirige o entrega una página HTML puente.
- Las rutas protegidas reciben `Authorization: Bearer <accessToken>`. No se debe usar el token de renovación o el permiso temporal de recuperación como token de acceso.
- Las fechas de entrada se envían como `YYYY-MM-DD`. Los identificadores de ruta se envían como enteros positivos.
- Las respuestas de consulta normalmente tienen `{ "data": ... }`. Las acciones devuelven `{ "message": "..." }`, y las altas suelen incluir también `data` con el identificador creado. La sesión de login es una excepción y devuelve sus propiedades en la raíz.
- Los nombres de propiedades JSON son los que consume el frontend. Los valores de campos que contienen filas MariaDB pueden representar números como números o cadenas numéricas, según el driver y la consulta.
- Los ejemplos con tokens, identificadores y datos personales son ficticios.

### Códigos HTTP

| Código | Significado general |
| --- | --- |
| `200 OK` | Consulta o acción completada. |
| `201 Created` | Recurso creado. |
| `202 Accepted` | Solicitud aceptada con respuesta neutra, por ejemplo recuperación de contraseña. |
| `302 Found` | Callback OAuth web redirigido al frontend permitido. |
| `400 Bad Request` | Falta un campo requerido, formato inválido, regla de entrada incumplida o decisión no permitida. El cuerpo suele incluir `{ "message": "..." }`. |
| `401 Unauthorized` | Falta una sesión válida, expiró el token o no se aceptaron las credenciales. |
| `403 Forbidden` | Usuario autenticado sin permiso para el rol requerido. |
| `404 Not Found` | Recurso ausente o no visible para ese usuario. |
| `409 Conflict` | Conflicto con el estado actual, duplicado o regla de negocio. |
| `500 Internal Server Error` | Error interno o fallo no recuperable de una operación. |
| `503 Service Unavailable` | No se puede verificar la sesión o la base de datos no está disponible. |

Un error JSON tiene esta forma:

```json
{ "message": "descripción legible del error" }
```

El middleware de errores responde `503` ante errores de conexión/concurrencia de MySQL reconocidos y `500` para otros errores no controlados. Los controladores pueden devolver mensajes y estados más específicos; se indican en las tablas siguientes. `401` y `403` pueden producirse en cualquier endpoint protegido.

## Autenticación, cuentas y perfil

| Método y ruta | Acceso | Parámetros y cuerpo | Éxito | Errores principales |
| --- | --- | --- | --- | --- |
| `GET /api/health` | Público | Ninguno. | `200`: `{ "status": "ok" }`. | — |
| `POST /api/auth/login` | Público | JSON: `email`, `password`. | `200`: objeto de sesión descrito abajo. | `400` campos obligatorios; `401` credenciales inválidas/cuenta no habilitada; `503` base no disponible. |
| `GET /api/auth/social/config` | Público | Ninguno. | `200`: `{ "facebookAppId": string \| null }`. Los IDs de Google/GitHub se leen desde la configuración pública del frontend. | — |
| `POST /api/auth/social/:provider` | Público | `provider`: `google`, `facebook` o `github`. JSON: `code`, `redirectUri` y `clientId` (los tres requeridos); opcional `codeVerifier` para flujos PKCE. | `200`: objeto de sesión. | `400` proveedor/código inválidos; `401` credencial rechazada o cuenta social no habilitada; `503` base no disponible. |
| `GET /api/auth/:provider/callback` | Público/proveedor OAuth | Ruta `provider`; query del proveedor: `state`, `code` o `error`. `state` web incluye el origen y un nonce. | Web: `302` a `/oauth/callback` del origen permitido. Móvil: `200 text/html` que abre `estanciaapp://oauth/callback`. | `400` origen web no permitido; `404` proveedor desconocido. El callback pasa `error=invalid_response` o `error=missing_response` al cliente cuando corresponde. |
| `POST /api/auth/refresh` | Público con token de renovación en el cuerpo | JSON: `refreshToken`. | `200`: objeto de sesión renovada. | `400` falta token; `401` token inválido/expirado o sesión revocada; `503` base no disponible. |
| `POST /api/auth/register` | Público | JSON: `nombre`, `apellido`, `email`, `password`. Nombre/apellido hasta 100 caracteres; correo válido hasta 150; contraseña entre 10 y 72 bytes UTF-8. | `200`: `{ "message": "solicitud creada; revisá tu correo para verificarlo" }`. Crea una solicitud pendiente de verificación, no una cuenta activa. | `400` validación, solicitud/cuenta duplicada o error de envío; `503` base no disponible. |
| `POST /api/auth/verify-email` | Público | JSON: `email`, `code` (seis dígitos). | `200`: `{ "message": "correo verificado; la solicitud espera aprobación administrativa" }`. | `400` código inválido/vencido, solicitud no disponible o datos incompletos; `503` base no disponible. |
| `POST /api/auth/resend-verification` | Público | JSON: `email`. | `200`: `{ "message": "si hay una solicitud pendiente, enviaremos otro código" }`. | `400` falta correo o error de operación; `503` base no disponible. |
| `POST /api/auth/access-code` | Público | JSON: `email`, `code` de activación. | `200`: `{ "message": "acceso activado", "data": <sesión> }`. | `400` código inválido/vencido, solicitud sin aprobar o datos incompletos; `503` base no disponible. |
| `POST /api/auth/resend-access-code` | Público | JSON: `email`. | `200`: `{ "message": "si el acceso fue aprobado y sigue pendiente, enviaremos un nuevo código" }`; no confirma si hay una solicitud aprobada. | `400` falta correo/error operativo; `503` base no disponible. |
| `POST /api/auth/password-recovery/request` | Público | JSON: `email`. | `202`: mensaje neutro para no revelar si existe una cuenta. | `503` no se pudo consultar la base. |
| `POST /api/auth/password-recovery/redeem` | Público | JSON: `email`, `code` de seis dígitos. | `200`: `{ "message": "Código válido. Ahora elegí una contraseña nueva.", "data": { "resetToken": "..." } }`. El permiso temporal vence a los 15 minutos y solo sirve para completar el cambio. | `400` correo/código inválidos, vencidos, usados o sin cuenta activa; `503` base no disponible. |
| `POST /api/auth/password-recovery/reset` | Público con permiso temporal | JSON: `resetToken`, `password` nueva (10–72 bytes UTF-8). | `200`: `{ "message": "Contraseña actualizada. Iniciaste sesión.", "data": <sesión> }`. | `400` token vencido/usado o contraseña inválida; `503` base no disponible. |
| `GET /api/auth/me` | Cualquier rol activo | Sin parámetros. | `200`: `{ "usuario": { "id_usuario", "email", "rol", "token_version", ... } }`. | `401` sesión inválida/revocada; `503` no se pudo verificar la sesión. |
| `PUT /api/auth/profile` | Cualquier rol activo | JSON: `nombre`, `apellido` (ambos obligatorios, hasta 100 caracteres) y `foto_perfil` (imagen JPEG/PNG/WebP como data URL, hasta 1,5 MB). Si se omite, es `null` o cadena vacía, se quita la foto actual. | `200`: `{ "message": "Perfil actualizado.", "data": { "id_usuario", "email", "nombre", "apellido", "foto_perfil", "rol" } }`. | `400` campos/foto inválidos; `401`; `503`. |
| `PUT /api/auth/password` | Cualquier rol activo | JSON: `currentPassword`, `newPassword`. | `200`: `{ "message": "Contraseña actualizada." }`. Las sesiones anteriores se invalidan mediante la versión de token. | `400` contraseña actual incorrecta o nueva no válida; `401`; `503`. |

### Forma de la sesión

Las rutas de login, renovación, activación y recuperación exitosa devuelven la sesión directamente o dentro de `data`, según la ruta:

```json
{
  "accessToken": "<jwt de acceso>",
  "refreshToken": "<jwt de renovación>",
  "accessTokenExpiresAt": 1790000000000,
  "usuario": {
    "id_usuario": 12,
    "email": "persona@example.com",
    "rol": "peon",
    "token_version": 1,
    "nombre": "Ana",
    "apellido": "Ejemplo",
    "foto_perfil": null
  }
}
```

`accessTokenExpiresAt` es una marca Unix en milisegundos para programar la renovación del cliente. Roles admitidos: `administrador`, `dueno`, `peon`, `veterinario`.

## Animales, corrales, pesajes y movimientos

Todas las rutas de esta sección requieren JWT válido.

| Método y ruta | Roles | Parámetros y cuerpo | Éxito | Errores principales |
| --- | --- | --- | --- | --- |
| `GET /api/animals` | Administrador, dueño, peón | Query opcional `incluir_inactivos=true\|false` (por defecto solo activos). | `200`: `{ "data": [<animal>] }`. Incluye identificador, nombre/foto, género, fecha de nacimiento, peso, versión, estado sanitario, datos de baja, corral, raza y especie. | `400` filtro inválido; `500` lectura fallida. |
| `POST /api/animals` | Dueño, peón | JSON: `identificador` (obligatorio, hasta 50), `id_raza`, `id_corral`; opcionales `nombre`, `genero` (`hembra`, `macho`, `no_especificado`), `fecha_nacimiento`, `peso_kg`, `foto` (data URL JPEG/PNG/WebP, máx. 1,5 MB). | `201`: `{ "data": { "id_animal": 123, "identificador": "A-001" } }`. | `400` validación/foto; `409` identificador duplicado, corral inválido/inactivo/lleno o alta directa en enfermería; `401`/`403`; `503`/`500`. |
| `PUT /api/animals/:id` | Dueño, peón | Ruta `id`. JSON: `version_dato`, `identificador`, `id_raza`; opcionales `nombre`, `fecha_nacimiento`, `genero`. | `200`: `{ "message": "ficha actualizada" }`. | `400` entrada inválida; `409` versión desactualizada, animal inactivo o identificador duplicado; `401`/`403`; `500`. |
| `POST /api/animals/:id/deactivate` | Dueño | Ruta `id`. JSON: `motivo` (`venta`, `muerte`, `otro`), opcional `detalle` (hasta 500). Si `muerte`: `latitud` (-90…90), `longitud` (-180…180), opcional `foto` JPEG/PNG/WebP data URL máx. 1,5 MB. | `200`: `{ "message": "animal dado de baja; se conservó su ficha e historial" }`. | `400` motivo/detalle/GPS/foto inválidos; `409` animal inexistente o ya inactivo; `401`/`403`; `500`/`503`. |
| `DELETE /api/animals/:id` | Dueño | Ruta `id`; sin cuerpo. Solo acepta ficha inactiva. | `200`: `{ "message": "ficha y registros vinculados eliminados definitivamente" }`. Conserva auditoría y los progenitores de otras fichas como texto. | `400` ID inválido; `409` animal activo; `401`/`403`; `500`/`503`. |
| `GET /api/corrals` | Administrador, dueño, peón | Sin parámetros. | `200`: `{ "data": [{ "id_corral", "nombre", "capacidad", "es_enfermeria", "ocupacion" }] }`. Solo corrales activos. | `500` lectura fallida. |
| `POST /api/corrals` | Dueño | JSON: `nombre`, `capacidad` entero positivo, opcional `es_enfermeria` booleano. | `201`: `{ "data": { "id_corral": 23 } }`. | `400` entrada inválida; `409` nombre duplicado u otro fallo de inserción; `401`/`403`. |
| `PUT /api/corrals/:id` | Dueño | Ruta `id`. JSON: `nombre`, `capacidad` entero positivo. | `200`: `{ "message": "corral actualizado" }`. | `400` entrada inválida; `404` corral ausente/inactivo; `409` capacidad menor que ocupación o actualización fallida; `401`/`403`; `500`. |
| `DELETE /api/corrals/:id` | Dueño | Ruta `id`; sin cuerpo. No permite baja del corral de enfermería ni de un corral con animales. | `200`: `{ "message": "corral dado de baja" }`. Baja lógica y auditoría. | `400` ID inválido; `409` enfermería/corral no disponible o con animales; `401`/`403`; `500`. |
| `POST /api/animals/:id/weights` | Peón | Ruta `id`. JSON: `peso_kg` positivo, `fecha`. | `201`: `{ "data": { "id_pesaje": 456 } }`. También actualiza el peso actual de la ficha. | `400` entrada inválida; `409` animal inactivo u otro conflicto de negocio; `401`/`403`; `503`. |
| `POST /api/animals/:id/movements` | Peón | Ruta `id`. JSON: `id_corral_destino`; opcional `observaciones` (hasta 500). | `201`: `{ "message": "traslado registrado", "data": { "id_animal": 123, "id_corral_destino": 23, "corral_destino": "Potrero Norte" } }`. | `400` ID inválido; `409` animal/destino inactivo, misma ubicación, capacidad llena o falta de alta veterinaria para salir de enfermería; `401`/`403`; `500` ante otros fallos internos. |

## Reportes y módulo veterinario

| Método y ruta | Roles | Parámetros y cuerpo | Éxito | Errores principales |
| --- | --- | --- | --- | --- |
| `POST /api/reports/sanitario` | Peón | JSON: `id_animal`, `fecha`, opcional `motivo` (hasta 500), `id_corral_destino` (corral activo de enfermería). El controlador acepta y valida opcionalmente `foto` JPEG/PNG/WebP data URL máx. 1,5 MB, pero actualmente no la almacena en el reporte sanitario. | `201`: `{ "message": "enfermedad registrada y animal trasladado a enfermería" }`. El ingreso, estado sanitario e historial se guardan en conjunto. | `400` datos/foto inválidos; `409` animal inactivo, destino no es enfermería o capacidad agotada; `401`/`403`; `503` si falla la adquisición de la conexión. |
| `POST /api/reports/muerte` | Peón | JSON: `id_animal`, `fecha`, `latitud`, `longitud` obligatorios; opcionales `motivo`, `foto` JPEG/PNG/WebP data URL máx. 1,5 MB. | `201`: `{ "message": "muerte notificada; baja operativa registrada y revisión pendiente" }`. La ficha queda inactiva hasta revisión. | `400` entrada/GPS/foto inválidos; `409` animal inactivo u otro conflicto de operación; `401`/`403`; `503` si falla la adquisición de la conexión. |
| `GET /api/deaths` | Administrador | Sin parámetros. | `200`: `{ "data": [<reporte de muerte pendiente>] }`. Incluye campos del reporte, animal, corral y persona que informó. | `500` lectura fallida; `401`/`403`. |
| `PATCH /api/deaths/:id/review` | Administrador | Ruta `id`. JSON: `decision` (`confirmar` o `rechazar`); al rechazar, `motivo_revision` obligatorio (hasta 500). | `200`: `{ "message": "muerte confirmada" }` o `{ "message": "animal reactivado; reporte conservado" }`. | `400` decisión/motivo inválidos; `409` reporte ya revisado; `401`/`403`; `500`. |
| `GET /api/health/nursing` | Administrador, dueño, veterinario | Sin parámetros. | `200`: `{ "data": [<animal activo en enfermería>] }`, incluye estado, corral, raza/especie, alerta sanitaria y si espera traslado tras el alta. | `500` lectura fallida; `401`/`403`. |
| `GET /api/health/animals/:id/records` | Administrador, dueño, veterinario | Ruta `id`. El animal debe seguir activo y estar en enfermería. | `200`: `{ "data": [<registro cronológico>] }`; cada registro puede incluir `id_registro`, `id_animal`, `fecha`, `tipo`, `detalle`, `foto`, autor y marca de creación. | `400` ID inválido; `404` animal no está en enfermería; `401`/`403`; `500`. |
| `POST /api/health/animals/:id/records` | Veterinario | Ruta `id`. JSON: `fecha`, `tipo` (`tratamiento` o `nota`), `detalle` (1–5000 caracteres), opcional `foto` JPEG/PNG/WebP data URL máx. 1,5 MB. | `201`: `{ "data": { "id_registro": 789 } }`. | `400` validación/foto; `409` animal no activo en enfermería; `401`/`403`; `500`. |
| `PATCH /api/health/animals/:id/status` | Veterinario | Ruta `id`. JSON: `estado_salud` (`enfermo` o `herido`); opcional `observaciones` (máx. 450). | `200`: `{ "message": "diagnóstico actualizado y notificado" }` o mensaje de que el estado ya estaba actualizado. | `400` estado/ID inválidos; `409` animal ya no está en enfermería; `401`/`403`; `500`. |
| `POST /api/health/animals/:id/discharge` | Veterinario | Ruta `id`; JSON opcional `observaciones` (máx. 500). | `201`: `{ "message": "alta registrada; enfermería queda pendiente del traslado del peón" }`. El alta no mueve físicamente al animal. | `400` ID inválido; `409` animal no activo en enfermería o ya tiene alta pendiente; `401`/`403`; `500`. |

## Usuarios, solicitudes de acceso y catálogo

| Método y ruta | Roles | Parámetros y cuerpo | Éxito | Errores principales |
| --- | --- | --- | --- | --- |
| `GET /api/admin/registration-requests` | Administrador | Sin parámetros. | `200`: `{ "data": [{ "id_solicitud", "nombre", "apellido", "email", "created_at" }] }`. Devuelve solicitudes con correo verificado pendientes de decisión. | `500`; `401`/`403`. |
| `POST /api/admin/registration-requests/:id/approve` | Administrador | Ruta `id`. JSON: `rol` (`dueno`, `peon` o `veterinario`; no se asigna administrador mediante solicitud pública). | `200`: `{ "message": "solicitud aprobada; se envió el código de activación" }`. | `400` ID/rol inválidos, solicitud ya resuelta o perfil no disponible; `401`/`403`; `500` al consultar solicitudes. |
| `POST /api/admin/registration-requests/:id/reject` | Administrador | Ruta `id`; sin cuerpo. | `200`: `{ "message": "solicitud rechazada" }`. | `400` ID inválido, solicitud ya resuelta o error de notificación; `401`/`403`; `500` al consultar solicitudes. |
| `GET /api/organization/users` | Administrador, dueño | Sin parámetros. | `200`: `{ "data": [{ "id_usuario", "nombre", "apellido", "email", "activo", "rol" }] }`. | `500`; `401`/`403`. |
| `PUT /api/organization/users/:id` | Administrador | Ruta `id`. JSON: `nombre`, `apellido`, `rol` (`administrador`, `dueno`, `peon`, `veterinario`). | `200`: `{ "message": "usuario actualizado" }`. Cambiar rol incrementa la versión del token e invalida sesiones previas. | `400` datos/rol inválidos; `404` usuario activo ausente; `409` se intentó quitar el último administrador o perfil no disponible; `401`/`403`; `500`. |
| `DELETE /api/organization/users/:id` | Administrador | Ruta `id`. JSON opcional: `id_responsable_reasignacion` (peón activo) si la persona tiene tareas abiertas. No permite darse de baja a sí mismo. | `200`: `{ "message": "acceso bloqueado; se conserva la autoría histórica" }`. | `400` ID o reasignación inválidos; `404` usuario activo ausente; `409` último administrador, tareas abiertas sin reasignar o reemplazo inválido; `401`/`403`; `500`. |
| `GET /api/organization/catalog` | Administrador, dueño, peón | Sin parámetros. | `200`: `{ "data": { "especies": [...], "razas": [...], "pendientes": [...] } }`. Las solicitudes incluidas tienen estado pendiente. | `500`; `401`/`403`. |
| `POST /api/organization/catalog/species` | Dueño | JSON: `nombre` (1–80 caracteres). | `201`: `{ "data": { "id_especie": 5, "nombre": "Bovina" } }`. | `400` nombre inválido; `409` nombre duplicado/u otro conflicto; `401`/`403`. |
| `POST /api/organization/catalog/species/:id/breeds` | Dueño | Ruta `id` de especie. JSON: `nombre` (1–80 caracteres). | `201`: `{ "data": { "id_raza": 8, "id_especie": 5, "nombre": "Hereford" } }`. | `400` datos inválidos; `404` especie inexistente; `409` raza duplicada/u otro conflicto; `401`/`403`. |
| `DELETE /api/organization/catalog/breeds/:id` | Dueño | Ruta `id`; sin cuerpo. Solo si no hay animales asociados. | `200`: `{ "message": "raza borrada permanentemente" }`. | `400` ID inválido; `404` raza ausente; `409` hay animales/dependencias asociadas; `401`/`403`. |
| `DELETE /api/organization/catalog/species/:id` | Dueño | Ruta `id`; sin cuerpo. Borra también las razas sin uso. | `200`: `{ "message": "especie y sus razas borradas permanentemente" }`. | `400` ID inválido; `404` especie ausente; `409` hay animales o dependencias; `401`/`403`. |
| `POST /api/organization/catalog/requests` | Peón | JSON: `tipo` (`especie` o `raza`), `nombre` (hasta 80); si `raza`, `id_especie`. | `201`: `{ "message": "solicitud enviada al administrador" }`. | `400` faltan campos o son inválidos; `409` no se pudo registrar; `401`/`403`. |
| `PATCH /api/organization/catalog/requests/:id` | Dueño | Ruta `id`. JSON: `decision` (`aprobar` o `rechazar`). | `200`: `{ "message": "elemento agregado al catálogo" }` o `{ "message": "solicitud rechazada" }`. | `400` decisión/ID inválidos; `409` solicitud ya revisada o conflicto; `401`/`403`. |

## Tareas, reproducción, eventos y tablero

| Método y ruta | Roles | Parámetros y cuerpo | Éxito | Errores principales |
| --- | --- | --- | --- | --- |
| `GET /api/tasks` | Administrador, peón | Sin parámetros. El peón ve sus tareas; administrador ve todas. | `200`: `{ "data": [{ "id_tarea", "titulo", "descripcion", "id_responsable", "fecha_vencimiento", "estado", "responsable", "apellido_responsable" }] }`. | `500`; `401`/`403`. |
| `POST /api/tasks` | Administrador | JSON: `titulo` (1–150), `id_responsable` de un peón activo, opcionales `descripcion`, `fecha_vencimiento` (`YYYY-MM-DD`). Enviar `id_responsable`: si se omite, el controlador usa el ID del administrador y la validación de responsable lo rechaza. | `201`: `{ "data": { "id_tarea": 456 } }`. | `400` campos inválidos o responsable no es peón activo; `409` conflicto al guardar; `401`/`403`. |
| `PATCH /api/tasks/:id` | Administrador o responsable de la tarea | Ruta `id`. JSON: `estado` (`pendiente`, `en_progreso`, `completada`, `cancelada`). Esta ruta solo cambia el estado. | `200`: `{ "message": "tarea actualizada" }`. | `400` estado inválido; `404` tarea inexistente/no asignada al usuario; `401`/`403`; `500`. |
| `GET /api/reproduction` | Administrador, dueño, peón | Sin parámetros. Devuelve hasta 200 servicios y 200 nacimientos recientes. | `200`: `{ "data": { "servicios": [...], "nacimientos": [...], "usuario": 12 } }`. Servicios incluyen método/estado, progenitores, observaciones, marca de preñez y fecha estimada; nacimientos incluyen cría, progenitores y observaciones. | `500`; `401`/`403`. |
| `POST /api/reproduction/mating-services` | Dueño, peón | JSON: `id_madre` activa hembra, `fecha`, `metodo` (hasta 60), y padre `id_padre` macho activo de la misma especie **o** `padre_texto`; opcional `observaciones`. Madre y padre no pueden ser el mismo animal. | `201`: `{ "data": { "id_servicio": 91 } }`. | `400` datos incompletos/inválidos; `409` progenitores incompatibles/inactivos u otro conflicto; `401`/`403`. |
| `POST /api/reproduction/mating-services/:id/confirm-pregnancy` | Dueño, peón | Ruta `id`; sin cuerpo. | `200`: `{ "data": { "fecha_estimada_nacimiento": "2027-07-01" } }`. Si ya estaba confirmada agrega `"ya_confirmada": true`. La estimación depende de la especie configurada. | `400` ID inválido o especie sin duración configurada; `404` servicio ausente; `401`/`403`; `500`. |
| `POST /api/reproduction/births` | Dueño, peón | JSON: `identificador`, `id_raza`, `id_corral`, `fecha`, madre como `id_madre` o `madre_texto`, padre como `id_padre` o `padre_texto`; opcionales `nombre`, `observaciones`, `genero`, `foto`. Progenitores registrados deben coincidir en género y especie. | `201`: `{ "data": { "id_animal": 234 } }`. Crea ficha de cría y registro de nacimiento en la misma transacción. | `400` datos incompletos/foto inválida; `409` progenitores, raza/corral/capacidad o identificador conflictivos; `401`/`403`. |
| `DELETE /api/reproduction/mating-services/:id` | Dueño | Ruta `id`; sin cuerpo. Borrado permanente con auditoría. | `200`: `{ "message": "servicio reproductivo borrado" }`. | `400` ID inválido; `404` servicio inexistente; `401`/`403`; `500`. |
| `DELETE /api/reproduction/births/:id` | Dueño | Ruta `id`; sin cuerpo. Borra el evento, conserva la ficha animal. | `200`: `{ "message": "registro de nacimiento borrado; la ficha de la cría se conservó" }`. | `400` ID inválido; `404` nacimiento inexistente; `401`/`403`; `500`. |
| `GET /api/events` | Administrador, dueño | Query opcional `todos=1`; si se omite, filtra eventos a especies/razas activas de la estancia. | `200`: `{ "data": { "eventos": [...], "especies": [...], "razas": [...], "provincias": [...], "total_nacional": 12, "fuentes": [...] } }`. Incluye eventos de los últimos 180 días dentro de los límites de consulta configurados. | `500`; `401`/`403`. |
| `GET /api/dashboard` | Administrador, dueño | Sin parámetros. | `200`: `{ "data": { "crias_ano", "servicios_90_dias", "muertes_pendientes", "muertes_ano", "ventas_ano", "alertas_sanitarias", "hembras_prenadas" } }`. | `500`; `401`/`403`. |

## Notificaciones

| Método y ruta | Roles | Parámetros y cuerpo | Éxito | Errores principales |
| --- | --- | --- | --- | --- |
| `GET /api/notifications` | Todos los roles activos | Query opcional `before` (ID entero positivo para paginar hacia atrás). | `200`: `{ "data": [<hasta 10 avisos>], "hasMore": true }`. Cada aviso contiene `id_notificacion`, `id_animal`, `titulo`, `mensaje`, `tipo`, `leida`, `estado_respuesta`, `created_at`. | `400` cursor inválido; `401`/`403`; `500`. |
| `PATCH /api/notifications/:id` | Todos los roles activos | Ruta `id`. JSON: `action`=`read`, `delete`, `accept` o `reject`. `accept/reject` solo para tipos de notificación de solicitud. | `200`: `{ "message": "notificación actualizada" }`. Lectura/borrado se guarda por usuario; una decisión actualiza la notificación compartida. | `400` acción inválida o tipo incompatible; `404` aviso no visible; `401`/`403`; `500`. |

## Sincronización offline

| Método y ruta | Roles | Parámetros y cuerpo | Éxito | Errores principales |
| --- | --- | --- | --- | --- |
| `POST /api/sync/operations` | Administrador, dueño, peón, veterinario; cada tipo restringido a su perfil | JSON: `operaciones`, arreglo de 1 a 50 elementos. Cada elemento: `id_operacion` UUID v4, `tipo_operacion`, `entidad`=`animal`, `payload`. Tipos: `pesaje`, `movimiento`, `reporte_sanitario`, `reporte_muerte`, `nota_veterinaria`. | `200`: `{ "data": [{ "id_operacion": "...", "estado": "aplicada" \| "repetida" \| "rechazada", "data": { "id_entidad": 456 }, "mensaje": "..." }] }`. Cada operación se procesa en su propia transacción; los rechazos no anulan los éxitos del lote. | `400` lote vacío o de más de 50 operaciones; `401`/`403` para sesión. Los errores de cada elemento se expresan dentro del resultado con `estado: rechazada` y `mensaje`, no cambian el estado HTTP del lote. |

Campos de `payload` por tipo:

| `tipo_operacion` | Perfil | Campos principales de `payload` |
| --- | --- | --- |
| `pesaje` | Peón | `id_animal`, `peso_kg` positivo, `fecha`. |
| `movimiento` | Peón | `id_animal`, `id_corral_destino`, opcional `observaciones`. Para salir de enfermería exige alta veterinaria pendiente. |
| `reporte_sanitario` | Peón | `id_animal`, `fecha`, `id_corral_destino` de enfermería activo, opcional `motivo`. |
| `reporte_muerte` | Peón | `id_animal`, `fecha`, `latitud`, `longitud` válidas; opcionales `motivo`, `foto`. La baja queda operativa y la revisión administrativa pendiente. |
| `nota_veterinaria` | Veterinario | `id_animal`, `fecha`, `tipo` (`tratamiento` o `nota`), `detalle`, opcional `foto`; el animal debe estar activo en enfermería. |

Un mismo UUID enviado otra vez por el mismo usuario devuelve `repetida` y el resultado original. Un UUID perteneciente a otro usuario se rechaza. Los elementos rechazados permanecen en la cola local para corrección o descarte explícito.

## Ejemplos de intercambio

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{ "email": "persona@example.com", "password": "contraseña-de-ejemplo" }
```

Respuesta `200`: objeto de sesión de la sección de autenticación. Respuesta `401`:

```json
{ "message": "correo o contraseña incorrectos" }
```

### Crear animal

```http
POST /api/animals
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "identificador": "A-001",
  "id_raza": 8,
  "id_corral": 23,
  "nombre": "Luna",
  "genero": "hembra",
  "fecha_nacimiento": "2025-02-10",
  "peso_kg": 185.5
}
```

Respuesta `201`:

```json
{ "data": { "id_animal": 123, "identificador": "A-001" } }
```

### Actualizar notificación

```http
PATCH /api/notifications/88
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{ "action": "read" }
```

Respuesta `200`:

```json
{ "message": "notificación actualizada" }
```

## Seguridad y límites

- No incluyas contraseñas, secretos OAuth, secretos JWT ni tokens reales en ejemplos, capturas o repositorios.
- El servidor valida los roles en cada ruta protegida; los permisos visuales del frontend no sustituyen esta validación.
- Los códigos de verificación, activación y recuperación tienen vencimiento y límites de uso; el código de recuperación vence a los 10 minutos y el permiso temporal de cambio a los 15. La solicitud de recuperación responde de forma neutra para evitar enumerar cuentas.
- La app no rastrea continuamente animales. La ubicación GPS solo se exige para informar una muerte.
- El tamaño JSON general está limitado a 5 MB por Express; las fotos admitidas por operaciones están limitadas a 1,5 MB y tipos JPEG, PNG o WebP.
- Los métodos mantienen semántica REST: `GET` consulta; `POST` crea/ejecuta; `PUT` reemplaza datos editables; `PATCH` aplica una actualización parcial; `DELETE` elimina o da de baja según la ruta.
