# ESTUDIO DEL PROYECTO: EstanciaApp

Este documento es un análisis estático del código real del proyecto. No modifica archivos ni cambia comportamiento. Está pensado como un mapa mental para estudiar cómo funciona el sistema desde la experiencia del usuario hasta la base de datos.

> Regla de lectura: cuando algo no puede determinarse con certeza, se marca como “no está claro” y se indica qué parte del código falta revisar.

---

## 1. Arquitectura real del sistema

### Tipo de aplicación

Es una aplicación full-stack para gestión de una estancia ganadera. Tiene dos capas bien separadas:

- Frontend: interfaz para usuarios de roles administrativos, de campo y veterinario.
- Backend: API REST en Node.js + Express.
- Base de datos: MariaDB.

La aplicación gestiona:

- usuarios y roles;
- corrales;
- especies y razas;
- animales;
- tratamientos veterinarios;
- notificaciones sanitarias;
- dashboard con métricas.

Se puede ver en:

- [README.md](README.md)
- [backend/src/app.ts](backend/src/app.ts)
- [backend/src/config/database.ts](backend/src/config/database.ts)
- [frontend/src/App.tsx](frontend/src/App.tsx)

### Tecnologías

| Capa                   | Tecnología                     | Evidencia                                                                                                                    |
| ---------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Frontend               | React 18 + Vite + TypeScript   | [frontend/package.json](frontend/package.json), [frontend/vite.config.ts](frontend/vite.config.ts)                           |
| Backend                | Node.js + Express + TypeScript | [backend/package.json](backend/package.json), [backend/src/app.ts](backend/src/app.ts)                                       |
| Base de datos          | MariaDB                        | [backend/database/schema.sql](backend/database/schema.sql), [backend/src/config/database.ts](backend/src/config/database.ts) |
| HTTP Client            | Axios                          | [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts)                                                       |
| Formularios            | react-hook-form                | [frontend/src/pages/login/LoginForm.tsx](frontend/src/pages/login/LoginForm.tsx)                                             |
| Enrutamiento           | React Router v6                | [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx)         |
| Autenticación          | JWT                            | [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts)                                                                         |
| Encriptación           | bcryptjs                       | [backend/src/utils/password.ts](backend/src/utils/password.ts)                                                               |
| Persistencia de sesión | sessionStorage / localStorage  | [frontend/src/utils/storage.ts](frontend/src/utils/storage.ts)                                                               |

### Frontend y backend

El frontend está en [frontend/src](frontend/src). El backend está en [backend/src](backend/src). La comunicación ocurre por HTTP con baseURL /api, definida en [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts).

Arquitectura real:

Usuario
↓
Frontend React + Vite
↓
Axios → /api
↓
Express + rutas + middleware
↓
Servicios + SQL directo a MariaDB
↓
Respuesta JSON
↓
React actualiza estado/estado de rutas
↓
Usuario

### Cómo se comunican frontend y backend

- El frontend llama a funciones dentro de [frontend/src/api](frontend/src/api).
- Cada API usa la instancia central [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts).
- Esa instancia añade el encabezado Authorization con Bearer token si existe sesión.
- El backend recibe la petición en [backend/src/app.ts](backend/src/app.ts) y la monta por prefijo /api.
- Luego la ruta la deriva a router → controller → service → pool.query.

### Cómo se comunica backend y base de datos

- El backend usa mysql2/promise con pool de conexiones.
- La conexión se define en [backend/src/config/database.ts](backend/src/config/database.ts).
- Las consultas SQL se escriben directamente en los servicios, por ejemplo:
  - [backend/src/services/authService.ts](backend/src/services/authService.ts)
  - [backend/src/services/animalService.ts](backend/src/services/animalService.ts)
  - [backend/src/services/dashboardService.ts](backend/src/services/dashboardService.ts)
  - [backend/src/services/usuarioService.ts](backend/src/services/usuarioService.ts)

### ¿Hay ORM?

No hay ORM visible. La estructura usa SQL directo con mysql2/promise y queries literales dentro de servicios.

### APIs existentes

Las APIs se montan desde [backend/src/app.ts](backend/src/app.ts):

- /api/auth
- /api/usuarios
- /api/dashboard
- /api/corrales
- /api/especies
- /api/animales
- /api/tratamientos
- /api/notificaciones

Las rutas concretas están en:

- [backend/src/routes/authRoutes.ts](backend/src/routes/authRoutes.ts)
- [backend/src/routes/usuarioRoutes.ts](backend/src/routes/usuarioRoutes.ts)
- [backend/src/routes/dashboardRoutes.ts](backend/src/routes/dashboardRoutes.ts)
- [backend/src/routes/corralRoutes.ts](backend/src/routes/corralRoutes.ts)
- [backend/src/routes/especieRoutes.ts](backend/src/routes/especieRoutes.ts)
- [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts)
- [backend/src/routes/tratamientoRoutes.ts](backend/src/routes/tratamientoRoutes.ts)
- [backend/src/routes/notificacionRoutes.ts](backend/src/routes/notificacionRoutes.ts)

### Servicios externos

No hay servicios externos externos a la aplicación visibles en el código. Sí hay dependencia con MariaDB y JWT, pero no integra API de clima real ni SDK de terceros. El “clima” del dashboard es un valor fijo en [backend/src/services/dashboardService.ts](backend/src/services/dashboardService.ts).

### Autenticación

La autenticación se hace con JWT:

- login en [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)
- validación de credenciales en [backend/src/services/authService.ts](backend/src/services/authService.ts)
- firma/validación en [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts)
- middleware de autenticación en [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts)

El frontend guarda el token y los datos del usuario en sessionStorage/localStorage mediante [frontend/src/utils/storage.ts](frontend/src/utils/storage.ts) y [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx).

### Permisos y roles

Los roles están definidos en [backend/src/types/index.ts](backend/src/types/index.ts) y [backend/src/utils/roles.ts](backend/src/utils/roles.ts).

Roles:

- dueno
- copropietario
- peon
- veterinario

Se validan con [backend/src/middleware/roleMiddleware.ts](backend/src/middleware/roleMiddleware.ts). El middleware lee req.usuario, que se agrega en [backend/src/types/express.d.ts](backend/src/types/express.d.ts) y en [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts).

### Diferencia entre useState y React Router

En este proyecto hay dos formas de hacer login, y ambas terminan en la misma lógica del backend, pero no significan lo mismo:

- useState se usa para estado local del componente. Es una variable booleana o valor que vive en memoria mientras el componente está montado.
- React Router se usa para navegación real entre rutas URL. Cambia la URL, permite volver atrás, compartir enlace, Reload y reusar la ruta como estado de la aplicación.

En este sistema, la diferencia aparece claramente entre:

- login con overlay/modal usando useState: [frontend/src/pages/HomeSelectorPage.tsx](frontend/src/pages/HomeSelectorPage.tsx) y [frontend/src/pages/login/StateLoginOverlay.tsx](frontend/src/pages/login/StateLoginOverlay.tsx)
- login con rutas usando React Router: [frontend/src/pages/login/LoginRouterPage.tsx](frontend/src/pages/login/LoginRouterPage.tsx) y [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx)

La lógica del formulario es la misma: ambos usan [frontend/src/pages/login/LoginForm.tsx](frontend/src/pages/login/LoginForm.tsx), y ambos llaman a la misma función de autenticación en [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx): login(data, mode).

La diferencia real es esta:

1. Con useState
   - el formulario se muestra como modal/overlay sobre la pantalla principal;
   - la URL no cambia;
   - se controla con un booleano como showStateLogin;
   - es útil para una experiencia más rápida o cuando no necesitamos una URL específica para ese flujo.

