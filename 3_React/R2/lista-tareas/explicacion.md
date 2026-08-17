# Explicación del Proyecto

Este es un sistema académico y sencillo de gestión de tareas. Su propósito es demostrar conceptos de React, utilizando herramientas modernas como Vite y TypeScript.

A continuación detallo cómo funcionan las partes más importantes del código.

## 1. Tecnologías utilizadas

- **React:** Se utilizó como biblioteca principal para construir la interfaz basándonos en componentes.
- **TypeScript:** Se utilizó para añadir tipos estáticos al código, previniendo errores comunes y facilitando el uso de `interface` para definir la estructura de nuestra `Tarea`.
- **Vite:** Es la herramienta de compilación y servidor de desarrollo que nos permite trabajar de manera muy rápida.
- **React Router:** Se utilizó para la navegación entre distintas páginas (`/`, `/crear`, `/tarea/:id`) sin que el navegador recargue la página completa.
- **Bootstrap:** Se implementó como framework visual, usando su sistema de grillas (container, row, col) y clases utilitarias para lograr que la aplicación sea responsiva.

## 2. Estado de React (useState)

En React, cuando necesitamos guardar información que puede cambiar a lo largo del tiempo y queremos que la pantalla se actualice cuando cambia, usamos el hook `useState`.

En nuestro archivo `App.tsx` guardamos la lista de tareas usando:
```tsx
const [tareas, setTareas] = useState<Tarea[]>(tareasIniciales);
```

- `tareas`: Es el arreglo donde se guardan nuestras tareas.
- `setTareas`: Es la función que llamamos cuando queremos agregar, editar o eliminar una tarea.

Centralizamos este estado en `App.tsx` para que pueda ser compartido con las demás páginas mediante "props".

## 3. Navegación (React Router)

Usamos varios componentes que nos provee React Router:
- **BrowserRouter**: Envuelve nuestra aplicación habilitando el manejo de rutas.
- **Routes y Route**: Definen qué componente (página) debe mostrarse según la ruta en la barra de direcciones.
- **Link**: Lo usamos en lugar de las etiquetas `<a>` tradicionales para navegar sin recargar la página.

Cuando necesitamos buscar una tarea específica en la página de detalle (`/tarea/:id`), usamos el hook `useParams()` para leer el id directamente de la URL:
```tsx
const { id } = useParams();
const tarea = tareas.find(t => t.id === Number(id));
```

## 4. Formularios y Eventos (onSubmit)

En la página de crear tarea (`CrearTarea.tsx`), gestionamos la creación interceptando el evento natural de envío del formulario. En lugar de usar botones sueltos, usamos el evento `onSubmit` directamente en la etiqueta `<form>`:

```tsx
<form onSubmit={manejarEnvio}>
```

En la función `manejarEnvio(e: React.FormEvent)`, hacemos lo siguiente:
1. `e.preventDefault();` -> Esto evita que el navegador recargue toda la página al enviar el formulario (que es el comportamiento clásico de HTML).
2. Recuperamos los valores de los inputs que guardamos con `useState` (título, descripción y estado).
3. Validamos que no estén vacíos y que se haya seleccionado un estado.
4. Creamos un nuevo objeto de tarea generando su propio ID (con `Date.now()`) y fecha.
5. Usamos la función `agregarTarea(nuevaTarea)` que nos pasaron desde `App.tsx` para guardar la tarea definitivamente en la lista principal.
6. Finalmente, usamos `navigate('/')` para llevar al usuario de regreso a la pantalla de inicio.

## 5. Eliminar Tarea y Cambiar Estado

Desde el detalle de una tarea, el usuario puede marcarla como completa o eliminarla. Ambas acciones utilizan el evento `onClick` en los botones, y llaman a funciones que declaramos en `App.tsx`.

- **Cambio de Estado:** `cambiarEstadoTarea(id)` recibe el id de la tarea, busca esa tarea en el arreglo y simplemente invierte su estado `completa` de true a false o viceversa, actualizando todo mediante `setTareas()`.
- **Eliminar Tarea:** En lugar de usar `alert()` o `confirm()`, la aplicación muestra un cuadro rojo integrado visualmente en la pantalla usando renderizado condicional. Si el usuario confirma, llamamos a `eliminarTarea(id)`, que usa el método `.filter()` para quitar la tarea del arreglo y actualizar el estado general.

## 6. Modo Claro y Oscuro

Para el cambio de tema se implementó un `ThemeContext`. Es un estado global accesible para toda la aplicación.
- Guarda el estado `tema` que puede ser 'claro' o 'oscuro'.
- Proporciona una función `alternarTema()`.
- Guarda nuestra preferencia en `localStorage` (memoria del navegador) para que si recargamos la página, el navegador recuerde nuestro modo preferido.
- Le asigna dinámicamente un atributo al `<body>` llamado `data-theme="oscuro"`, lo que permite que nuestro archivo `index.css` modifique los colores en pantalla usando variables de CSS.
