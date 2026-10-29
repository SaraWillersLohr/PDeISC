# EstanciaApp

EstanciaApp es una aplicación multiplataforma para registrar y consultar la operación de una estancia ganadera. El frontend se construyó con React Native, Expo y TypeScript; el backend usa Node.js, Express y TypeScript; MariaDB/MySQL almacena los datos.

Este archivo explica la arquitectura, los roles, la instalación, la configuración y el uso de la API. La relación requisito por requisito con la consigna, incluidos los archivos de implementación y el estado de verificación, está en [README_CUMPLIMIENTO_CONSIGNA.md](README_CUMPLIMIENTO_CONSIGNA.md). La referencia de API y uso está en [DOCUMENTACION_API.md](DOCUMENTACION_API.md), [MANUAL_USUARIO.md](MANUAL_USUARIO.md) y [GUIA_INSTALACION_APK.md](GUIA_INSTALACION_APK.md).

## Estado de los entregables

- El código fuente del cliente y del servidor está organizado en `frontend/` y `backend/`.
- La especificación inicial de base y algunos datos de ejemplo están en `bd_final.sql`.
- Las migraciones operativas están en `backend/migrations/`.
- La aplicación está preparada para generar un APK interno con EAS y ya tiene definido `android.package` en `frontend/app.json`. Esta copia del proyecto no contiene un APK generado: el último intento de build informado falló durante la compresión del proyecto, antes de iniciar la compilación.
- Las credenciales de correo y OAuth son configuración del despliegue. Los archivos `.env.example` contienen nombres y ejemplos; deben reemplazarse por valores propios.

## Qué resuelve

La app permite llevar el inventario de animales y corrales, registrar pesajes y traslados, atender alertas sanitarias, gestionar enfermería, asignar tareas, registrar servicios reproductivos y nacimientos, consultar eventos del sector y administrar usuarios según permisos. Cuando la conexión se interrumpe, ciertas operaciones de campo se guardan en el dispositivo y se reintentan al volver la red.

La base de una instalación representa una estancia. La aplicación no implementa un selector multiempresa ni separa varias estancias dentro de la misma base.

## Tecnologías y estructura

```text
ProyectoFinal/
├── backend/
│   ├── migrations/       Cambios aditivos del esquema
│   └── src/
│       ├── config/       Variables de entorno y conexión a MariaDB
│       ├── controllers/  Reglas de negocio y respuestas HTTP
│       ├── middleware/   Autenticación, permisos y errores asíncronos
│       ├── routes/       Rutas REST protegidas por perfil
│       ├── scripts/      Aplicación de migraciones
│       ├── services/     Autenticación, correo y fuentes de eventos
│       ├── types/        Tipos compartidos con Express y servicios
│       └── utils/        Firma y validación de tokens
├── frontend/
│   ├── src/app/          Rutas y pantallas de Expo Router
│   ├── src/components/   Componentes reutilizables y módulos visuales
│   ├── src/context/      Sesión y tema global
│   ├── src/services/     Clientes REST, persistencia y sincronización
│   ├── assets/           Marca e imágenes
│   ├── app.json          Configuración Expo y plugins nativos
│   └── eas.json          Perfiles APK interno y AAB de producción
├── bd_final.sql          Esquema inicial y filas de muestra
├── DOCUMENTACION_API.md  Inventario de rutas, roles y métodos
├── MANUAL_USUARIO.md     Guía de operación por rol
└── GUIA_INSTALACION_APK.md
```

Los comentarios del código están en español y explican la responsabilidad de los módulos, las decisiones de flujo y las reglas que no conviene inferir solo por el nombre de una función. Las validaciones se hacen en el servidor aunque la interfaz también valide formularios.

## Roles y permisos

