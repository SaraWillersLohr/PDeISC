# Cumplimiento de la consigna — EstanciaApp

Este documento relaciona cada requisito académico con las partes del proyecto donde se implementa. El estado describe el código fuente y los documentos presentes en el repositorio. La configuración de servicios externos y las pruebas en dispositivos o servidores deben comprobarse en esos entornos.

## 1. Requisitos funcionales

### Registro e inicio de sesión

El flujo de cuenta incluye solicitud de acceso, verificación por correo, aprobación/activación, ingreso con correo y contraseña y recuperación de contraseña. La lógica de autenticación y las consultas a usuarios están en `backend/src/services/authService.ts` y `backend/src/services/registrationService.ts`; los códigos de verificación se gestionan en `backend/src/services/registrationCodeService.ts`. Las rutas HTTP se definen en `backend/src/routes/authRoutes.ts` y sus respuestas en `backend/src/controllers/authController.ts`.

En el cliente, las pantallas de ingreso y solicitud de cuenta están en `frontend/src/app/index.tsx` y `frontend/src/app/register.tsx`. La verificación y recuperación se presentan en `frontend/src/app/verify.tsx`, `frontend/src/app/recover.tsx` y componentes reutilizables como `frontend/src/components/AccountRequestModal.tsx`, `frontend/src/components/AccountActivationModal.tsx` y `frontend/src/components/PasswordRecoveryModal.tsx`.

### Inicio de sesión social

El cliente ofrece Google, Facebook y GitHub desde `frontend/src/components/SocialLoginButton.tsx`. Envía el código OAuth al servicio `frontend/src/services/authApi.ts`. El servidor intercambia y valida la credencial con el proveedor en `backend/src/services/authService.ts`; la ruta de callback que devuelve al esquema móvil `estanciaapp://` está en `backend/src/controllers/authController.ts` y se registra en `backend/src/routes/authRoutes.ts`.

Los identificadores públicos del cliente se leen desde la configuración Expo en `frontend/app.config.ts`. Los secretos de proveedores pertenecen únicamente a la configuración privada del backend (por ejemplo, variables de entorno de Render); no deben guardarse en el repositorio ni incluirse en el APK. Los proveedores requieren que sus aplicaciones OAuth tengan los URI de retorno correctos y que Render tenga sus credenciales actuales. El código contempla los tres proveedores; el funcionamiento real depende de que esas credenciales y URL estén vigentes y se prueben con cada proveedor.

### Roles y permisos

La aplicación contempla cuatro perfiles: `administrador`, `dueno`, `peon` y `veterinario`. La asignación y las reglas de acceso se comprueban en el servidor, no solamente ocultando botones en la app. El middleware general de autenticación está en `backend/src/middleware/authMiddleware.ts`; las reglas de roles están en `backend/src/middleware/roleMiddleware.ts` y `backend/src/middleware/adminMiddleware.ts`.

Las pantallas y operaciones se separan por módulos y perfil. Por ejemplo, `backend/src/routes/livestockRoutes.ts`, `backend/src/routes/fieldRoutes.ts`, `backend/src/routes/modulesRoutes.ts` y `backend/src/routes/adminRoutes.ts` declaran qué perfiles pueden acceder a cada endpoint. En el cliente, las rutas y pantallas se organizan bajo `frontend/src/app/` y `frontend/src/components/app/`.

### Interfaz y navegación

La interfaz está hecha con React Native, Expo y TypeScript. Expo Router organiza las pantallas en `frontend/src/app/`; los archivos `_layout.tsx` definen los contenedores de navegación y la protección de rutas. Los componentes de pantalla se encuentran en `frontend/src/components/app/` y los reutilizables generales en `frontend/src/components/`.

Varias pantallas adaptan su distribución al ancho disponible mediante `useWindowDimensions`, por ejemplo `frontend/src/components/app/Screens.dashboard.tsx`, `frontend/src/components/app/Screens.profile.tsx` y `frontend/src/components/app/OwnerDesktopShell.tsx`. Los textos de error y controles accesibles se implementan junto a los formularios y controles que los utilizan.

### API y operaciones de datos

El backend expone una API REST con Express. Las rutas están en `backend/src/routes/`, los controladores en `backend/src/controllers/` y el acceso a datos/reglas de negocio en `backend/src/services/` y los controladores especializados. Hay operaciones de consulta, alta, actualización y baja para las entidades que usa la estancia, como animales, corrales, usuarios, tareas y registros productivos. La referencia de endpoints, métodos, permisos y respuestas está en `DOCUMENTACION_API.md`.

El cliente centraliza las llamadas en `frontend/src/services/`: `authApi.ts`, `livestockApi.ts`, `organizationApi.ts`, `modulesApi.ts`, `productionApi.ts` y `adminApi.ts`. La URL de API se resuelve en `frontend/src/config/api.ts`. La presentación de errores comunes se concentra en `frontend/src/services/apiErrors.ts`; el backend normaliza errores asíncronos con `backend/src/middleware/asyncHandler.ts` y respuestas de error en los controladores.

## 2. Requisitos técnicos del frontend

### Navegación

Se usa Expo Router, basado en rutas y layouts, con pantallas dentro de `frontend/src/app/`. El layout raíz está en `frontend/src/app/_layout.tsx`; el grupo de pantallas autenticadas tiene su propio `frontend/src/app/(app)/_layout.tsx`.

### Estado global

