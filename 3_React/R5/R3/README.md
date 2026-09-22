# EstanciaApp — sistema de gestión de campo y ganado

proyecto académico full-stack para gestionar corrales, animales, empleados, tratamientos veterinarios y notificaciones.

## objetivo

EstanciaApp centraliza la información operativa de una estancia ganadera. El frontend permite iniciar sesión y consultar módulos según el rol; el backend expone una api REST; MariaDB conserva los datos de usuarios, animales, corrales, especies, tratamientos y movimientos.

El proyecto está separado en dos aplicaciones:

- `frontend`: interfaz React ejecutada por Vite en el navegador.
- `backend`: servidor Node.js y Express que valida peticiones, aplica permisos y consulta MariaDB.

El navegador nunca se conecta directamente a MariaDB. Siempre llama al backend por HTTP.

## Stack tecnológico

| Capa          | Tecnología                     |
| ------------- | ------------------------------ |
| Frontend      | React 18 + Vite + TypeScript   |
| Backend       | Node.js + Express + TypeScript |
| Base de datos | MariaDB (puerto **3307**)      |
| HTTP Client   | Axios                          |
| Formularios   | react-hook-form                |
| Routing       | React Router v6                |
| Estado        | Context API + useState         |

## Requisitos cumplidos (consigna)

- **Dual login**: useState (sin cambiar URL) y React Router (`/login`)
- **Hooks**: useState, useEffect, useForm (react-hook-form)
- **Persistencia**: localStorage (tema, sesión, preferencias)
- **Context**: AuthContext, ThemeContext, ToastContext
- **API + React**: fetch/Axios contra backend Express
- **Sin `alert()`**: notificaciones toast
- **Modo claro/oscuro** persistido en localStorage
- **Responsive**, modular, atomizado (Atomic Design)
- **BBDD 3FN**: roles, usuarios, corrales, especies, razas, animales, tratamientos
- **OAuth social**: Google, Facebook, GitHub, Discord, Twitch y X, con lista blanca de usuarios y JWT propio.

La configuración, modelo relacional y prueba segura del login social están en [docs/AUTENTICACION_SOCIAL.md](docs/AUTENTICACION_SOCIAL.md).

## conceptos básicos para principiantes

### qué es typescript

TypeScript es JavaScript con tipos. Las interfaces y tipos ayudan al editor y al compilador a detectar datos incorrectos, pero no existen en tiempo de ejecución.

### qué es una api REST

Una api REST recibe peticiones HTTP. El método indica la intención: `GET` consulta, `POST` crea, `PATCH` modifica parcialmente y `DELETE` elimina o desactiva. Las rutas devuelven JSON con información o errores.

### cómo fluye una petición

1. El usuario interactúa con un componente React.
2. El componente llama una función de `frontend/src/api`.
3. Axios envía una petición al backend y agrega el token JWT cuando existe.
4. Express recibe la ruta, ejecuta middleware, controlador y servicio.
5. El servicio consulta MariaDB mediante el pool.
6. El backend devuelve JSON y React actualiza su estado.

### qué es `useState`

`useState` guarda un valor que pertenece a un componente. Al llamar a su función actualizadora, React vuelve a renderizar ese componente. En este proyecto, el login con `useState` muestra un overlay sin cambiar la URL: el valor `showStateLogin` controla si el formulario está visible.

### qué es React Router

React Router asocia URLs con componentes sin recargar toda la página. `AppRouter` decide qué pantalla mostrar para `/`, `/login`, `/dashboard` y las demás rutas. El login con Router navega a `/login`, por lo que la URL identifica la pantalla y el navegador puede usar atrás y adelante.

### diferencias entre los dos login

| aspecto           | login con `useState`                        | login con React Router                      |
| ----------------- | ------------------------------------------- | ------------------------------------------- |
| ubicación         | overlay sobre la pantalla inicial           | página `/login`                             |
| URL               | permanece en `/`                            | cambia a `/login`                           |
| control principal | estado local de `HomeSelectorPage`          | ruta declarada en `AppRouter`               |
| navegación        | se cierra cambiando un booleano             | se cambia con `navigate` o enlaces          |
| resultado         | ambos llaman al mismo `LoginForm` y backend | ambos llaman al mismo `LoginForm` y backend |

El botón se implementa en `frontend/src/pages/HomeSelectorPage.tsx`; la página del segundo flujo está en `frontend/src/pages/login/LoginRouterPage.tsx`.

## Estructura del proyecto