2. Con React Router
   - la pantalla vive en una URL concreta, por ejemplo /login;
   - el navegador registra esa navegación;
   - AppRouter decide qué vista mostrar según si el usuario está autenticado o no;
   - es útil para guardar el contexto de la app, proteger rutas y redirigir según rol.

En este proyecto, la elección no es solo estética: la seguridad y la navegación por roles dependen de React Router.

Por ejemplo:

- [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx) define rutas como /dashboard, /peon y /veterinario.
- [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx) usa ProtectedRoute, AdminRoute, PeonRoute y VeterinarioRoute para decidir quién puede entrar.
- [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx) guarda la sesión y determina isAuthenticated.

Entonces, resumen práctico:

- useState = controla si el formulario visible o no.
- React Router = controla dónde está el usuario dentro de la app.
- En este proyecto, ambos existen porque el desafío pedía “login dual”: una versión con overlay y otra con rutas. Pero la lógica de autenticación y permisos se centraliza en AuthContext + AppRouter + JWT del backend.

### Manejo de errores

- Error global de API: [backend/src/middleware/errorHandler.ts](backend/src/middleware/errorHandler.ts)
- Validaciones de negocio en services y controllers
- Respuestas uniformes: success + message + data
- En frontend, errores de axios se convierten en texto legible desde [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts)

### Variables de entorno y configuración

Backend:

- [backend/.env.example](backend/.env.example)
- [backend/.env](backend/.env)
- [backend/src/config/database.ts](backend/src/config/database.ts)
- [backend/src/server.ts](backend/src/server.ts)

Variables importantes:

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- PORT
- NODE_ENV
- JWT_SECRET
- JWT_EXPIRES_IN
- CORS_ORIGIN se usa en [backend/src/app.ts](backend/src/app.ts)

Frontend:

- [frontend/vite.config.ts](frontend/vite.config.ts) define proxy /api → http://localhost:3001
- No hay dotenv en frontend visible; se usa Vite proxy + axios baseURL /api.

### Inicio y ejecución

Backend:

- [backend/package.json](backend/package.json)
- script dev: tsx watch src/server.ts
- script build: tsc
- script start: node dist/server.js

Frontend:

- [frontend/package.json](frontend/package.json)
- script dev: vite
- script build: tsc -b && vite build

---

## 2. Mapa completo de archivos importantes