| Rol | Uso principal |
| --- | --- |
| `administrador` | Administra accesos y cuentas, asigna roles, revisa muertes notificadas por el peón, asigna tareas y consulta datos de la estancia. |
| `dueno` | Administra animales, corrales y catálogos; consulta el tablero, usuarios, producción y agenda. |
| `peon` | Opera animales y corrales, registra pesajes, traslados, reportes sanitarios y muertes; puede trabajar offline en operaciones habilitadas. |
| `veterinario` | Consulta animales en enfermería, registra evolución y diagnóstico, y da el alta clínica. |

El middleware del backend valida el JWT y el rol vigente en la base antes de ejecutar una ruta. Ocultar una opción en la app no reemplaza el control del endpoint.

## Funciones implementadas

- Registro de solicitud de acceso con verificación de correo, aprobación administrativa y activación por código temporal.
- Inicio de sesión con correo/contraseña y OAuth con Google, Facebook o GitHub. El servidor valida la credencial con el proveedor; el acceso social requiere una cuenta existente, activa y verificada.
- Tokens JWT de acceso y renovación; restauración de sesión persistida; recuperación y cambio de contraseña.
- Inventario de animales con búsqueda, filtros, ficha, peso, historial, estado sanitario, baja lógica y edición condicionada por versión.
- Gestión de corrales con capacidad, ocupación, alta, edición y baja lógica bajo permisos.
- Traslados con validación de capacidad y registro de origen, destino, usuario y fecha.
- Flujo veterinario: el alta cambia el estado sanitario a `sano`, mantiene el animal en enfermería y notifica al peón; el peón registra luego el traslado físico. Un animal no puede salir de enfermería si no hay un alta veterinaria pendiente.
- Reportes sanitarios y de muerte. La muerte informada por el peón requiere GPS y queda sujeta a revisión administrativa; rechazarla reactiva al animal. La baja conserva ficha e historial.
- Tratamientos, notas, diagnóstico, historial de salud y notificaciones internas con eliminación por usuario.
- Tareas asignables y seguimiento de estado.
- Reproducción: servicios de monta, confirmación de preñez, fecha estimada de parto y registro de nacimientos con progenitores registrados o consignados como texto.
- Catálogo de especies y razas con propuestas del peón y revisión administrativa/del dueño según las rutas habilitadas.
- Agenda de eventos de fuentes configuradas, agenda de lectura para las especies activas y filtros por los datos publicados.
- Interfaz adaptable a teléfono y escritorio, navegación con Expo Router, tema claro/oscuro y mensajes de error legibles.
- Cola offline con identificador UUID, persistencia local y procesamiento idempotente en el servidor para pesajes, movimientos, reportes sanitarios, muertes y notas veterinarias.

La modalidad offline no equivale a replicar toda la base localmente. Las lecturas usan cachés disponibles y solo los tipos de escritura documentados se encolan.

## Requisitos previos

- Node.js compatible con las dependencias del proyecto y npm.
- MariaDB o MySQL compatible con el esquema de `bd_final.sql`.
- Acceso a un servicio SMTP para verificación, recuperación y activación de cuentas.
- Para OAuth, aplicaciones registradas en Google, Facebook y GitHub y sus URLs de retorno configuradas.
- Para compilar el APK: cuenta/proyecto de Expo EAS y un identificador Android aprobado para la app.

## Instalación local

### 1. Preparar la base de datos

`bd_final.sql` contiene tanto estructura como filas de muestra, incluidas cuentas y operaciones de ejemplo. Importalo únicamente en una base vacía cuando quieras usar esos datos; no lo importes sobre una estancia con información real. Para una instalación productiva, prepará primero una base vacía con el esquema inicial aprobado y cargá solo las migraciones necesarias.

Configurá el backend para conectarse a esa base. En una base existente, hacé una copia de seguridad antes de cualquier migración. La migración `2026-10-22-replace-copropietario-with-administrador.sql` no forma parte del ejecutor automático: si la instalación conserva el rol anterior, aplicala manualmente una sola vez y después corré las migraciones aditivas.

