# Explicación del proyecto — Lista de Tareas

Este documento explica cómo funciona el proyecto de forma sencilla.  
Está pensado para alguien que está aprendiendo React por primera vez.

---

## ¿Qué hace cada componente?

### Header.tsx

Muestra el título de la app ("Lista de Tareas") y el botón para cambiar entre modo claro y oscuro.  
No maneja ningún estado propio. Solo recibe el tema desde App.tsx.

### TaskForm.tsx

Es el formulario donde el usuario escribe una nueva tarea y la agrega.

Tiene:

- Un input de texto donde el usuario escribe
- Un botón "Agregar"
- Un mensaje de error si algo está mal

Valida que el texto no esté vacío. Si el usuario intenta enviar una tarea vacía, muestra un error rojo.

### TaskItem.tsx

Representa una sola tarea en la lista.

Muestra:

- Un checkbox para marcar/desmarcar como completada
- El texto de la tarea (con tachado si está completada)
- La fecha en que fue creada
- Un botón para eliminarla

Cuando el usuario hace clic en el checkbox, llama a `onCompletar`. Cuando hace clic en el botón de basura, llama a `onEliminar`.

### TaskList.tsx

Muestra el listado completo de tareas.

Usa `map()` para recorrer el arreglo de tareas y renderizar un `TaskItem` por cada una. Si el arreglo está vacío, muestra un mensaje indicando que no hay tareas.

### TaskTabs.tsx

Tres botones que funcionan como pestañas: **Todas**, **Pendientes** y **Completadas**.

Cuando el usuario hace clic en una pestaña, cambia el filtro. La lista se redibuja mostrando solo las tareas que coinciden con ese filtro.

### Footer.tsx

Muestra estadísticas al pie de la pantalla: total de tareas, cuántas están pendientes y cuántas están completadas.

---

## ¿Cómo funciona el estado?

App.tsx es el corazón de la app. Guarda tres estados principales:

```tsx
const [tareas, setTareas] = useState<Task[]>([]); // el arreglo de tareas
const [tabActiva, setTabActiva] = useState<TabActiva>("todas"); // qué filtro
const [modoOscuro, setModoOscuro] = useState<boolean>(false); // tema
```

- `tareas`: un arreglo vacío al iniciar. Cada elemento es un objeto `Task`.
- `tabActiva`: qué pestaña está seleccionada ('todas', 'pendientes' o 'completadas')
- `modoOscuro`: si el tema oscuro está activado

---

## Las interfaces (tipos)

Una interfaz define la estructura de un objeto.

```tsx
export interface Task {
  id: number; // número único para cada tarea
  texto: string; // lo que escribe el usuario
  completada: boolean; // si ya la completó
  fechaCreacion: string; // cuándo la creó
}
```

Así, TypeScript sabe que cada tarea tiene estas cuatro propiedades. Si intentas acceder a `tarea.nombre` (que no existe), TypeScript te lo indica como error.

---

## ¿Cómo funciona map()?

`map()` es un método de los arreglos en JavaScript. Recorre cada elemento y devuelve otro arreglo con los resultados.

En React lo usamos para mostrar una lista:

```tsx
tareas.map((tarea) => (
  <TaskItem
    key={tarea.id}
    tarea={tarea}
    onCompletar={marcarComoCompletada}
    onEliminar={eliminarTarea}
  />
));
```

Para cada tarea en el arreglo, renderiza un `<TaskItem>`.

**Importante**: el atributo `key` debe ser único. En este proyecto, usamos `tarea.id` porque cada tarea tiene un id diferente.

---

## CRUD: Create, Read, Update, Delete

### Create (Agregar)

```tsx
function agregarTarea(texto: string) {
  const nuevaTarea: Task = {
    id: Date.now(), // usa la fecha como id (casi nunca se repite)
    texto: texto,
    completada: false,
    fechaCreacion: new Date().toLocaleDateString(),
  };
  setTareas([...tareas, nuevaTarea]); // agrega al final del arreglo
}
```

Cuando el usuario envía el formulario, esta función crea una nueva tarea y la agrega al arreglo.

### Read (Leer/Filtrar)

Las tareas se leen y filtran según la pestaña activa:

