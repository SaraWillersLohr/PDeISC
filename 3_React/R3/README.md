# EstanciaApp — Sistema de Gestión de Campo y Ganado

Proyecto académico full-stack para gestión de estancias: corrales, animales, empleados y tratamientos veterinarios.

## Stack tecnológico

| Capa        | Tecnología                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite + TypeScript        |
| Backend     | Node.js + Express + TypeScript      |
| Base de datos | MariaDB (puerto **3307**)         |
| HTTP Client | Axios                             |
| Formularios | react-hook-form                   |
| Routing     | React Router v6                     |
| Estado      | Context API + useState              |

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

| Fase | Contenido | Estado |
|------|-----------|--------|
| **1** | Estructura, configs, schema SQL, providers base | ✅ |
| **2** | Backend: conexión MariaDB, auth JWT, CRUD usuarios | ✅ |
| **3** | Login dual (useState + Router) con diseño de referencia | ✅ |
| **4** | Dashboard Dueño/Copropietario (métricas, sidebar) | ✅ Actual |
| **5** | CRUD corrales, animales, especies/razas, empleados | Pendiente |
| **6** | Interfaces Peón y Veterinario con permisos | Pendiente |
| **7** | Dark mode, toasts, scroll-to-top, pulido responsive | Pendiente |

## Configuración local

### 1. Base de datos (MariaDB puerto 3307)

```bash
mysql -u root -P 3307 < backend/database/schema.sql
```

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

| Rol | Permisos principales |
|-----|----------------------|
| Dueño / Copropietario | Acceso total, métricas, CRUD completo |
| Peón | Ver animales, traslados, marcar enfermos → Enfermería |
| Veterinario | Solo corral Enfermería, tratamientos, dar de alta |

## Usuarios demo (seed)

Contraseña de todos: `Estancia2025!`

| Email | Rol |
|-------|-----|
| `dueno@estancia.app` | Dueño |
| `coprop@estancia.app` | Copropietario |
| `peon@estancia.app` | Peón |
| `vet@estancia.app` | Veterinario |

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

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login → JWT |
| GET | `/api/auth/me` | JWT | Perfil actual |
| GET | `/api/usuarios` | Admin | Listar empleados |
| POST | `/api/usuarios` | Admin | Crear empleado |
| PATCH | `/api/usuarios/:id` | Admin | Actualizar |
| DELETE | `/api/usuarios/:id` | Admin | Desactivar |