### 2. Configurar y ejecutar el backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Editá `backend/.env` con los valores reales:

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP del backend, por ejemplo `3010`. |
| `FRONTEND_ORIGIN` | Origen o lista separada por coma permitidos por CORS. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a MariaDB/MySQL. |
| `DB_SSL` | `true` cuando el proveedor exige TLS para la conexión a la base. |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Secretos diferentes, aleatorios y largos para tokens. |
| `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | Vencimientos compatibles con la librería JWT, por ejemplo `15m` y `7d`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Entrega de códigos por correo. |
| `VERIFICATION_CODE_SECRET` | Secreto aleatorio para proteger códigos de verificación y activación. |
| `GOOGLE_CLIENT_IDS` | IDs autorizados de Google, separados por coma. |
| `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | Credenciales de la app OAuth de Facebook. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Credenciales de la app OAuth de GitHub. |

Aplicá las migraciones aditivas y levantá el servidor:

```powershell
npm run db:migrate
npm run dev
```

La API local queda en `http://localhost:3010/api`; el endpoint de estado es `GET http://localhost:3010/api/health`. El ejecutor guarda las migraciones aplicadas, toma un bloqueo para evitar ejecuciones concurrentes y no ejecuta el script de limpieza de datos.

### 3. Configurar y ejecutar el frontend

En otra terminal:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
```

Configurá `EXPO_PUBLIC_API_URL` con la URL base de la API. Para un teléfono físico, usá la IP local de la computadora en la misma red, por ejemplo `http://192.168.1.10:3010/api`; `localhost` dentro del teléfono apuntaría al teléfono mismo. Para web o emulador, elegí el host correspondiente.

Completá los IDs públicos de OAuth:

- `EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB`
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID`
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS`

- `EXPO_PUBLIC_FACEBOOK_APP_ID`
- `EXPO_PUBLIC_GITHUB_CLIENT_ID`

En el APK, guardá estos IDs públicos en las variables del entorno `preview` de EAS y volvé a generar e instalar el APK. En desarrollo local, definilos como `EXPO_PUBLIC_*` en `.env.local`. Los secretos nunca van en el frontend.

Los callbacks móviles deben coincidir exactamente con las URLs registradas en cada proveedor:

- Google: `https://estanciaapp-api.onrender.com/api/auth/google/callback`. Usá un cliente OAuth de tipo **Aplicación web**. Configurá su ID en `EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB` y `GOOGLE_CLIENT_IDS` en Render, y su secreto en `GOOGLE_CLIENT_SECRET`.
- Facebook: `https://estanciaapp-api.onrender.com/api/auth/facebook/callback`. Registralo en la lista de **Valid OAuth Redirect URIs** de Facebook Login. Configurá `EXPO_PUBLIC_FACEBOOK_APP_ID` en EAS y `FACEBOOK_APP_ID` y `FACEBOOK_APP_SECRET` en Render.
- GitHub: `https://estanciaapp-api.onrender.com/api/auth/github/callback`. Ponelo como **Authorization callback URL** de la OAuth App. Configurá `EXPO_PUBLIC_GITHUB_CLIENT_ID` en EAS y `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET` en Render.

Si la API está en otro dominio, reemplazá `estanciaapp-api.onrender.com` por el dominio real en las tres consolas, en `EXPO_PUBLIC_SOCIAL_CALLBACK_BASE_URL` de la app y en la URL que usa el backend.

Los secretos OAuth pertenecen exclusivamente al backend. Iniciá Expo:

```powershell
npm run start
```

Atajos disponibles: `npm run android`, `npm run ios` y `npm run web`. Para una app nativa, Expo Go puede no cubrir todos los ajustes de una compilación de distribución; seguí la guía de APK para EAS.

## Variables de entorno y seguridad

No subas archivos `.env`, contraseñas, tokens, claves privadas ni secretos de proveedores al repositorio. Los valores `EXPO_PUBLIC_*` son públicos dentro del cliente compilado: solo deben contener URLs y client IDs, nunca secretos. En producción usá HTTPS, CORS limitado a los orígenes reales, secretos nuevos y conexión TLS a la base si el proveedor la exige.