| Archivo                                                                                                  | Responsabilidad                                 | Quién lo llama              | Qué llama                        | Parte del sistema       |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------- | -------------------------------- | ----------------------- |
| [README.md](README.md)                                                                                   | Documento general del proyecto                  | Estudiante / revisión       | no aplica                        | documentación base      |
| [backend/src/server.ts](backend/src/server.ts)                                                           | inicia el servidor                              | node                        | app.listen                       | entrada backend         |
| [backend/src/app.ts](backend/src/app.ts)                                                                 | configura Express, CORS, rutas, health check    | server.ts                   | todas las rutas                  | entrada API             |
| [backend/src/config/database.ts](backend/src/config/database.ts)                                         | crea el pool MariaDB y testConnection           | servicios                   | pool.getConnection               | conexión db             |
| [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts)                     | valida JWT y rellena req.usuario                | routes                      | verifyToken                      | autenticación           |
| [backend/src/middleware/roleMiddleware.ts](backend/src/middleware/roleMiddleware.ts)                     | valida roles                                    | routes                      | req.usuario.rol                  | autorización            |
| [backend/src/middleware/errorHandler.ts](backend/src/middleware/errorHandler.ts)                         | maneja errores globales                         | controllers/services        | res.status(...).json             | manejo de errores       |
| [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts)                                                     | firma y verifica JWT                            | authMiddleware, authService | jwt.sign / jwt.verify            | autenticación           |
| [backend/src/utils/password.ts](backend/src/utils/password.ts)                                           | hash y comparación bcrypt                       | authService, usuarioService | bcrypt.hash / bcrypt.compare     | seguridad               |
| [backend/src/utils/roles.ts](backend/src/utils/roles.ts)                                                 | labels y utilidades de rol                      | services/controllers        | getRolLabel, isAdmin             | control de roles        |
| [backend/src/types/index.ts](backend/src/types/index.ts)                                                 | tipos compartidos backend                       | services/controllers        | interfaces                       | tipos                   |
| [backend/src/types/express.d.ts](backend/src/types/express.d.ts)                                         | extensión de Express.Request                    | auth middleware             | req.usuario                      | tipos runtime           |
| [backend/database/schema.sql](backend/database/schema.sql)                                               | creación de tablas + seeds                      | MariaDB                     | CREATE TABLE, INSERT             | base de datos           |
| [backend/database/seed.ts](backend/database/seed.ts)                                                     | script opcional para sembrar hashes             | npm run seed                | bcrypt, SQL                      | seed                    |
| [backend/src/routes/authRoutes.ts](backend/src/routes/authRoutes.ts)                                     | endpoints de auth                               | app.ts                      | authController                   | rutas                   |
| [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)                   | login, me, cambiar password                     | routes                      | authService                      | controlador             |
| [backend/src/services/authService.ts](backend/src/services/authService.ts)                               | validar credenciales y emitir JWT               | controller                  | pool.query                       | lógica de negocio       |
| [backend/src/routes/usuarioRoutes.ts](backend/src/routes/usuarioRoutes.ts)                               | endpoints CRUD usuarios                         | app.ts                      | usuarioController                | rutas                   |
| [backend/src/controllers/usuarioController.ts](backend/src/controllers/usuarioController.ts)             | valida y delega usuarios                        | routes                      | usuarioService                   | controlador             |
| [backend/src/services/usuarioService.ts](backend/src/services/usuarioService.ts)                         | CRUD usuarios + permisos                        | controller                  | SQL directo                      | servicio                |
| [backend/src/routes/dashboardRoutes.ts](backend/src/routes/dashboardRoutes.ts)                           | endpoint de métricas                            | app.ts                      | dashboardController              | rutas                   |
| [backend/src/controllers/dashboardController.ts](backend/src/controllers/dashboardController.ts)         | devuelve resumen                                | routes                      | dashboardService                 | controlador             |
| [backend/src/services/dashboardService.ts](backend/src/services/dashboardService.ts)                     | agrega métricas de animales/corrales            | controller                  | SQL directo                      | servicio                |
| [backend/src/routes/corralRoutes.ts](backend/src/routes/corralRoutes.ts)                                 | endpoints corrales                              | app.ts                      | corralController                 | rutas                   |
| [backend/src/controllers/corralController.ts](backend/src/controllers/corralController.ts)               | CRUD corrales                                   | routes                      | corralService                    | controlador             |
| [backend/src/services/corralService.ts](backend/src/services/corralService.ts)                           | list/create/update/delete corrales              | controller                  | SQL directo                      | servicio                |
| [backend/src/routes/especieRoutes.ts](backend/src/routes/especieRoutes.ts)                               | especies y razas                                | app.ts                      | especieController                | rutas                   |
| [backend/src/controllers/especieController.ts](backend/src/controllers/especieController.ts)             | crea especie/raza                               | routes                      | especieService                   | controlador             |
| [backend/src/services/especieService.ts](backend/src/services/especieService.ts)                         | list/create especie/raza                        | controller                  | SQL directo                      | servicio                |
| [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts)                                 | CRUD animales y salud                           | app.ts                      | animalController                 | rutas                   |
| [backend/src/controllers/animalController.ts](backend/src/controllers/animalController.ts)               | control de animales y salud                     | routes                      | animalService                    | controlador             |
| [backend/src/services/animalService.ts](backend/src/services/animalService.ts)                           | lógica de animales + capacidad + notificaciones | controller                  | SQL directo + createNotificacion | servicio                |
| [backend/src/routes/tratamientoRoutes.ts](backend/src/routes/tratamientoRoutes.ts)                       | historial de tratamientos                       | app.ts                      | tratamientoController            | rutas                   |
| [backend/src/controllers/tratamientoController.ts](backend/src/controllers/tratamientoController.ts)     | endpoints tratamientos                          | routes                      | tratamientoService               | controlador             |
| [backend/src/services/tratamientoService.ts](backend/src/services/tratamientoService.ts)                 | list/create tratamientos                        | controller                  | SQL directo                      | servicio                |
| [backend/src/routes/notificacionRoutes.ts](backend/src/routes/notificacionRoutes.ts)                     | alertas                                         | app.ts                      | notificacionController           | rutas                   |
| [backend/src/controllers/notificacionController.ts](backend/src/controllers/notificacionController.ts)   | list/remove/clear notificaciones                | routes                      | notificacionService              | controlador             |
| [backend/src/services/notificacionService.ts](backend/src/services/notificacionService.ts)               | alertas persistentes                            | controller/service          | SQL directo                      | servicio                |
| [frontend/src/App.tsx](frontend/src/App.tsx)                                                             | raíz con providers                              | main.tsx                    | AppRouter                        | entrada frontend        |
| [frontend/src/main.tsx](frontend/src/main.tsx)                                                           | monta React                                     | index.html                  | App                              | entrada browser         |
| [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx)                                   | enruta páginas y protege rutas                  | App.tsx                     | useAuth                          | routing                 |
| [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)                           | sesión en memoria + storage                     | componentes                 | loginApi/getMeApi                | auth frontend           |
| [frontend/src/contexts/ToastContext.tsx](frontend/src/contexts/ToastContext.tsx)                         | mensajes toast                                  | componentes                 | showToast                        | notificaciones frontend |
| [frontend/src/contexts/ThemeContext.tsx](frontend/src/contexts/ThemeContext.tsx)                         | tema claro/oscuro                               | App.tsx                     | useTheme                         | UI                      |
| [frontend/src/utils/storage.ts](frontend/src/utils/storage.ts)                                           | session/local storage helpers                   | AuthContext                 | getStorageItem, setStorageItem   | persistencia            |
| [frontend/src/types/index.ts](frontend/src/types/index.ts)                                               | tipos frontend                                  | componentes/api             | interfaces                       | tipos                   |
| [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts)                                   | instancia central de axios y auth header        | api/\*                      | axios.create                     | API client              |
| [frontend/src/api/authApi.ts](frontend/src/api/authApi.ts)                                               | login y me                                      | AuthContext                 | axiosInstance                    | API frontend            |
| [frontend/src/api/dashboardApi.ts](frontend/src/api/dashboardApi.ts)                                     | dashboard summary                               | DashboardPage               | axiosInstance                    | API frontend            |
| [frontend/src/api/corralApi.ts](frontend/src/api/corralApi.ts)                                           | corrales                                        | páginas                     | axiosInstance                    | API frontend            |
| [frontend/src/api/especieApi.ts](frontend/src/api/especieApi.ts)                                         | especies y razas                                | páginas                     | axiosInstance                    | API frontend            |
| [frontend/src/api/animalApi.ts](frontend/src/api/animalApi.ts)                                           | animales y salud                                | páginas                     | axiosInstance                    | API frontend            |
| [frontend/src/api/tratamientoApi.ts](frontend/src/api/tratamientoApi.ts)                                 | tratamientos                                    | páginas                     | axiosInstance                    | API frontend            |
| [frontend/src/api/notificacionApi.ts](frontend/src/api/notificacionApi.ts)                               | notificaciones                                  | página                      | axiosInstance                    | API frontend            |
| [frontend/src/pages/login/LoginForm.tsx](frontend/src/pages/login/LoginForm.tsx)                         | formularios de login                            | LoginRouterPage/overlay     | useAuth.login                    | UI                      |
| [frontend/src/pages/dashboard/DashboardPage.tsx](frontend/src/pages/dashboard/DashboardPage.tsx)         | dashboard administrativo                        | AppRouter                   | getDashboardSummaryApi           | página                  |
| [frontend/src/pages/animales/AnimalesPage.tsx](frontend/src/pages/animales/AnimalesPage.tsx)             | gestión animales                                | AppRouter                   | animalApi                        | página                  |
| [frontend/src/pages/corrales/CorralesPage.tsx](frontend/src/pages/corrales/CorralesPage.tsx)             | gestión corrales                                | AppRouter                   | corralApi                        | página                  |
| [frontend/src/pages/equipo/EquipoPage.tsx](frontend/src/pages/equipo/EquipoPage.tsx)                     | gestión de usuarios                             | AppRouter                   | usuarioApi                       | página                  |
| [frontend/src/pages/peon/PeonPage.tsx](frontend/src/pages/peon/PeonPage.tsx)                             | flujo operativo de peón                         | AppRouter                   | animalApi                        | página                  |
| [frontend/src/pages/veterinario/VeterinarioPage.tsx](frontend/src/pages/veterinario/VeterinarioPage.tsx) | flujo sanitario                                 | AppRouter                   | tratamientoApi, animalApi        | página                  |

---

## 3. Flujos reales de las funcionalidades principales

### Flujo: login

1. El usuario interactúa con:
   [frontend/src/pages/login/LoginForm.tsx](frontend/src/pages/login/LoginForm.tsx) → LoginForm

2. El componente prepara los datos:
   - usa useForm de react-hook-form
   - valida email y contraseña
   - llama a login(data, mode) dentro de [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)

3. Se realiza la llamada HTTP:
   - método: POST
   - endpoint: /api/auth/login
   - archivo: [frontend/src/api/authApi.ts](frontend/src/api/authApi.ts) → loginApi
   - axios: [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts) → instancia central

4. El backend recibe la petición en:
   - [backend/src/routes/authRoutes.ts](backend/src/routes/authRoutes.ts) → router.post("/login", authController.login)
   - [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts) → login

5. El backend valida y procesa:
   - [backend/src/services/authService.ts](backend/src/services/authService.ts) → login
   - comparePassword en [backend/src/utils/password.ts](backend/src/utils/password.ts)

6. Luego accede a MariaDB:
   - [backend/src/services/authService.ts](backend/src/services/authService.ts) → findByEmail
   - consulta SQL: SELECT ... FROM usuarios INNER JOIN roles ... WHERE email = ? AND activo = 1

7. MariaDB devuelve la fila del usuario.

8. El backend firma JWT:
   - [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts) → signToken

9. El frontend recibe la respuesta:
   - data.data contiene token y usuario
   - AuthContext guarda la sesión en storage
   - [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx) → login

10. Estado actualizado:

- usuario, isAuthenticated, loginMode

11. Interfaz mostrada:

- [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx) → GuestRoute / ProtectedRoute / role routes

### Flujo: acceso a una ruta protegida

1. El usuario intenta entrar a /dashboard o /peon o /veterinario.
2. [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx) verifica isAuthenticated.
3. Si no hay sesión, devuelve Navigate to /.
4. Si existe sesión, renderiza la pantalla.
5. En el backend, cada ruta usa authenticate y, según corresponda, authorize.
6. [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts) exige Authorization: Bearer <token>.
7. Si el token no es válido, responde 401.
8. Si el rol no tiene acceso, responde 403.

