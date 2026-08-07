# Lista de Tareas — Ej4

Aplicación de lista de tareas desarrollada con React + TypeScript + Vite.

## Tecnologías utilizadas

- React 19
- TypeScript
- Vite
- CSS (sin librerías de estilos)
- Lucide React (iconos)

## Funcionalidades

- Agregar tareas
- Eliminar tareas
- Marcar y desmarcar tareas como completadas
- Buscador de tareas
- Filtro por pestañas: Todas / Pendientes / Completadas
- Contador total, pendientes y completadas
- Guardado automático en localStorage
- Recuperación automática al recargar la página
- Mensaje cuando no hay tareas
- Modo claro y modo oscuro
- Botón flotante para volver arriba
- Validaciones en el formulario
- Diseño responsive

## Estructura del proyecto

```
src/
├── components/
│   ├── Header.tsx       → encabezado con título y botón de tema
│   ├── TaskForm.tsx     → formulario para agregar tareas
│   ├── TaskItem.tsx     → una tarea individual
│   ├── TaskList.tsx     → lista de tareas
│   ├── TaskTabs.tsx     → pestañas de filtro
│   └── Footer.tsx       → contadores al pie
├── types/
│   └── Task.ts          → interfaz TypeScript de una tarea
├── styles/
│   ├── app.css          → estilos principales
│   ├── light.css        → variables del modo claro
│   └── dark.css         → variables del modo oscuro
├── App.tsx              → componente raíz con el estado principal
└── main.tsx             → punto de entrada
```

## Cómo correr el proyecto

```bash
npm install
npm run dev
```