```tsx
const tareasFiltradas = tareas.filter((tarea) => {
  if (tabActiva === "pendientes") return !tarea.completada;
  if (tabActiva === "completadas") return tarea.completada;
  return true; // 'todas': devuelve todas
});
```

Esto crea un nuevo arreglo con solo las tareas que cumplen la condición.

### Update (Actualizar)

Para marcar una tarea como completada:

```tsx
function marcarComoCompletada(id: number) {
  setTareas(
    tareas.map((tarea) => {
      if (tarea.id === id) {
        return { ...tarea, completada: !tarea.completada }; // invierte
      }
      return tarea; // las otras tareas quedan igual
    }),
  );
}
```

Usamos `map()` para recorrer todas las tareas. La que coincide con `id`, la copiamos y cambiamos `completada`. Las demás, las devolvemos sin cambios.

### Delete (Eliminar)

```tsx
function eliminarTarea(id: number) {
  setTareas(tareas.filter((tarea) => tarea.id !== id));
}
```

Usamos `filter()` para crear un arreglo nuevo que incluya todas las tareas EXCEPTO la que tiene ese `id`.

---

## useEffect

El proyecto usa `useEffect` para varias cosas:

### Guardar en localStorage

```tsx
useEffect(() => {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}, [tareas]);
```

Cada vez que `tareas` cambia, se guarda en `localStorage`. Así, si el usuario cierra la página, al volver las tareas siguen siendo las mismas.

### Cargar desde localStorage

```tsx
useEffect(() => {
  const guardadas = localStorage.getItem("tareas");
  if (guardadas) {
    setTareas(JSON.parse(guardadas));
  }
}, []);
```

Cuando la app inicia, lee las tareas guardadas desde `localStorage` y las carga.

**Nota**: `JSON.stringify()` convierte un objeto a texto. `JSON.parse()` lo convierte de vuelta a objeto.

---

## Mutabilidad vs Inmutabilidad

En React, NUNCA debes modificar un estado directamente. Siempre debes crear un nuevo objeto/arreglo.

❌ **INCORRECTO**:

```tsx
tareas[0].texto = "Nueva tarea"; // modifica el estado directamente
setTareas(tareas); // React no nota el cambio
```

✅ **CORRECTO**:

```tsx
const nuevaTareas = tareas.map((tarea) => {
  if (tarea.id === 0) {
    return { ...tarea, texto: "Nueva tarea" }; // crea una copia nueva
  }
  return tarea;
});
setTareas(nuevaTareas);
```

Usamos el operador `...` (spread operator) para copiar un objeto:

```tsx
const copia = { ...original, propiedad: nuevoValor };
```

Esto crea una copia y cambia una propiedad. El original queda igual.

---

## Spread operator

El spread operator (`...`) expande un objeto o arreglo.

### Con arreglos:

```tsx
const arreglo = [1, 2, 3];
const copia = [...arreglo]; // copia: [1, 2, 3]
const conMas = [...arreglo, 4]; // [1, 2, 3, 4]
```

### Con objetos:

```tsx
const objeto = { nombre: "Juan", edad: 30 };
const copia = { ...objeto }; // copia igual
const conCambios = { ...objeto, edad: 31 }; // edad cambia a 31
```

---

## Validación

En TaskForm, la validación se hace así:

```tsx
function handleSubmit(evento: React.FormEvent<HTMLFormElement>) {
  evento.preventDefault(); // evita que la página se recargue

  if (texto.trim() === "") {
    setError("El texto no puede estar vacío.");
    return;
  }

  onAgregar(texto.trim()); // agrega la tarea
  setTexto(""); // limpia el input
  setError(""); // limpia el error
}
```

`trim()` elimina espacios al inicio y al final. Así, " " (solo espacios) se considera vacío.

---

## Condicionales en JSX

Para mostrar u ocultar elementos según una condición:

```tsx
{
  error && <p className="error">{error}</p>;
}
```

Esto dice: "si `error` tiene contenido, muestra el párrafo". Si `error` es vacío (falsy), no muestra nada.

También puedes usar el operador ternario:

```tsx
{
  tareas.length === 0 ? <p>No hay tareas</p> : <ul>{/* tareas aquí */}</ul>;
}
```

Si `tareas.length === 0`, muestra "No hay tareas". Si no, muestra la lista.

---