### Flujo: crear un animal

1. El usuario interactúa en:
   [frontend/src/pages/animales/AnimalesPage.tsx](frontend/src/pages/animales/AnimalesPage.tsx)

2. El componente usa funciones de:
   [frontend/src/api/animalApi.ts](frontend/src/api/animalApi.ts) → createAnimalApi

3. HTTP:
   - método: POST
   - endpoint: /api/animales
   - archivo: [frontend/src/api/animalApi.ts](frontend/src/api/animalApi.ts)

4. Backend:
   - [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts)
   - [backend/src/controllers/animalController.ts](backend/src/controllers/animalController.ts) → create

5. Lógica:
   - [backend/src/services/animalService.ts](backend/src/services/animalService.ts) → createAnimal
   - valida identificador, corral, raza
   - revisa capacidad del corral
   - inserta en tabla animales

6. SQL:
   - INSERT INTO animales (...)

7. Después del insert, el servicio vuelve a listar animales.
8. El backend responde JSON con success + data.
9. Frontend recibe response y actualiza estado local.
10. La tabla o formulario se re-renderiza.

### Flujo: reporte de enfermedad

1. El usuario de peón o veterinario dispara acción desde interfaz.
2. Se llama a POST /api/animales/:id/reportar-enfermedad.
3. El controller [backend/src/controllers/animalController.ts](backend/src/controllers/animalController.ts) recibe id y comentarios.
4. El service [backend/src/services/animalService.ts](backend/src/services/animalService.ts) → reportarEnfermedad realiza:
   - validación
   - actualización de animales
   - inserta notificación en [backend/src/services/notificacionService.ts](backend/src/services/notificacionService.ts)
   - cambia el animal a enfermería o estado relevante

### Flujo: dashboard

1. [frontend/src/pages/dashboard/DashboardPage.tsx](frontend/src/pages/dashboard/DashboardPage.tsx) monta el componente.
2. useEffect llama a getDashboardSummaryApi.
3. Fetch a GET /api/dashboard/summary.
4. Ruta en [backend/src/routes/dashboardRoutes.ts](backend/src/routes/dashboardRoutes.ts).
5. Controller [backend/src/controllers/dashboardController.ts](backend/src/controllers/dashboardController.ts) delega a getDashboardSummary.
6. Service [backend/src/services/dashboardService.ts](backend/src/services/dashboardService.ts) ejecuta varias consultas agregadas a MariaDB.
7. Devuelve resumen con totalAnimales, alertasActivas, corralesTotal, clima, resumenMensual.
8. Frontend actualiza state data y renderiza MetricCard y FieldSummaryChart.

---

## 4. Base de datos y MariaDB

### ¿Dónde se configuran la conexión?

- [backend/src/config/database.ts](backend/src/config/database.ts)
- usa mysql2/promise
- carga dotenv desde [backend/src/config/database.ts](backend/src/config/database.ts)

### ¿Qué librería se usa?

mysql2/promise.

### ¿Dónde se crea la conexión/pool?

En [backend/src/config/database.ts](backend/src/config/database.ts):

- mysql.createPool({ host, port, user, password, database, ... })
- connectionLimit: 10
- waitForConnections: true

### ¿Qué archivo abre la conexión?

El pool se crea al importar [backend/src/config/database.ts](backend/src/config/database.ts). Luego cada servicio hace pool.query. No hay apertura manual por handler; se reutiliza el mismo pool durante toda la vida del proceso.

### ¿Dónde están los modelos?

No hay modelos con ORM. Los “modelos” reales son las tablas SQL definidas en [backend/database/schema.sql](backend/database/schema.sql) y las interfaces TypeScript en [backend/src/types/index.ts](backend/src/types/index.ts).

### ¿Dónde están los repositorios?

No hay capa de repositorios explícita. La lógica de acceso a datos está en los services: por ejemplo, [backend/src/services/authService.ts](backend/src/services/authService.ts), [backend/src/services/usuarioService.ts](backend/src/services/usuarioService.ts), [backend/src/services/animalService.ts](backend/src/services/animalService.ts).

### ¿Dónde están las consultas SQL?

Directamente dentro de los services, por ejemplo:

- [backend/src/services/authService.ts](backend/src/services/authService.ts)
- [backend/src/services/dashboardService.ts](backend/src/services/dashboardService.ts)
- [backend/src/services/animalService.ts](backend/src/services/animalService.ts)
- [backend/src/services/usuarioService.ts](backend/src/services/usuarioService.ts)
- [backend/src/services/tratamientoService.ts](backend/src/services/tratamientoService.ts)
- [backend/src/services/notificacionService.ts](backend/src/services/notificacionService.ts)

### ¿Tienen migraciones?

No hay migraciones visibles. Hay schema SQL y script seed. La estructura es más bien una base creada manualmente con SQL inicial. Esto se ve en [backend/database/schema.sql](backend/database/schema.sql) y [backend/database/seed.ts](backend/database/seed.ts).

### ¿Se utilizan parámetros para evitar SQL injection?

Sí, con placeholders: ? en sentencias SQL y arrays de valores. Ejemplo: [backend/src/services/authService.ts](backend/src/services/authService.ts) usa [email] y [id]. Esto es la práctica segura que usa mysql2.

### ¿Cómo se manejan errores de conexión?

- [backend/src/config/database.ts](backend/src/config/database.ts) → testConnection()
- try/catch alrededor de pool.getConnection() + ping()
- en caso de error se loguea y devuelve false

### ¿Cómo se manejan transacciones?

No se observan transacciones explícitas con BEGIN/COMMIT/ROLLBACK. La aplicación usa operaciones simples y consultas de una sola tarea. No hay evidencia de transacciones en los services analizados.

### Relaciones entre tablas importantes

El esquema en [backend/database/schema.sql](backend/database/schema.sql) define relaciones:

- usuarios.id_rol → roles.id_rol
- animales.id_corral → corrales.id_corral
- animales.id_raza → razas.id_raza
- razas.id_especie → especies.id_especie
- tratamientos.id_animal → animales.id_animal
- tratamientos.id_veterinario → usuarios.id_usuario
- notificaciones.id_animal → animales.id_animal

### Tablas principales

| Tabla          | Rol                       | Archivo                                                    |
| -------------- | ------------------------- | ---------------------------------------------------------- |
| roles          | define roles              | [backend/database/schema.sql](backend/database/schema.sql) |
| usuarios       | logins, perfil, empleados | [backend/database/schema.sql](backend/database/schema.sql) |
| corrales       | ubicación y capacidad     | [backend/database/schema.sql](backend/database/schema.sql) |
| especies       | catálogo de especie       | [backend/database/schema.sql](backend/database/schema.sql) |
| razas          | catálogo por especie      | [backend/database/schema.sql](backend/schema.sql)          |
| animales       | ganado                    | [backend/database/schema.sql](backend/database/schema.sql) |
| tratamientos   | historial clínico         | [backend/database/schema.sql](backend/database/schema.sql) |
| notificaciones | alertas sanitarias        | [backend/database/schema.sql](backend/database/schema.sql) |

### Mapa funcionalidad → endpoint → controller → service → SQL → tabla

