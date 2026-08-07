# Explicación del proyecto — Lista de Tareas

Esta explicación está escrita para alguien que recién empieza con React.

---

## ¿Qué hace cada componente?

### Header.tsx
Muestra el título de la app ("Lista de Tareas") y el botón para cambiar entre modo claro y oscuro. Usa el contexto de tema para saber en qué modo está y para cambiar al otro.

### TaskForm.tsx
Es el formulario donde el usuario escribe una nueva tarea y la agrega. Tiene un input de texto, un botón "Agregar" y un mensaje de error. El botón está deshabilitado si el input está vacío. Si el usuario intenta enviar el formulario con solo espacios, aparece un mensaje de error debajo del input.

### TaskItem.tsx
Representa una sola tarea. Muestra un checkbox, el texto de la tarea, la fecha en que fue creada y un botón para eliminarla. Si la tarea está completada, el texto aparece tachado y con un color diferente.

### TaskList.tsx
Muestra el listado de tareas. Usa `map()` para recorrer el arreglo y mostrar un `TaskItem` por cada tarea. Si el arreglo está vacío, muestra un mensaje indicando que no hay tareas.

### TaskTabs.tsx
Son tres botones que funcionan como pestañas: Todas, Pendientes y Completadas. Al hacer clic en una, cambia la pestaña activa y la lista se filtra según el estado de las tareas.

### Footer.tsx
Muestra tres contadores al pie de la pantalla: total de tareas, cuántas están pendientes y cuántas están completadas.

---

## ¿Cómo funciona useState?

`useState` es un hook de React que permite guardar información dentro de un componente y que, cuando esa información cambia, React vuelve a renderizar el componente.

```tsx
const [texto, setTexto] = useState<string>('');
```

- `texto` es el valor actual
- `setTexto` es la función que lo cambia
- `''` es el valor inicial

Cada vez que llamamos `setTexto('algo')`, React actualiza la pantalla con el nuevo valor.

En esta app usamos `useState` para guardar:
- El arreglo de tareas
- El texto del input
- El texto del buscador
- La pestaña activa
- Si mostrar o no el botón de volver arriba

---

## ¿Cómo funciona useEffect?

`useEffect` es un hook que permite ejecutar código cuando algo cambia o cuando el componente aparece en pantalla.

```tsx
useEffect(() => {
  localStorage.setItem('tareas', JSON.stringify(tareas));
}, [tareas]);
```

El código dentro del `useEffect` se ejecuta cada vez que el valor de `tareas` cambia. Así, cada vez que se agrega, elimina o completa una tarea, la lista se guarda automáticamente en localStorage.

También usamos `useEffect` para:
- Guardar el modo de tema en localStorage
- Aplicar la clase CSS al body cuando cambia el tema
- Escuchar el evento de scroll para mostrar el botón de volver arriba

---

## ¿Cómo funciona map()?

`map()` es un método de los arreglos en JavaScript. Recorre cada elemento y devuelve uno nuevo. En React lo usamos para mostrar una lista de elementos.

```tsx
tareas.map((tarea) => (
  <TaskItem key={tarea.id} tarea={tarea} />
))
```

Por cada tarea del arreglo, crea un componente `TaskItem`. La prop `key` es obligatoria y ayuda a React a identificar cada elemento de manera única.

---

## ¿Cómo funciona localStorage?

`localStorage` es una herramienta del navegador que permite guardar información de forma permanente, incluso si se recarga la página o se cierra el navegador.

```tsx
// guardar
localStorage.setItem('tareas', JSON.stringify(tareas));

// recuperar
const guardadas = localStorage.getItem('tareas');
const tareas = JSON.parse(guardadas);
```

- `setItem` guarda un valor con una clave
- `getItem` lo recupera
- `JSON.stringify` convierte el arreglo a texto para poder guardarlo
- `JSON.parse` lo convierte de vuelta a un arreglo

En esta app guardamos las tareas y el modo de tema en localStorage.

---

## ¿Cómo funciona el modo oscuro?

El modo oscuro se maneja con un `useState` en `App.tsx`, igual que cualquier otro estado.

```tsx
const [modoOscuro, setModoOscuro] = useState<boolean>(false);
```

Cuando cambia, un `useEffect` guarda el valor en localStorage y aplica una clase CSS al `body`:

```tsx
useEffect(() => {
  localStorage.setItem('modoOscuro', String(modoOscuro));
  if (modoOscuro) {
    document.body.classList.add('modo-oscuro');
  } else {
    document.body.classList.add('modo-claro');
  }
}, [modoOscuro]);
```

La función `toggleModo` y el valor `modoOscuro` se pasan por props al `Header`, que muestra el botón para cambiar el tema.

---

## ¿Cómo se agregan tareas?

1. El usuario escribe en el input de `TaskForm`
2. Al hacer clic en "Agregar" (o presionar Enter), se dispara `handleSubmit`
3. Se valida que el texto no esté vacío
4. Se llama a `onAgregar(texto)` que es una función enviada desde `App.tsx`
5. En `App.tsx`, `agregarTarea` crea un objeto nuevo con `id`, `texto`, `completada: false` y `fechaCreacion`
6. Se agrega al arreglo con `setTareas([...tareas, nuevaTarea])`
7. React vuelve a renderizar la lista con la nueva tarea

---

## ¿Cómo se eliminan tareas?

1. El usuario hace clic en el ícono de papelera en un `TaskItem`
2. Se llama a `onEliminar(tarea.id)`
3. En `App.tsx`, `eliminarTarea` filtra el arreglo con `filter()` y excluye la tarea con ese id
4. Se actualiza el estado con `setTareas(filtradas)`
5. React vuelve a renderizar sin esa tarea

---

## ¿Cómo se completan tareas?

1. El usuario hace clic en el checkbox de un `TaskItem`
2. Se llama a `onCompletar(tarea.id)`
3. En `App.tsx`, `completarTarea` recorre el arreglo con `map()` y cambia `completada` al valor opuesto para la tarea con ese id
4. Se actualiza el estado con `setTareas(actualizadas)`
5. React vuelve a renderizar con el texto tachado y el color diferente

---

## Diagrama de flujo simplificado

```
App.tsx (tiene el estado de tareas)
  ↓ pasa onAgregar       → TaskForm.tsx
  ↓ pasa tareas filtradas → TaskList.tsx → TaskItem.tsx (onCompletar, onEliminar)
  ↓ pasa contadores       → Footer.tsx
  ↓ pasa tabActiva        → TaskTabs.tsx
  ↓ usa contexto          → Header.tsx (toggle de tema)
```
