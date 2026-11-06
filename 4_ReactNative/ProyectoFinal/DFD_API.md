# DFD de EstanciaApp

## Nivel 0 · Contexto

```mermaid
flowchart LR
    U["Usuarios<br/>Solicitante, dueño, administrador, peón y veterinario"]
    A(("0 · EstanciaApp<br/>App móvil y web + API"))
    O["Google, Facebook y GitHub"]
    M["Proveedor de correo<br/>Gmail API o SMTP"]
    F["Sitios públicos de asociaciones"]
    U -->|"Credenciales, códigos, consultas y datos de campo"| A
    A -->|"Sesión, estados, listados, alertas y resultados"| U
    A -->|"Intercambio o validación de credenciales OAuth"| O
    O -->|"Identidad y datos de perfil"| A
    A -->|"Códigos y avisos de cuenta"| M
    M -->|"Correos de verificación, acceso, recuperación y avisos"| U
    A -->|"Consulta de agendas"| F
    F -->|"Datos públicos de eventos"| A
```

## Nivel 1 · Solicitudes, servidor y almacenamiento

Los archivos de rutas, controladores, servicios y middleware de Express están en `backend/src/`. Los servicios de la aplicación están en `frontend/src/services/`.

```mermaid
flowchart TB
    U["Usuario"]
    UI(["1.0 · Aplicación Expo móvil/web<br/>frontend/src/app/ · SessionContext.tsx"])
    C(["1.1 · Cliente HTTP<br/>config/api.ts · services/apiErrors.ts<br/>authApi.ts · adminApi.ts · organizationApi.ts<br/>livestockApi.ts · productionApi.ts · modulesApi.ts"])
    OQ(["1.2 · Operación sin conexión<br/>offlineSync.ts"])
    L[("D1 · Caché y cola local<br/>offlineDatabase.ts: SQLite<br/>offlineDatabase.web.ts: localStorage")]
    S(["2.0 · Servidor HTTP Node.js / Express<br/>server.ts · app.ts · config/env.ts"])
    K(["2.1 · Rutas y controles de acceso<br/>routes/*.ts · authMiddleware.ts · roleMiddleware.ts<br/>adminMiddleware.ts · asyncHandler.ts"])
    A(["3.1 · Cuenta y sesión<br/>authRoutes.ts · authController.ts<br/>authService.ts · registrationService.ts<br/>registrationCodeService.ts · jwt.ts"])
    B(["3.2 · Solicitudes de alta<br/>adminRoutes.ts · adminController.ts<br/>registrationService.ts"])
    G(["3.3 · Ganado y operación de campo<br/>livestockRoutes.ts · livestockController.ts<br/>fieldRoutes.ts · fieldController.ts"])
    T(["3.4 · Equipo y catálogo<br/>organizationRoutes.ts · organizationController.ts"])
    P(["3.5 · Tareas, reproducción y eventos<br/>modulesRoutes.ts · modulesController.ts"])
    Y(["3.6 · Sincronización<br/>syncRoutes.ts · syncController.ts"])
    Q(["4.0 · Acceso SQL<br/>config/database.ts · mysql2"])
    D[("D2 · MySQL<br/>Usuarios, animales, corrales, tratamientos,<br/>tareas, eventos y operaciones de sincronización")]
    E(["5.0 · Envío de correo<br/>emailService.ts"])
    M["Gmail API o SMTP"]
    X["Google, Facebook y GitHub"]
    J(["6.0 · Trabajos programados<br/>server.ts · modulesController.ts · eventSources.ts"])
    F["Sitios públicos de asociaciones"]

    U -->|"Acciones y datos"| UI
    UI -->|"Pantallas, listados y resultados"| U
    UI -->|"Consultas y cambios"| C
    C -->|"Datos o error"| UI
    UI -->|"Lecturas y cambios compatibles"| OQ
    OQ -->|"Datos locales y estado de la cola"| UI
    OQ -->|"Guarda caché y pendientes"| L
    L -->|"Datos cacheados y operaciones pendientes"| OQ
    C -->|"HTTP /api · JSON y Bearer según la ruta"| S
    OQ -->|"POST /api/sync/operations · lote y Bearer"| S
    S -->|"Resultado del lote"| OQ
    S -->|"Estado HTTP y JSON · redirección en callback OAuth"| C
    S -->|"Método, ruta, cabeceras y cuerpo"| K
    K <-->|"Credenciales, códigos y perfil"| A
    K <-->|"Aprobación, rechazo y consulta de altas"| B
    K <-->|"Animales, corrales, sanidad y reportes"| G
    K <-->|"Usuarios, especies y razas"| T
    K <-->|"Tareas, nacimientos y calendario"| P
    K <-->|"Operaciones de campo en lote"| Y
    A <-->|"Datos y resultados SQL"| Q
    B <-->|"Datos y resultados SQL"| Q
    G <-->|"Datos y resultados SQL"| Q
    T <-->|"Datos y resultados SQL"| Q
    P <-->|"Datos y resultados SQL"| Q
    Y <-->|"Datos y resultados SQL"| Q
    Q -->|"Consultas y transacciones SQL"| D
    D -->|"Filas y resultados de escritura"| Q
    K <-->|"Verificación de cuenta y versión del token"| Q
    K -->|"Resultado o error para responder al cliente"| S
    A <-->|"Tokens y perfil OAuth"| X
    A -->|"Verificación, recuperación y acceso"| E
    B -->|"Avisos y códigos de alta"| E
    E -->|"Mensaje de correo"| M
    J -->|"Recordatorios y eventos importados"| Q
    J -->|"Consulta de agendas"| F
    F -->|"Contenido público de eventos"| J
```

