# Explicación del proyecto — Contador

Este documento explica cómo funciona el proyecto de forma sencilla.  
Está pensado para alguien que está aprendiendo React por primera vez.

---

## ¿Qué hace cada componente?

### Counter.tsx

Es el componente principal que maneja toda la lógica del contador.

Guarda un estado `contador` con el valor actual. Tiene tres funciones:

- `incrementar()`: suma 1 al contador
- `disminuir()`: resta 1 al contador (pero no permite ir por debajo de 0)
- `reiniciar()`: pone el contador en 0

El componente también renderiza dos componentes hijos: `CounterDisplay` y `CounterButtons`.

### CounterDisplay.tsx

Es un componente que solo muestra el valor del contador.

Recibe un prop `contador` y lo dibuja en un círculo grande. No tiene estado propio. Solo recibe datos del padre y los muestra.

### CounterButtons.tsx

Es un componente que muestra tres botones para controlar el contador.

Recibe cuatro props:

- `contador`: el valor actual (para saber si debe desabilitar el botón de restar)
- `incrementar()`: función para sumar
- `disminuir()`: función para restar
- `reiniciar()`: función para volver a cero

Cuando el usuario hace clic en un botón, llama a la función correspondiente, que actualiza el estado en Counter.tsx.

---

## useState

`useState` es la forma que tiene React de recordar información entre renders.

En este proyecto:

```tsx
const [contador, setContador] = useState(0);
```

- `contador` es el valor actual (empieza en 0)
- `setContador` es la función para cambiarlo
- Cada vez que llamamos a `setContador(nuevoValor)`, React actualiza el estado y redibuja el componente

Las tres funciones que manejan el contador son:

```tsx
function incrementar() {
  setContador(contador + 1); // suma 1
}

function disminuir() {
  if (contador > 0) {
    // solo si es mayor que 0
    setContador(contador - 1); // resta 1
  }
}

function reiniciar() {
  setContador(0); // vuelve a 0
}
```

---

## useEffect

`useEffect` es un hook que permite ejecutar código en momentos específicos.

En este proyecto, hay dos `useEffect` en App.tsx:

### Cargar el tema guardado

```tsx
useEffect(() => {
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") {
    setModoOscuro(true);
  }
}, []); // [] significa: ejecuta solo una vez, al iniciar
```

Cuando la app carga, lee el tema del `localStorage` (la memoria del navegador) y lo aplica. Así, si el usuario cerró con tema oscuro, al abrir de nuevo verá tema oscuro.

### Guardar el tema cuando cambia

```tsx
useEffect(() => {
  localStorage.setItem("tema", modoOscuro ? "oscuro" : "claro");
}, [modoOscuro]); // [modoOscuro] significa: ejecuta cuando modoOscuro cambie
```

Cada vez que el usuario cambia el tema, se guarda en `localStorage`.

---

## Las props

Las props son la forma en que los componentes comparten información.

Counter.tsx pasa props a sus componentes hijos:

```tsx
<CounterDisplay contador={contador} />

<CounterButtons
  contador={contador}
  incrementar={incrementar}
  disminuir={disminuir}
  reiniciar={reiniciar}
/>
```

CounterButtons es un componente inteligente porque recibe las funciones del padre. Cuando el usuario hace clic, llama a esas funciones, que actualizan el estado en el padre.

---

## LocalStorage

`localStorage` es una forma de guardar información en el navegador.

La información se guarda incluso después de cerrar la pestaña. La próxima vez que abras el sitio, sigue siendo la misma.

```tsx
// Guardar
localStorage.setItem("tema", "oscuro");

// Leer
const tema = localStorage.getItem("tema");

// Eliminar
localStorage.removeItem("tema");
```

En este proyecto, se usa para recordar el tema que el usuario eligió.

**Nota importante**: localStorage solo guarda texto. Si quieres guardar números u objetos, debes convertirlos a JSON primero.

---

## Booleanos y ternarios

En TypeScript/JavaScript, un booleano es un valor que es `true` o `false`.

```tsx
const [modoOscuro, setModoOscuro] = useState(false);
```

Para cambiar un booleano, se usa la negación (`!`):

```tsx
setModoOscuro(!modoOscuro); // invierte true/false
```

Para mostrar contenido diferente según un booleano, usamos el operador ternario (`? :`):

```tsx
<div className={modoOscuro ? "dark" : "light"}>
  {modoOscuro ? <FaMoon /> : <FaSun />}
</div>
```

Si `modoOscuro` es `true`, muestra `"dark"` y la luna.  
Si `modoOscuro` es `false`, muestra `"light"` y el sol.

---

## Desabilitar botones

En CounterButtons, el botón de restar se deshabilita cuando el contador es 0:

```tsx
<button disabled={contador === 0} onClick={disminuir}>
  Restar
</button>
```

El atributo `disabled` es un booleano. Si es `true`, el botón se ve gris y no responde a clicks.

---