| Funcionalidad       | Endpoint                                   | Controller                                                                                             | Service                                                                                    | SQL / tabla                                              |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Login               | POST /api/auth/login                       | [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)                 | [backend/src/services/authService.ts](backend/src/services/authService.ts)                 | SELECT usuarios JOIN roles WHERE email = ?               |
| Perfil              | GET /api/auth/me                           | [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)                 | [backend/src/services/authService.ts](backend/src/services/authService.ts)                 | SELECT ... FROM usuarios JOIN roles WHERE id_usuario = ? |
| Crear usuario       | POST /api/usuarios                         | [backend/src/controllers/usuarioController.ts](backend/src/controllers/usuarioController.ts)           | [backend/src/services/usuarioService.ts](backend/src/services/usuarioService.ts)           | INSERT INTO usuarios                                     |
| Dashboard           | GET /api/dashboard/summary                 | [backend/src/controllers/dashboardController.ts](backend/src/controllers/dashboardController.ts)       | [backend/src/services/dashboardService.ts](backend/src/services/dashboardService.ts)       | COUNT(\*) de animales, corrales y alertas                |
| Crear corral        | POST /api/corrales                         | [backend/src/controllers/corralController.ts](backend/src/controllers/corralController.ts)             | [backend/src/services/corralService.ts](backend/src/services/corralService.ts)             | INSERT INTO corrales                                     |
| Crear animal        | POST /api/animales                         | [backend/src/controllers/animalController.ts](backend/src/controllers/animalController.ts)             | [backend/src/services/animalService.ts](backend/src/services/animalService.ts)             | INSERT INTO animales                                     |
| Reportar enfermedad | POST /api/animales/:id/reportar-enfermedad | [backend/src/controllers/animalController.ts](backend/src/controllers/animalController.ts)             | [backend/src/services/animalService.ts](backend/src/services/animalService.ts)             | UPDATE animales + INSERT notificaciones                  |
| Dar de alta         | POST /api/animales/:id/alta                | [backend/src/controllers/animalController.ts](backend/src/controllers/animalController.ts)             | [backend/src/services/animalService.ts](backend/src/services/animalService.ts)             | UPDATE animales + INSERT notificaciones                  |
| Tratamiento         | POST /api/tratamientos                     | [backend/src/controllers/tratamientoController.ts](backend/src/controllers/tratamientoController.ts)   | [backend/src/services/tratamientoService.ts](backend/src/services/tratamientoService.ts)   | INSERT INTO tratamientos                                 |
| Notificaciones      | GET /api/notificaciones                    | [backend/src/controllers/notificacionController.ts](backend/src/controllers/notificacionController.ts) | [backend/src/services/notificacionService.ts](backend/src/services/notificacionService.ts) | SELECT FROM notificaciones                               |

---

## 5. APIs y endpoints

### Tabla de endpoints importantes

| Método | Endpoint                              | Frontend que lo llama                                                      | Backend que lo recibe                                                                | Qué hace                                | Base de datos             |
| ------ | ------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------- | ------------------------- |
| GET    | /api/health                           | no visible                                                                 | [backend/src/app.ts](backend/src/app.ts)                                             | prueba conexión DB                      | MariaDB                   |
| POST   | /api/auth/login                       | [frontend/src/api/authApi.ts](frontend/src/api/authApi.ts)                 | [backend/src/routes/authRoutes.ts](backend/src/routes/authRoutes.ts)                 | valida credenciales y devuelve JWT      | usuarios                  |
| GET    | /api/auth/me                          | [frontend/src/api/authApi.ts](frontend/src/api/authApi.ts)                 | [backend/src/routes/authRoutes.ts](backend/src/routes/authRoutes.ts)                 | devuelve perfil del usuario autenticado | usuarios                  |
| POST   | /api/auth/cambiar-password-inicial    | [frontend/src/api/authApi.ts](frontend/src/api/authApi.ts)                 | [backend/src/routes/authRoutes.ts](backend/src/routes/authRoutes.ts)                 | cambia contraseña de primer ingreso     | usuarios                  |
| GET    | /api/usuarios                         | [frontend/src/api/usuarioApi.ts](frontend/src/api/usuarioApi.ts)           | [backend/src/routes/usuarioRoutes.ts](backend/src/routes/usuarioRoutes.ts)           | lista usuarios                          | usuarios                  |
| POST   | /api/usuarios                         | [frontend/src/api/usuarioApi.ts](frontend/src/api/usuarioApi.ts)           | [backend/src/routes/usuarioRoutes.ts](backend/src/routes/usuarioRoutes.ts)           | crea usuario                            | usuarios                  |
| PATCH  | /api/usuarios/:id                     | [frontend/src/api/usuarioApi.ts](frontend/src/api/usuarioApi.ts)           | [backend/src/routes/usuarioRoutes.ts](backend/src/routes/usuarioRoutes.ts)           | actualiza usuario                       | usuarios                  |
| DELETE | /api/usuarios/:id                     | [frontend/src/api/usuarioApi.ts](frontend/src/api/usuarioApi.ts)           | [backend/src/routes/usuarioRoutes.ts](backend/src/routes/usuarioRoutes.ts)           | desactiva usuario                       | usuarios                  |
| GET    | /api/dashboard/summary                | [frontend/src/api/dashboardApi.ts](frontend/src/api/dashboardApi.ts)       | [backend/src/routes/dashboardRoutes.ts](backend/src/routes/dashboardRoutes.ts)       | métricas del panel                      | animales + corrales       |
| GET    | /api/corrales                         | [frontend/src/api/corralApi.ts](frontend/src/api/corralApi.ts)             | [backend/src/routes/corralRoutes.ts](backend/src/routes/corralRoutes.ts)             | lista corrales                          | corrales                  |
| POST   | /api/corrales                         | [frontend/src/api/corralApi.ts](frontend/src/api/corralApi.ts)             | [backend/src/routes/corralRoutes.ts](backend/src/routes/corralRoutes.ts)             | crea corral                             | corrales                  |
| PATCH  | /api/corrales/:id                     | [frontend/src/api/corralApi.ts](frontend/src/api/corralApi.ts)             | [backend/src/routes/corralRoutes.ts](backend/src/routes/corralRoutes.ts)             | actualiza corral                        | corrales                  |
| DELETE | /api/corrales/:id                     | [frontend/src/api/corralApi.ts](frontend/src/api/corralApi.ts)             | [backend/src/routes/corralRoutes.ts](backend/src/routes/corralRoutes.ts)             | desactiva corral                        | corrales                  |
| GET    | /api/especies                         | [frontend/src/api/especieApi.ts](frontend/src/api/especieApi.ts)           | [backend/src/routes/especieRoutes.ts](backend/src/routes/especieRoutes.ts)           | lista especies y razas                  | especies + razas          |
| POST   | /api/especies                         | [frontend/src/api/especieApi.ts](frontend/src/api/especieApi.ts)           | [backend/src/routes/especieRoutes.ts](backend/src/routes/especieRoutes.ts)           | crea especie                            | especies                  |
| POST   | /api/especies/:id/razas               | [frontend/src/api/especieApi.ts](frontend/src/api/especieApi.ts)           | [backend/src/routes/especieRoutes.ts](backend/src/routes/especieRoutes.ts)           | crea raza                               | razas                     |
| GET    | /api/animales                         | [frontend/src/api/animalApi.ts](frontend/src/api/animalApi.ts)             | [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts)             | lista animales                          | animales                  |
| POST   | /api/animales                         | [frontend/src/api/animalApi.ts](frontend/src/api/animalApi.ts)             | [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts)             | crea animal                             | animales                  |
| PATCH  | /api/animales/:id                     | [frontend/src/api/animalApi.ts](frontend/src/api/animalApi.ts)             | [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts)             | actualiza animal                        | animales                  |
| DELETE | /api/animales/:id                     | [frontend/src/api/animalApi.ts](frontend/src/api/animalApi.ts)             | [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts)             | desactiva animal                        | animales                  |
| POST   | /api/animales/:id/reportar-enfermedad | [frontend/src/api/animalApi.ts](frontend/src/api/animalApi.ts)             | [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts)             | mueve a enfermería                      | animales + notificaciones |
| POST   | /api/animales/:id/alta                | [frontend/src/api/animalApi.ts](frontend/src/api/animalApi.ts)             | [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts)             | alta veterinaria                        | animales + notificaciones |
| GET    | /api/tratamientos?id_animal=...       | [frontend/src/api/tratamientoApi.ts](frontend/src/api/tratamientoApi.ts)   | [backend/src/routes/tratamientoRoutes.ts](backend/src/routes/tratamientoRoutes.ts)   | historial clínico                       | tratamientos              |
| POST   | /api/tratamientos                     | [frontend/src/api/tratamientoApi.ts](frontend/src/api/tratamientoApi.ts)   | [backend/src/routes/tratamientoRoutes.ts](backend/src/routes/tratamientoRoutes.ts)   | crea tratamiento                        | tratamientos              |
| GET    | /api/notificaciones                   | [frontend/src/api/notificacionApi.ts](frontend/src/api/notificacionApi.ts) | [backend/src/routes/notificacionRoutes.ts](backend/src/routes/notificacionRoutes.ts) | lista alertas                           | notificaciones            |
| DELETE | /api/notificaciones/:id               | [frontend/src/api/notificacionApi.ts](frontend/src/api/notificacionApi.ts) | [backend/src/routes/notificacionRoutes.ts](backend/src/routes/notificacionRoutes.ts) | borra una alerta                        | notificaciones            |
| DELETE | /api/notificaciones                   | [frontend/src/api/notificacionApi.ts](frontend/src/api/notificacionApi.ts) | [backend/src/routes/notificacionRoutes.ts](backend/src/routes/notificacionRoutes.ts) | limpia alertas                          | notificaciones            |