- `backend/src/server.ts` inicia Express en el puerto configurado. En el arranque y luego periódicamente, genera recordatorios de nacimiento cada hora y consulta agendas externas cada siete días.
- `backend/src/app.ts` configura CORS, recibe JSON de hasta 5 MB, monta las rutas y concentra los errores que llegan al manejador global. `GET /api/health` devuelve el estado del proceso desde este archivo.
- En las rutas protegidas, `authMiddleware.ts` valida el token de acceso, consulta el estado de la cuenta y la versión del token en MySQL. Se aplican los permisos de `roleMiddleware.ts` o `adminMiddleware.ts` según la ruta. Las operaciones asincrónicas envueltas en `asyncHandler.ts` propagan fallas a Express.
- `backend/src/controllers/livestockController.ts` reúne `livestockController.animals.ts`, `livestockController.corrals.ts`, `livestockController.movements.ts`, `livestockController.nursing.ts` y `livestockController.notifications.ts`. Estos módulos comparten lógica en `livestockController.shared.ts`.
- En despliegue, `render.yaml` configura el servicio y su chequeo HTTP. `backend/package.json` define el inicio de `dist/server.js` y la ejecución de las migraciones mediante `backend/src/scripts/migrate.ts`.

## Nivel 2 · Ejemplo de ida y vuelta con un pesaje

```mermaid
sequenceDiagram
    actor P as Peón
    participant F as AnimalWeightModal.tsx + productionApi.ts
    participant O as offlineSync.ts
    participant L as offlineDatabase.ts / offlineDatabase.web.ts
    participant S as server.ts + app.ts
    participant R as syncRoutes.ts + middleware de acceso
    participant C as syncController.ts
    participant D as config/database.ts → MySQL
    P->>F: Carga animal, peso y fecha
    F->>O: recordWeight envía la operación pesaje
    O->>L: Guarda la operación con un ID único
    opt Sin conexión
        O-->>F: Devuelve estado pendiente
        F-->>P: Muestra que se guardó en el dispositivo
    end
    O->>S: POST /api/sync/operations con Bearer y lote JSON
    Note over O,S: Intenta el envío al guardar y vuelve a intentarlo si queda pendiente
    S->>R: Enruta el lote
    R->>C: Ejecuta synchronizeOperations tras validar sesión y rol
    C->>D: Comprueba el ID y guarda el pesaje en una transacción
    D-->>C: Resultado de la transacción
    C-->>O: Resultado por operación vía Express
    alt Aplicada o repetida
        O->>L: Retira la operación de la cola
    else Rechazada
        O->>L: Registra el error en la operación pendiente
    end
```

La API también ofrece `POST /api/animals/:id/weights` en `fieldRoutes.ts`. El formulario actual usa la ruta de sincronización tanto con conexión como sin ella.

## Inventario de solicitudes HTTP

Los prefijos están montados en `backend/src/app.ts`. Los parámetros como `:id` se reemplazan por el identificador del recurso.


- `GET /api/health` — `app.ts`

### `authRoutes.ts` → `authController.ts`