La contraseña se guarda como hash. Los códigos de acceso y recuperación vencen y tienen controles de uso. La versión de token del usuario permite invalidar sesiones después de acciones de cuenta. La baja de usuarios y animales es lógica cuando así lo requiere la trazabilidad.

## API REST

La raíz local es `http://localhost:3010/api`. Las rutas protegidas reciben `Authorization: Bearer <accessToken>`. El backend envía JSON y normalmente responde `{ "data": ... }` para consultas y `{ "message": ... }` para acciones. Los errores usan `{ "message": "..." }`.

### Autenticación

| Método y ruta | Acceso | Función |
| --- | --- | --- |
| `POST /auth/login` | Público | Iniciar sesión con correo y contraseña. |
| `POST /auth/social/:provider` | Público | Intercambiar código OAuth de `google`, `facebook` o `github`. |
| `POST /auth/refresh` | Token de renovación | Renovar tokens. |
| `POST /auth/register` | Público | Crear solicitud de acceso. |
| `POST /auth/verify-email` | Público | Verificar el correo. |
| `POST /auth/resend-verification` | Público | Reenviar código de verificación. |
| `POST /auth/access-code` | Público | Activar una cuenta aprobada. |
| `POST /auth/resend-access-code` | Público | Reenviar código de activación. |
| `POST /auth/password-recovery/request` | Público | Pedir recuperación con respuesta neutra. |
| `POST /auth/password-recovery/redeem` | Público | Canjear código y obtener permiso temporal. |
| `POST /auth/password-recovery/reset` | Permiso temporal | Cambiar contraseña y abrir sesión. |
| `GET /auth/me` | Autenticado | Consultar usuario actual. |
| `PUT /auth/profile` | Autenticado | Editar nombre, apellido y foto propia. |
| `PUT /auth/password` | Autenticado | Cambiar contraseña con verificación de la actual. |

### Operación ganadera y sanidad

| Método y ruta | Roles | Función |
| --- | --- | --- |
| `GET /animals` | administrador, dueño, peón | Listar animales; `?incluir_inactivos=true` incluye bajas. |
| `POST /animals` | dueño, peón | Crear animal. |
| `PUT /animals/:id` | dueño, peón | Editar ficha; enviar `version_dato` para control de concurrencia. |
| `POST /animals/:id/deactivate` | dueño | Dar de baja con motivo y detalle opcional. |
| `DELETE /animals/:id` | dueño | Eliminar permanentemente una ficha ya inactiva y sus dependencias permitidas. |
| `GET /corrals` | administrador, dueño, peón | Listar corrales y ocupación. |
| `POST /corrals` | dueño | Crear corral. |
| `PUT /corrals/:id` | dueño | Editar corral. |
| `DELETE /corrals/:id` | dueño | Dar de baja corral vacío. |
| `POST /animals/:id/movements` | peón | Trasladar con `id_corral_destino`. |
| `POST /animals/:id/weights` | peón | Crear pesaje con `peso_kg` y `fecha`. |
| `POST /reports/:kind` | peón | Crear reporte `sanitario` o `muerte`; la muerte requiere `latitud` y `longitud`. |
| `GET /deaths` | administrador | Consultar muertes pendientes. |
| `PATCH /deaths/:id/review` | administrador | Revisar con decisión y motivo cuando se rechaza. |
| `GET /health/nursing` | administrador, dueño, veterinario | Consultar animales en enfermería. |
| `GET /health/animals/:id/records` | administrador, dueño, veterinario | Consultar historial clínico. |
| `POST /health/animals/:id/records` | veterinario | Registrar tratamiento o nota. |
| `PATCH /health/animals/:id/status` | veterinario | Actualizar diagnóstico. |
| `POST /health/animals/:id/discharge` | veterinario | Dar el alta, cambiar el estado a sano y avisar al peón sin mover el animal. |
| `GET /notifications` | todos los roles activos | Listar avisos; `before` pagina resultados anteriores. |
| `PATCH /notifications/:id` | todos los roles activos | Leer, borrar por usuario o responder solicitudes compatibles; enviar `action`. |
| `POST /sync/operations` | todos los roles activos | Enviar hasta 50 operaciones con UUID para sincronización idempotente. |