### Dónde se construye la URL

- Base URL: [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts)
- Las llamadas usan rutas relativas como /animales, /usuarios, /dashboard/summary
- Vite redirige /api hacia http://localhost:3001 en [frontend/vite.config.ts](frontend/vite.config.ts)

### Headers y body

- headers: Content-Type: application/json
- Authorization: Bearer <token> agregado en interceptor de axios
- body: se envía como JSON en axios.post/patch

### Recepción de parámetros

- req.body para JSON
- req.params.id para path params
- req.query para querystring (por ejemplo id_corral, id_especie)

### Manejo de respuestas y errores

- El backend devuelve JSON con success, message y data
- Axios guarda respuesta en data
- Si falla, getApiErrorMessage extrae el mensaje de error
- En frontend se muestra via toast y/o setState

### Protección de endpoints

- authenticate: [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts)
- authorize: [backend/src/middleware/roleMiddleware.ts](backend/src/middleware/roleMiddleware.ts)
- rutas montadas con middleware en [backend/src/routes](backend/src/routes)

---

## 6. Qué se hace así y por qué

### 1. El código explícitamente hace esto.

- El backend valida tokens con JWT y los documentos en [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts) y [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts).
- La base de datos se usa con SQL directo, no ORM.
- El frontend usa Context API para sesión y notificaciones.
- El frontend guarda sesión en storage para restaurarla al recargar.

### 2. Por la estructura del código se puede inferir esto.

- El proyecto busca separar responsabilidades por capas: rutas, controladores, servicios, utils, types. Esto no es una “arquitectura enterprise” completa, pero sí una separación clara.
- Los services son el punto de acceso a la base de datos porque contienen consultas SQL y validaciones de negocio.
- Los controllers son delgados y no tienen lógica de acceso a datos pesado.
- Los componentes de React no consultan la BD directamente; usan funciones en [frontend/src/api](frontend/src/api).

### 3. No se puede determinar por el código.

- No hay evidencia de pagos, cronjobs, colas, webhooks, caché, microservicios, WebSockets, o migraciones automáticas.
- No se ve una capa de repositorios formal ni un patrón de “unit of work”.
- No se ve un sistema de cookies HttpOnly del lado del backend: la app usa JWT en Authorization header y storage del navegador.

### Preguntas de decisión importante

- ¿Por qué se usa JWT y no sesión de servidor? Porque la app usa [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts) y el frontend guarda el token, no cookies.
- ¿Por qué se usa SQL directo y no ORM? Porque está implementado con mysql2/promise y queries literales en services.
- ¿Por qué la sesión se restaura en AuthContext? Porque [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx) hace getMeApi al montar para validar que el token siga vigente.
- ¿Por qué está separado por archivo? Porque el proyecto sigue una división funcional muy clara: rutas, controllers, services, utils y tipos.

---

## 7. Autenticación y usuarios

### Recorrido completo de login

1. El usuario rellena email/contraseña en [frontend/src/pages/login/LoginForm.tsx](frontend/src/pages/login/LoginForm.tsx).
2. El Submit llama a login(data, mode) en [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx).
3. AuthContext usa loginApi de [frontend/src/api/authApi.ts](frontend/src/api/authApi.ts).
4. axiosInstance envía POST /api/auth/login.
5. [backend/src/routes/authRoutes.ts](backend/src/routes/authRoutes.ts) recibe la ruta.
6. [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts) valida la presencia de email/contrasña.
7. [backend/src/services/authService.ts](backend/src/services/authService.ts) consulta el usuario por email.
8. comparePassword en [backend/src/utils/password.ts](backend/src/utils/password.ts) compara hash.
9. Si coincide, firma un JWT con id_usuario, email y rol.
10. El backend responde con token y usuario público.
11. El frontend guarda la sesión en storage.
12. El navegador redirige según el rol y la ruta configurada.

### ¿Cómo se determina quién es el usuario?

- El token JWT contiene id_usuario, email y rol.
- [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts)
- Para rescatar el usuario real se usa /api/auth/me o getProfile dentro de [backend/src/services/authService.ts](backend/src/services/authService.ts).

### ¿Cómo se obtiene el ID?

- En JWT: id_usuario
- En req.usuario dado por middleware
- En [backend/src/types/express.d.ts](backend/src/types/express.d.ts)

### ¿Cómo se determinan roles y permisos?

- Tabla roles en [backend/database/schema.sql](backend/database/schema.sql)
- Usuario tiene id_rol
- La consulta JOIN roles devuelve rol_nombre
- Middleware authorize revisa req.usuario.rol

### ¿Cómo se protege una ruta?

- En [backend/src/routes](backend/src/routes), cada endpoint pone authenticate y/o authorize.
- Ejemplo: [backend/src/routes/dashboardRoutes.ts](backend/src/routes/dashboardRoutes.ts).
- Ejemplo: [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts).

### ¿Qué ocurre si el token no existe o expira?

- [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts) responde 401 en ambos casos.
- En frontend, [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx) intenta restaurar sesión al montar; si getMeApi falla, limpia la sesión.

### ¿Dónde se manejan errores de autenticación?

- [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts)
- [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)
- [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)
- [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts)

---

## 8. Frontend: cómo funciona la interfaz

### Estructura principal

- Entrada: [frontend/src/main.tsx](frontend/src/main.tsx)
- Providers raíz: [frontend/src/App.tsx](frontend/src/App.tsx)
- Router: [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx)

### Contextos

- AuthContext: sesión y permisos: [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)
- ToastContext: notificaciones globales: [frontend/src/contexts/ToastContext.tsx](frontend/src/contexts/ToastContext.tsx)
- ThemeContext: tema: [frontend/src/contexts/ThemeContext.tsx](frontend/src/contexts/ThemeContext.tsx)