```
R3/
├── README.md
├── img_login.png                 # imagen original (copiada a frontend)
├── backend/
│   ├── database/
│   │   └── schema.sql            # esquema MariaDB 3FN + seeds
│   ├── src/
│   │   ├── config/database.ts
│   │   ├── middleware/           # auth, errores (fase 2)
│   │   ├── routes/               # endpoints REST (fase 2+)
│   │   ├── controllers/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/img_login.png
    │   ├── api/axiosInstance.ts
    │   ├── components/
    │   │   ├── atoms/            # Button, Input, Icon...
    │   │   ├── molecules/        # FormField, MetricCard...
    │   │   ├── organisms/        # Sidebar, LoginForm...
    │   │   └── layouts/          # MainLayout, AuthLayout
    │   ├── contexts/             # Auth, Theme, Toast
    │   ├── hooks/
    │   ├── pages/                # HomeSelector, Login, Dashboard...
    │   ├── routes/AppRouter.tsx
    │   ├── types/
    │   ├── utils/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## Plan de fases

| Fase  | Contenido                                               | Estado    |
| ----- | ------------------------------------------------------- | --------- |
| **1** | Estructura, configs, schema SQL, providers base         | ✅        |
| **2** | Backend: conexión MariaDB, auth JWT, CRUD usuarios      | ✅        |
| **3** | Login dual (useState + Router) con diseño de referencia | ✅        |
| **4** | Dashboard Dueño/Copropietario (métricas, sidebar)       | ✅ Actual |
| **5** | CRUD corrales, animales, especies/razas, empleados      | Pendiente |
| **6** | Interfaces Peón y Veterinario con permisos              | Pendiente |
| **7** | Dark mode, toasts, scroll-to-top, pulido responsive     | Pendiente |

## Configuración local

### 1. Base de datos (MariaDB puerto 3307)

```bash
mysql -u root -P 3307 < backend/database/schema.sql
```

El archivo `backend/database/schema.sql` crea la base `estancia_app`, tablas, relaciones, índices y datos iniciales. La configuración del pool está en `backend/src/config/database.ts`. Allí se cargan las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` desde `.env`; si faltan, se usan `localhost`, `3307`, `root`, contraseña vacía y `estancia_app`. El pool mantiene hasta diez conexiones reutilizables. `testConnection()` obtiene una conexión, ejecuta `ping()` y la libera.

### 2. Backend

```bash
cd backend
cp .env.example .env   # editar credenciales
npm install
npm run dev            # http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Roles y permisos

| Rol                   | Permisos principales                                  |
| --------------------- | ----------------------------------------------------- |
| Dueño / Copropietario | Acceso total, métricas, CRUD completo                 |
| Peón                  | Ver animales, traslados, marcar enfermos → Enfermería |
| Veterinario           | Solo corral Enfermería, tratamientos, dar de alta     |

Los roles se normalizan y etiquetan en `backend/src/utils/roles.ts`. `authMiddleware` valida el JWT y coloca el usuario autenticado en `req.user`; `roleMiddleware` comprueba que el rol tenga permiso antes de llegar al controlador. El backend nunca debe confiar en un rol enviado desde el navegador.

## Usuarios demo (seed)

Contraseña de todos: `Estancia2025!`

| Email                 | Rol           |
| --------------------- | ------------- |
| `dueno@estancia.app`  | Dueño         |
| `coprop@estancia.app` | Copropietario |
| `peon@estancia.app`   | Peón          |
| `vet@estancia.app`    | Veterinario   |

```bash
# después de ejecutar schema.sql
cd backend && npm run seed
```

## Fase 3 — Login dual (probar)

1. Abrí `http://localhost:5173`
2. **Opción A (useState):** la URL queda en `/`, se abre overlay modal
3. **Opción B (Router):** navega a `/login`
4. Iniciá sesión con `dueno@estancia.app` / `Estancia2025!`
5. Verificá que redirige a `/dashboard` y muestra el modo de login usado
6. **Recordarme:** activo → `localStorage`; desactivado → `sessionStorage`
7. Cerrar sesión vuelve a `/`

## API Fase 2

| Método | Ruta                | Auth  | Descripción      |
| ------ | ------------------- | ----- | ---------------- |
| POST   | `/api/auth/login`   | No    | Login → JWT      |
| GET    | `/api/auth/me`      | JWT   | Perfil actual    |
| GET    | `/api/usuarios`     | Admin | Listar empleados |
| POST   | `/api/usuarios`     | Admin | Crear empleado   |
| PATCH  | `/api/usuarios/:id` | Admin | Actualizar       |
| DELETE | `/api/usuarios/:id` | Admin | Desactivar       |

## rutas de la api

Todas las rutas se montan desde `backend/src/app.ts` con el prefijo `/api`.