### Organización, tareas y producción

| Método y ruta | Roles | Función |
| --- | --- | --- |
| `GET /organization/users` | administrador, dueño | Consultar equipo. |
| `PUT /organization/users/:id` | administrador | Editar cuenta y rol. |
| `DELETE /organization/users/:id` | administrador | Dar de baja cuenta y opcionalmente reasignar tareas abiertas con `id_responsable_reasignacion`. |
| `GET /organization/catalog` | administrador, dueño, peón | Consultar especies, razas y propuestas. |
| `POST /organization/catalog/species` | dueño | Crear especie. |
| `POST /organization/catalog/species/:id/breeds` | dueño | Crear raza. |
| `DELETE /organization/catalog/species/:id` | dueño | Borrar especie sin animales asociados. |
| `DELETE /organization/catalog/breeds/:id` | dueño | Borrar raza sin animales asociados. |
| `POST /organization/catalog/requests` | peón | Proponer una especie o raza. |
| `PATCH /organization/catalog/requests/:id` | dueño | Aprobar o rechazar propuesta. |
| `GET /tasks` | administrador, peón | Consultar tareas. |
| `POST /tasks` | administrador | Asignar tarea. |
| `PATCH /tasks/:id` | administrador, responsable | Cambiar estado. |
| `GET /reproduction` | administrador, dueño, peón | Consultar servicios y nacimientos. |
| `POST /reproduction/mating-services` | dueño, peón | Registrar servicio reproductivo. |
| `POST /reproduction/mating-services/:id/confirm-pregnancy` | dueño, peón | Confirmar preñez y estimar parto. |
| `POST /reproduction/births` | dueño, peón | Registrar nacimiento y progenitores. |
| `DELETE /reproduction/mating-services/:id` | dueño | Eliminar servicio con auditoría. |
| `DELETE /reproduction/births/:id` | dueño | Eliminar evento de nacimiento sin borrar la ficha de la cría. |
| `GET /events` | administrador, dueño | Consultar eventos; `?todos=1` solicita agenda amplia. |
| `GET /dashboard` | administrador, dueño | Consultar indicadores. |

Los códigos HTTP habituales son `400` para datos inválidos, `401` para credenciales o token inválidos, `403` para falta de permiso, `404` para recurso ausente, `409` para conflicto/regla de negocio, `500` para error interno y `503` cuando la base no está disponible. Consultá [DOCUMENTACION_API.md](DOCUMENTACION_API.md) para la referencia resumida de uso.

### Operaciones offline admitidas

`POST /sync/operations` acepta `pesaje`, `movimiento`, `reporte_sanitario`, `reporte_muerte` y `nota_veterinaria`. Cada elemento devuelve `aplicada`, `repetida` o `rechazada`. Los rechazos se conservan en la cola local para que el usuario pueda corregirlos o descartarlos explícitamente. La muerte queda dada de baja operativamente al sincronizar y pendiente de revisión administrativa.

## Sesión, navegación y almacenamiento local

Expo Router define las pantallas y grupos de navegación en `frontend/src/app/`. `SessionContext` comparte sesión, restauración y sincronización; `ThemeContext` mantiene el tema global. En Android/iOS la sesión se persiste con SecureStore y los datos de operación/cambios pendientes con SQLite. La versión web usa almacenamiento del navegador para la cola/caché y no ofrece el mismo nivel de protección que SecureStore.

Al recuperar internet, NetInfo dispara el envío de operaciones; cada UUID se aplica como máximo una vez en el servidor. Un rechazo de negocio queda visible para que no se pierda en silencio. El usuario puede reintentar o descartar los cambios rechazados desde el aviso de sincronización.

## Base de datos y migraciones