### Estado y hooks

- useState para estado local
- useEffect para carga inicial y efectos secundarios
- useForm en formularios
- useNavigate para navegación
- useSearchParams cuando usa búsqueda o query params

### Formularios y validación

- [frontend/src/pages/login/LoginForm.tsx](frontend/src/pages/login/LoginForm.tsx): email + password + rememberMe
- Validación con react-hook-form y mensajes inline

### Llamadas a APIs

- Todas las llamadas están centralizadas en [frontend/src/api](frontend/src/api)
- Frontend no accede a la base de datos directamente

### Carga de datos y actualización

- useEffect en páginas de dashboard, animales, corrales, equipo
- setState actualizado tras response
- renderizado condicional loading / error / data

### Navegación y rutas protegidas

- [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx) define rutas por rol
- ProtectedRoute / GuestRoute / AdminRoute / PeonRoute / VeterinarioRoute

### Modales y notificaciones

- Modal de cambio de contraseña: [frontend/src/components/molecules/ChangePasswordModal.tsx](frontend/src/components/molecules/ChangePasswordModal.tsx)
- Toasts: [frontend/src/contexts/ToastContext.tsx](frontend/src/contexts/ToastContext.tsx)
- NotificationModal usado en dashboard: [frontend/src/pages/dashboard/DashboardPage.tsx](frontend/src/pages/dashboard/DashboardPage.tsx)

### Manejo de loading y errores

- isLoading en AuthContext
- state loading en páginas específicas
- getApiErrorMessage en [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts)

---

## 9. TypeScript: tipos importantes

### Backend

Archivo: [backend/src/types/index.ts](backend/src/types/index.ts)

- RolNombre: unión literal para roles
- UsuarioDB: estructura de la fila de base de datos
- UsuarioPublico: información segura para frontend
- ApiResponse: envelope estándar de respuesta
- LoginRequest: datos del login
- CreateUsuarioRequest / UpdateUsuarioRequest: DTOs de usuario

### Frontend

Archivo: [frontend/src/types/index.ts](frontend/src/types/index.ts)

- RolNombre
- LoginMode
- Usuario
- AuthSession
- LoginFormData
- DashboardSummary
- Corral
- Raza
- Especie
- EstadoSalud
- Animal
- Tratamiento
- NotificacionAlerta

### Qué representan realmente

- Usuario representa el perfil visible para el navegador, no la tabla completa.
- AuthSession representa la sesión en storage.
- Animal representa la data que llega tras JOINs de la base de datos en la capa service.
- NotificacionAlerta representa el payload final para mostrar alertas en UI.

---

## 10. Backend: arquitectura real

### Capa de rutas

- [backend/src/routes](backend/src/routes)
- define endpoints
- aplica authenticate y authorize

### Capa de controller

- [backend/src/controllers](backend/src/controllers)
- recibe req/ res, extrae datos, invoca services, responde JSON

### Capa de service

- [backend/src/services](backend/src/services)
- tiene la lógica de negocio y la SQL
- valida permisos, reglas de negocio y normaliza resultados

### Capa de acceso a datos

- [backend/src/config/database.ts](backend/src/config/database.ts)
- pool de mysql2/promise
- consultas literales

### ¿Está implementado exactamente “Routes → Controllers → Services → Repository”?

No del todo. Hay routes, controllers y services; lo que no aparece es una capa de repositories clara. En la práctica, los services hacen las consultas directamente con el pool. Eso significa que la separación es funcional, no patrón repositorio puro.

---

## 11. Errores y casos especiales

### Falla de la base de datos

- [backend/src/config/database.ts](backend/src/config/database.ts) → testConnection devuelve false si hay error
- [backend/src/app.ts](backend/src/app.ts) health check responde 503 si la DB está caída
- services que hagan query lanzarán error y el controlador/global handler responderá 500 o 400 según el caso

### Falla de una API

- axios intercepta errores en [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts)
- front muestra mensaje con getApiErrorMessage

### Faltan datos

- Validaciones explícitas en controllers/services: email/password, nombre, etc.
- Ejemplo: [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)
- Ejemplo: [backend/src/services/animalService.ts](backend/src/services/animalService.ts)

### Usuario no autenticado

- [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts) responde 401
- [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx) redirige a /

### Usuario sin permisos

- [backend/src/middleware/roleMiddleware.ts](backend/src/middleware/roleMiddleware.ts) responde 403
- frontend no renderiza rutas protegidas en [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx)

### Registro duplicado

- Por ejemplo email duplicado en usuarios
- Por ejemplo nombre duplicado en corrales o especies
- catch con ER_DUP_ENTRY en services: [backend/src/services/usuarioService.ts](backend/src/services/usuarioService.ts), [backend/src/services/corralService.ts](backend/src/services/corralService.ts), [backend/src/services/especieService.ts](backend/src/services/especieService.ts)

### Recurso no existe

- services comparan affectedRows o filas vacías y lanzan errores: por ejemplo [backend/src/services/usuarioService.ts](backend/src/services/usuarioService.ts)
- el controller responde status 400/404 según el caso

### Error inesperado

- [backend/src/middleware/errorHandler.ts](backend/src/middleware/errorHandler.ts) captura errores no manejados y devuelve 500

---

## 12. Variables de entorno y configuración

### Backend

Archivo: [backend/.env.example](backend/.env.example)

Variables observadas:

- DB_HOST: host de MariaDB
- DB_PORT: puerto de MariaDB (3307)
- DB_USER: usuario DB
- DB_PASSWORD: contraseña DB
- DB_NAME: nombre de base
- PORT: puerto del backend
- NODE_ENV: entorno
- JWT_SECRET: clave para firmar JWT
- JWT_EXPIRES_IN: duración del JWT

Uso real:

- [backend/src/config/database.ts](backend/src/config/database.ts)
- [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts)
- [backend/src/server.ts](backend/src/server.ts)
- [backend/src/app.ts](backend/src/app.ts)

### Frontend

- [frontend/vite.config.ts](frontend/vite.config.ts) define proxy /api → http://localhost:3001
- No hay un .env frontend visible para VITE\_\* en la estructura leída.

> No se muestran valores reales ni secretos; solo nombres y propósito.

---

## 13. Preguntas intuitivas que podrían surgir

### 1. ¿Qué pasa cuando el usuario inicia sesión?

Respuesta: se valida email/password, se compara con hash bcrypt, se firma JWT y se guarda sesión. Donde verlo:

- [frontend/src/pages/login/LoginForm.tsx](frontend/src/pages/login/LoginForm.tsx)
- [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)
- [frontend/src/api/authApi.ts](frontend/src/api/authApi.ts)
- [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)
- [backend/src/services/authService.ts](backend/src/services/authService.ts)
- [backend/src/database/schema.sql](backend/database/schema.sql)

### 2. ¿Dónde termina guardada la sesión?

Respuesta: en sessionStorage/localStorage, gestionado por [frontend/src/utils/storage.ts](frontend/src/utils/storage.ts) desde AuthContext.

### 3. ¿Cómo sabe el backend quién es el usuario?

Respuesta: a partir del token JWT leído por authenticate en [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts).

### 4. ¿Qué pasa si el token expira?

Respuesta: jwt.verify lanza error y el middleware responde 401.

- [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts)
- [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts)

### 5. ¿Dónde se valida que un rol pueda hacer algo?

Respuesta: [backend/src/middleware/roleMiddleware.ts](backend/src/middleware/roleMiddleware.ts), en las rutas [backend/src/routes](backend/src/routes).