| módulo         | rutas principales                                                      | uso                                                           |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| salud          | `GET /api/health`                                                      | comprueba api y MariaDB                                       |
| autenticación  | `POST /api/auth/login`, `GET /api/auth/me`, `PATCH /api/auth/password` | iniciar sesión, consultar perfil y cambiar contraseña inicial |
| usuarios       | `GET/POST /api/usuarios`, `PATCH/DELETE /api/usuarios/:id`             | administrar empleados                                         |
| dashboard      | `GET /api/dashboard/summary`                                           | obtener métricas                                              |
| corrales       | `GET/POST /api/corrales`, `PATCH/DELETE /api/corrales/:id`             | administrar corrales                                          |
| especies       | `GET/POST /api/especies`, `PATCH/DELETE /api/especies/:id`             | administrar especies y razas                                  |
| animales       | `GET/POST /api/animales`, `GET/PATCH/DELETE /api/animales/:id`         | administrar animales                                          |
| tratamientos   | `GET/POST/PATCH /api/tratamientos`                                     | registrar y actualizar tratamientos                           |
| notificaciones | `GET/PATCH /api/notificaciones`                                        | consultar y marcar notificaciones                             |

Las rutas concretas y sus middlewares están en `backend/src/routes`. Los controladores convierten HTTP en llamadas a servicios; los servicios contienen las consultas y reglas de negocio.

## autenticación paso a paso

1. `frontend/src/api/authApi.ts` envía email y contraseña a `POST /api/auth/login`.
2. `backend/src/controllers/authController.ts` recibe el cuerpo y llama a `authService.login`.
3. `backend/src/services/authService.ts` busca un usuario activo por email.
4. `backend/src/utils/password.ts` compara la contraseña recibida con `password_hash` usando `bcryptjs.compare`.
5. Si coincide, `backend/src/utils/jwt.ts` firma un JWT con id, email y rol.
6. El backend devuelve el token y un usuario público, nunca `password_hash`.
7. `frontend/src/contexts/AuthContext.tsx` guarda la sesión en `localStorage` si se eligió recordarme o en `sessionStorage` si no.
8. `frontend/src/api/axiosInstance.ts` usa un interceptor para leer el token y enviarlo como `Authorization: Bearer <token>`.
9. `authMiddleware` verifica la firma y la expiración, obtiene el usuario y deja continuar la petición protegida.

### cómo se hashea la contraseña de un usuario nuevo

Cuando se crea o cambia una contraseña, el servicio llama a `hashPassword` en `backend/src/utils/password.ts`. `bcryptjs.hash(password, 10)` genera un salt aleatorio y produce un hash irreversible. Solo ese hash se guarda en `usuarios.password_hash`; la contraseña original no se guarda. Para iniciar sesión se usa `compare`, que calcula la comparación contra el salt incluido en el hash.

El alta de usuarios ocurre en `backend/src/services/usuarioService.ts`. La contraseña temporal se hashea antes del `INSERT` y `debe_cambiar_password` queda activo. En el primer ingreso, `cambiarPasswordInicial` exige al menos seis caracteres, vuelve a hashear la nueva contraseña y desactiva esa obligación.

## estructura y responsabilidades

- `backend/src/config`: conexión y configuración externa.
- `backend/src/routes`: métodos, paths y middleware de cada módulo.
- `backend/src/controllers`: entrada y salida HTTP.
- `backend/src/services`: reglas de negocio y SQL parametrizado.
- `backend/src/middleware`: autenticación, autorización y errores.
- `frontend/src/api`: funciones que llaman al backend.
- `frontend/src/contexts`: sesión, tema y toasts compartidos.
- `frontend/src/pages`: pantallas completas.
- `frontend/src/components`: piezas reutilizables organizadas como atoms, molecules y organisms.
- `frontend/src/routes`: decisión de pantalla según URL y sesión.

## estado, efectos y formularios

`useState` controla valores locales, como campos y modales. `useEffect` ejecuta tareas relacionadas con el ciclo de vida, por ejemplo cargar datos al entrar a una página. `react-hook-form` registra campos, valida formularios y evita manejar manualmente cada cambio. Los Context usan `useContext` para compartir sesión, tema y notificaciones sin pasar props por muchos niveles.

## modularización pendiente

Los archivos propios más extensos se detallan al final de este documento. El criterio usado es tamaño y mezcla de responsabilidades: separar tabla, formulario, filtros, modales y llamadas auxiliares reduce el costo de mantenimiento sin alterar la api pública.

### archivos que conviene modularizar

- `frontend/src/pages/peon/PeonPage.tsx` y `PeonPage.module.css`
- `frontend/src/pages/animales/AnimalesPage.tsx` y `AnimalesPage.module.css`
- `frontend/src/pages/veterinario/VeterinarioPage.tsx` y `VeterinarioPage.module.css`
- `frontend/src/pages/equipo/EquipoPage.tsx` y `EquipoPage.module.css`
- `frontend/src/pages/corrales/CorralesPage.tsx` y `CorralesPage.module.css`
- `backend/src/services/animalService.ts`
- `backend/database/schema.sql`