La estructura está normalizada en entidades como usuarios y roles, animales, razas y especies, corrales, movimientos, pesos, reportes, tratamientos, tareas, servicios reproductivos, nacimientos, notificaciones y auditoría. Las claves explícitas (`id_animal`, `id_usuario`, etc.) y las claves foráneas relacionan los registros.

`npm run db:migrate` en `backend/` aplica migraciones aditivas que figuran en `backend/src/scripts/migrate.ts`, registra cada archivo en `schema_migrations` y preserva filas existentes. No ejecutar `2026-10-22-clean-operational-data.sql` como parte de la instalación: es un script de limpieza destructivo y se mantiene fuera del ejecutor automático.

## Relación con la consigna

| Punto solicitado | Cómo responde el proyecto | Estado / observación |
| --- | --- | --- |
| Registro e inicio de sesión | Formularios, solicitud aprobada, recuperación y sesiones JWT. | Implementado; registro requiere SMTP. |
| Tres redes sociales | Google, Facebook y GitHub mediante OAuth. | Implementado en código; necesita credenciales y callbacks de cada proveedor. |
| Mínimo tres perfiles | Administrador, dueño, peón y veterinario. | Implementado; permisos verificados en backend. |
| UI móvil y navegación | React Native/Expo, Expo Router, componentes y shell adaptable. | Implementado; web también está configurada. |
| Consumo REST y manejo de errores | Servicios de frontend por dominio y mensajes legibles. | Implementado para las funciones listadas. |
| Estado global | Context API para sesión y tema. | Implementado. |
| Persistencia de sesión | SecureStore en app nativa y renovación JWT. | Implementado. |
| Backend REST y tokens | Express, access/refresh JWT y rutas protegidas. | Implementado. |
| Base relacional | MariaDB/MySQL, claves y migraciones SQL. | Implementado; hace falta preparar una instancia propia. |
| Documentación API en README | Inventario de rutas incluido arriba y ampliado en `DOCUMENTACION_API.md`. | Implementado. |
| Instalación y manual | Este README, guía de APK y manual por rol. | Documentado. |
| APK descargable | Perfil `preview` de EAS definido. | Pendiente: generar artefacto después de configurar `android.package`, EAS y API productiva. |

La consigna se satisface como aplicación académica en código fuente y configuración. Los servicios externos, la base productiva, la firma y la publicación del APK requieren credenciales y acciones del entorno de entrega; no están incluidos como secretos ni artefactos en el repositorio.

## Comprobaciones de desarrollo

Desde `backend/`:

```powershell
npm run build
```

Desde `frontend/`:

```powershell
npm run lint
npx tsc --noEmit
```

Los scripts del proyecto no definen una suite de pruebas automatizadas. Para una entrega funcional también hay que probar en un dispositivo/emulador el acceso, los permisos de cada rol, la navegación y la sincronización tras perder y recuperar conexión.

## APK Android

El identificador `expo.android.package` ya está definido en `frontend/app.json`. Antes de generar el APK, confirmá que las variables públicas de build en EAS apunten a la API HTTPS y contengan los IDs públicos de OAuth, y que las credenciales privadas permanezcan únicamente en Render. Luego, desde `frontend/`:

```powershell
npx eas-cli@latest build --platform android --profile preview
```

El perfil `preview` produce un APK de distribución interna. `production` produce un AAB. La secuencia detallada está en [GUIA_INSTALACION_APK.md](GUIA_INSTALACION_APK.md).

## Documentación relacionada

- [Cumplimiento de la consigna y archivos de implementación](README_CUMPLIMIENTO_CONSIGNA.md)
- [Descripción funcional del proyecto](DESCRIPCION_PROYECTO.md)
- [Requerimientos del proyecto](REQUERIMIENTOS_PROYECTO.md)
- [Documentación de la API](DOCUMENTACION_API.md)
- [Manual de usuario](MANUAL_USUARIO.md)
- [Guía de instalación del APK](GUIA_INSTALACION_APK.md)
- [Cambios implementados](CAMBIOS_IMPLEMENTADOS.md)