- `POST /api/auth/login` → `login`
- `GET /api/auth/social/config` → `socialAuthConfig`
- `GET /api/auth/:provider/callback` → `socialOAuthCallback`
- `POST /api/auth/social/:provider` → `socialLogin`
- `POST /api/auth/refresh` → `refresh`
- `POST /api/auth/register` → `register`
- `POST /api/auth/verify-email` → `verifyRegistrationEmail`
- `POST /api/auth/resend-verification` → `resendRegistrationCode`
- `POST /api/auth/access-code` → `redeemAccessCode`
- `POST /api/auth/resend-access-code` → `resendAccessCode`
- `POST /api/auth/password-recovery/request` → `requestPasswordRecovery`
- `POST /api/auth/password-recovery/redeem` → `redeemPasswordRecoveryCode`
- `POST /api/auth/password-recovery/reset` → `completePasswordRecovery`
- `GET /api/auth/me` → `me`
- `PUT /api/auth/profile` → `updateProfile`
- `PUT /api/auth/password` → `changePassword`

### `adminRoutes.ts` → `adminController.ts`

- `GET /api/admin/registration-requests` → `listRequests`
- `POST /api/admin/registration-requests/:id/approve` → `approveRequest`
- `POST /api/admin/registration-requests/:id/reject` → `rejectRequest`

### `livestockRoutes.ts` → `livestockController.ts`

- `GET /api/animals` → `listAnimals`
- `POST /api/animals` → `createAnimal`
- `GET /api/corrals` → `listCorrals`
- `PUT /api/animals/:id` → `updateAnimal`
- `POST /api/animals/:id/deactivate` → `deactivateAnimal`
- `DELETE /api/animals/:id` → `permanentlyDeleteInactiveAnimal`
- `POST /api/corrals` → `createCorral`
- `PUT /api/corrals/:id` → `updateCorral`
- `DELETE /api/corrals/:id` → `deleteCorral`
- `POST /api/animals/:id/movements` → `moveAnimal`
- `GET /api/health/nursing` → `listNursingAnimals`
- `GET /api/health/animals/:id/records` → `listVeterinaryRecords`
- `POST /api/health/animals/:id/records` → `createVeterinaryRecord`
- `PATCH /api/health/animals/:id/status` → `updateNursingHealthStatus`
- `POST /api/health/animals/:id/discharge` → `dischargeNursingAnimal`
- `GET /api/notifications` → `listNotifications`
- `PATCH /api/notifications/:id` → `updateNotification`

### `fieldRoutes.ts` → `fieldController.ts`

- `GET /api/dashboard` → `dashboard`
- `POST /api/animals/:id/weights` → `createWeight`
- `POST /api/reports/:kind` → `createReport`
- `GET /api/deaths` → `reviewDeaths`
- `PATCH /api/deaths/:id/review` → `reviewDeaths`

### `organizationRoutes.ts` → `organizationController.ts`

- `GET /api/organization/users` → `listUsers`
- `PUT /api/organization/users/:id` → `updateUser`
- `DELETE /api/organization/users/:id` → `deactivateUser`
- `GET /api/organization/catalog` → `listCatalog`
- `POST /api/organization/catalog/species` → `createSpecies`
- `POST /api/organization/catalog/species/:id/breeds` → `createBreed`
- `DELETE /api/organization/catalog/species/:id` → `deleteSpecies`
- `DELETE /api/organization/catalog/breeds/:id` → `deleteBreed`
- `POST /api/organization/catalog/requests` → `requestCatalog`
- `PATCH /api/organization/catalog/requests/:id` → `reviewCatalog`

### `modulesRoutes.ts` → `modulesController.ts`

- `GET /api/tasks` → `listTasks`
- `POST /api/tasks` → `createTask`
- `PATCH /api/tasks/:id` → `updateTask`
- `GET /api/reproduction` → `listReproduction`
- `POST /api/reproduction/mating-services` → `createMatingService`
- `POST /api/reproduction/mating-services/:id/confirm-pregnancy` → `confirmPregnancy`
- `POST /api/reproduction/births` → `createBirth`
- `DELETE /api/reproduction/mating-services/:id` → `deleteMatingService`
- `DELETE /api/reproduction/births/:id` → `deleteBirthRecord`
- `GET /api/events` → `listEvents`

### `syncRoutes.ts` → `syncController.ts`

- `POST /api/sync/operations` → `synchronizeOperations`