### 6. ¿Cómo llega la información del dashboard al frontend?

Respuesta: GET /api/dashboard/summary → dashboardController → dashboardService → SQL → JSON → DashboardPage.

### 7. ¿Cómo se crea un animal?

Respuesta: formulario + API + controller + service + INSERT INTO animales.

### 8. ¿Qué pasa si el corral está lleno?

Respuesta: [backend/src/services/animalService.ts](backend/src/services/animalService.ts) compara ocupados vs capacidad y lanza error.

### 9. ¿Qué pasa si el usuario intenta entrar a una ruta sin permisos?

Respuesta: authorize responde 403 y AppRouter lo redirige según rol.

### 10. ¿Por qué el backend no hace fetch directamente al frontend?

Respuesta: el proyecto está separado por capas; el navegador solo hace HTTP al backend por /api.

---

## 14. Seguir el dato

### Dato: userId / id_usuario

Frontend:

- [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx) guarda el usuario autenticado en la sesión

API:

- [frontend/src/api/authApi.ts](frontend/src/api/authApi.ts) → token + usuario

Backend:

- [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts) → coloca req.usuario
- [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts) → firma id_usuario en el JWT

MariaDB:

- tabla usuarios
- columna id_usuario

### Dato: token JWT

Frontend:

- [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts) adjunta Authorization

Backend:

- [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts)

DB:

- no se guarda en MariaDB; es un token firmado y validado localmente con secret

### Dato: rol del usuario

Frontend:

- [frontend/src/types/index.ts](frontend/src/types/index.ts)

Backend:

- [backend/src/utils/roles.ts](backend/src/utils/roles.ts)
- [backend/src/middleware/roleMiddleware.ts](backend/src/middleware/roleMiddleware.ts)

DB:

- tabla roles + usuarios.id_rol

### Dato: estado de un animal

Frontend:

- [frontend/src/types/index.ts](frontend/src/types/index.ts) → EstadoSalud

Backend:

- [backend/src/services/animalService.ts](backend/src/services/animalService.ts)

DB:

- tabla animales → estado_salud

---

## 15. Seguir el clic

### Clic: “Iniciar sesión”

1. [frontend/src/pages/login/LoginForm.tsx](frontend/src/pages/login/LoginForm.tsx) → onSubmit
2. Ejecuta login de [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)
3. Llama POST /api/auth/login desde [frontend/src/api/authApi.ts](frontend/src/api/authApi.ts)
4. Backend route [backend/src/routes/authRoutes.ts](backend/src/routes/authRoutes.ts)
5. Controller [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)
6. Service [backend/src/services/authService.ts](backend/src/services/authService.ts)
7. SQL: SELECT usuarios JOIN roles WHERE email = ?
8. Base de datos: usuarios
9. Respuesta JSON con token + usuario
10. Frontend guarda sesión
11. AppRouter redirige según rol

### Clic: “Agregar animal”

1. [frontend/src/pages/animales/AnimalesPage.tsx](frontend/src/pages/animales/AnimalesPage.tsx)
2. Llama createAnimalApi
3. POST /api/animales
4. [backend/src/routes/animalRoutes.ts](backend/src/routes/animalRoutes.ts)
5. [backend/src/controllers/animalController.ts](backend/src/controllers/animalController.ts)
6. [backend/src/services/animalService.ts](backend/src/services/animalService.ts)
7. Valida capacidad del corral, inserta en animales
8. SQL INSERT INTO animales
9. Respuesta con animal creado
10. UI actualiza tabla/listado

### Clic: “Reportar enfermedad”

1. [frontend/src/pages/peon/PeonPage.tsx](frontend/src/pages/peon/PeonPage.tsx) o [frontend/src/pages/veterinario/VeterinarioPage.tsx](frontend/src/pages/veterinario/VeterinarioPage.tsx)
2. Llama animalApi.reportarEnfermedad
3. POST /api/animales/:id/reportar-enfermedad
4. [backend/src/services/animalService.ts](backend/src/services/animalService.ts)
5. UPDATE animales + INSERT notificaciones
6. UI muestra alerta y/o notificación

---

## 16. Mapa final para estudiar

### Nivel 1 — Entender el proyecto

- Es un sistema de gestión de estancia ganadera
- Backend API REST + Frontend React
- MariaDB como persistencia
- Roles por usuario

### Nivel 2 — Entender el frontend

- [frontend/src/App.tsx](frontend/src/App.tsx)
- [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx)
- [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)
- [frontend/src/pages](frontend/src/pages)

### Nivel 3 — Entender las APIs

- [frontend/src/api](frontend/src/api)
- [backend/src/routes](backend/src/routes)
- [backend/src/controllers](backend/src/controllers)

### Nivel 4 — Entender el backend

- [backend/src/middleware](backend/src/middleware)
- [backend/src/services](backend/src/services)
- [backend/src/utils](backend/src/utils)

### Nivel 5 — Entender MariaDB

- [backend/database/schema.sql](backend/database/schema.sql)
- [backend/src/config/database.ts](backend/src/config/database.ts)
- queries en services

### Nivel 6 — Entender los flujos completos

- login
- crear/editar animal
- dashboard
- crear usuario
- reportar enfermedad
- historial de tratamiento

### Nivel 7 — poder explicar el proyecto

Preguntas de examen posibles:

- ¿Qué ocurre desde el click hasta la base de datos?
- ¿Por qué una ruta está protegida?
- ¿Qué pasa si el token es inválido?
- ¿Qué cambia cuando el rol es peón o veterinario?
- ¿Dónde se almacena la sesión?
- ¿Qué archivo decide qué pantalla mostrar?
- ¿Cómo se maneja un error de duplicado en la BD?

---

## 17. Resumen ejecutivo

El sistema tiene una arquitectura clara y didáctica:

- Frontend React + Vite + TypeScript
- Backend Express + TypeScript
- JWT para autenticación
- MariaDB con SQL directo
- Rutas protegidas por authorize
- Separación por rutas, controllers, services, utils, types

La idea central es: el navegador no toca la BD; hace HTTP a la API; la API valida, hace SQL y devuelve JSON; la UI actualiza su estado y la vista.

Para aprenderlo de verdad, conviene empezar con esta secuencia:

1. [frontend/src/App.tsx](frontend/src/App.tsx)
2. [frontend/src/routes/AppRouter.tsx](frontend/src/routes/AppRouter.tsx)
3. [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)
4. [frontend/src/api/axiosInstance.ts](frontend/src/api/axiosInstance.ts)
5. [backend/src/app.ts](backend/src/app.ts)
6. [backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts)
7. [backend/src/services/authService.ts](backend/src/services/authService.ts)
8. [backend/src/config/database.ts](backend/src/config/database.ts)
9. [backend/database/schema.sql](backend/database/schema.sql)

Eso permite ver el flujo completo del dato desde la interacción del usuario hasta la tabla en MariaDB.

---

## 18. Cómo leer el código en el proyecto

Cuando quieras seguir una operación concreta, usa esta secuencia:

Usuario
↓
Componente o página
↓
API frontend
↓
Ruta backend
↓
Controller
↓
Service
↓
SQL
↓
MariaDB
↓
Respuesta JSON
↓
Componente
↓
UI

Si una operación no aparece claramente, lo correcto es decirlo y señalar qué parte falta revisar. En este proyecto, la estructura es suficientemente legible para seguir casi cualquier flujo, pero la ausencia de repositorios formales y de migraciones automáticas es una diferencia importante con arquitecturas más complejas.