La sesión y el estado de restauración se comparten con Context API desde `frontend/src/context/SessionContext.tsx`. El tema global está en `frontend/src/context/ThemeContext.tsx`. El layout raíz conecta estos proveedores con las pantallas.

### Persistencia y renovación de sesión

`frontend/src/services/sessionStorage.ts` guarda la sesión con Expo SecureStore en Android/iOS y recupera o elimina sus datos. `frontend/src/context/SessionContext.tsx` restaura la sesión al iniciar, solicita renovación de tokens y cierra la sesión si el servidor rechaza la renovación. Las llamadas de autenticación y renovación están en `frontend/src/services/authApi.ts`; la firma y validación JWT del backend están en `backend/src/utils/jwt.ts`.

### Operación sin conexión

Para operaciones de campo habilitadas, la app mantiene registros locales y una cola de sincronización. El almacenamiento nativo/web está en `frontend/src/services/offlineDatabase.ts` y `frontend/src/services/offlineDatabase.web.ts`; el envío y reintento está en `frontend/src/services/offlineSync.ts`. El servidor recibe operaciones en `backend/src/routes/syncRoutes.ts` y `backend/src/controllers/syncController.ts`. Las migraciones relacionadas se encuentran en `backend/migrations/`.

### Validación y errores

Los formularios realizan validaciones de entrada y comunican errores mediante los componentes y servicios de `frontend/src/`. `frontend/src/services/apiErrors.ts` convierte respuestas del servidor en mensajes utilizables por la interfaz. El backend valida las solicitudes en sus controladores/servicios y aplica autenticación y permisos mediante middleware. Los códigos HTTP habituales y su significado están documentados en `DOCUMENTACION_API.md`.

## 3. Requisitos técnicos del backend

### API REST y JWT

El servidor Node.js/Express inicia desde `backend/src/server.ts` y configura rutas en `backend/src/app.ts`. Las rutas de autenticación están en `backend/src/routes/authRoutes.ts`; el login, registro y renovación se implementan en `backend/src/controllers/authController.ts` y `backend/src/services/authService.ts`. `backend/src/utils/jwt.ts` crea y verifica tokens de acceso y renovación. Las rutas privadas usan `backend/src/middleware/authMiddleware.ts`.

### Base de datos relacional

La conexión al pool MySQL/MariaDB se configura en `backend/src/config/database.ts`. El esquema base se documenta en `bd_final.sql`; los cambios incrementales están en `backend/migrations/` y se aplican mediante `backend/src/scripts/migrate.ts` (`npm run db:migrate` desde `backend/`).

### Autorización por rol

Los endpoints restringidos requieren autenticación y aplican `requireRoles(...)` o middleware administrativo. Las reglas están declaradas junto a las rutas (`backend/src/routes/*.ts`) y se ejecutan en `backend/src/middleware/roleMiddleware.ts`. Así, una solicitud directa a la API también queda sujeta a permisos.

### Documentación de API

`DOCUMENTACION_API.md` describe las rutas disponibles, métodos HTTP, autenticación, roles y respuestas/códigos de error. `README.md` ofrece además instrucciones de instalación y configuración general; `backend/README.md` resume preparación del backend y migraciones.

## 4. Organización, control de versiones y buenas prácticas

El proyecto separa el cliente en `frontend/` y el servidor en `backend/`. Dentro del backend se separan rutas, controladores, servicios, middleware, configuración, tipos y utilidades; el frontend separa pantallas, componentes, contexto y servicios.

El repositorio contiene configuración de Git y documentación de instalación. Los archivos `.env` locales con secretos no forman parte de la configuración que se debe publicar. Para conocer nombres de variables y valores de ejemplo se deben consultar los archivos `.env.example` correspondientes; los valores reales se cargan en cada entorno (por ejemplo, Render o EAS) y no se copian a este documento.

## 5. Entregables

| Entregable | Ubicación/estado |
| --- | --- |
| Código fuente frontend y backend | `frontend/` y `backend/` |
| Guía de instalación y configuración | `README.md`, `backend/README.md` y `GUIA_INSTALACION_APK.md` |
| Documentación de API | `DOCUMENTACION_API.md` |
| Manual de uso | `MANUAL_USUARIO.md` y manuales PDF por perfil en la raíz del proyecto |
| Video de demostración | Opcional; no es requisito obligatorio y no está incluido actualmente |
| APK Android instalable | El perfil está configurado en `frontend/eas.json`, con tipo `apk` en `preview`. El APK debe existir como artefacto de un build EAS exitoso; el código fuente por sí solo no lo sustituye. El intento de build que falló al comprimir el proyecto no produjo APK. |

## Estado de verificación

La implementación de una función en el código no confirma por sí sola que las credenciales externas, el despliegue de Render, la base de datos productiva o cada proveedor OAuth estén funcionando. Google, Facebook y GitHub deben probarse usando sus cuentas y la configuración desplegada. El APK debe descargarse e instalarse para verificar el flujo en Android.

En la última revisión local, `npm run build` del backend y `npx tsc --noEmit` del frontend terminaron correctamente. `npm run lint` del frontend informó un error en `frontend/src/components/PasswordRecoveryModal.tsx` (regla `react-hooks/set-state-in-effect`). El build de EAS compartido durante la revisión falló antes de comenzar la compilación por un error de permisos al procesar un enlace simbólico; por eso no se considera entregado el APK.

Para instalar/configurar y ejecutar el proyecto, seguir `README.md` y `GUIA_INSTALACION_APK.md`. Para el detalle de rutas, consultar `DOCUMENTACION_API.md`.
