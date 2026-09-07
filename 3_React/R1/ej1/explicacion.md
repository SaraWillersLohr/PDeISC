# Explicación del proyecto — Hola Mundo

Este documento explica cómo funciona el proyecto de forma sencilla.  
Está pensado para alguien que está aprendiendo React por primera vez.

---

## ¿Qué hace cada componente?

### HolaMundo.tsx

Es el componente principal que muestra el mensaje "¡Hola Mundo!".

Tiene dos partes:

- **La escena visual**: Dibuja un cielo con estrellas (en modo oscuro), un sol (en modo claro) y un planeta tierra con continentes. Todo esto se hace con CSS puro, sin imágenes.
- **El contenido**: Muestra un badge azul, el título "¡Hola Mundo!" y el texto "Ejercicio 1".

Este componente no tiene estado propio. Solo renderiza lo que le dice App.tsx.

### CambioTema.tsx

Es un botón que permite cambiar entre modo claro y modo oscuro.

Recibe dos props:

- `darkMode`: un booleano que dice si el modo oscuro está activo
- `setDarkMode`: una función para cambiar el valor de darkMode

Cuando el usuario hace clic, cambia el modo y muestra un icono diferente (sol en modo claro, luna en modo oscuro).

### App.tsx

Es el componente que maneja todo el estado de la app.

Guarda un estado `darkMode` que controla si la aplicación está en modo claro u oscuro. Cada vez que cambia, ejecuta un `useEffect` que agrega o quita clases CSS del `body` para aplicar los estilos correspondientes.

---

## useState

`useState` es la forma que tiene React de recordar información entre renders.

En este proyecto:

```tsx
const [darkMode, setDarkMode] = useState(true);
```

- `darkMode` es el valor actual (empieza en `true`, así que arranca en modo oscuro)
- `setDarkMode` es la función para cambiarlo
- Cada vez que llamamos a `setDarkMode(nuevoValor)`, React actualiza el estado y redibuja el componente

---

## useEffect

`useEffect` es un hook que permite ejecutar código en momentos específicos.

En este proyecto, cada vez que `darkMode` cambia, queremos cambiar las clases CSS del body:

```tsx
useEffect(() => {
  document.body.classList.toggle("dark", darkMode);
  document.body.classList.toggle("light", !darkMode);
}, [darkMode]);
```

El array `[darkMode]` es la lista de dependencias. Dice: "ejecuta este código cada vez que darkMode cambie".

Gracias a esto, cuando el usuario cambia el tema, inmediatamente se aplican los estilos correctos.

---

## Las props

Las props son la forma en que los componentes se comunican entre sí.

App.tsx le pasa a CambioTema dos props:

```tsx
<CambioTema darkMode={darkMode} setDarkMode={setDarkMode} />
```

CambioTema recibe esas props y las usa:

```tsx
function CambioTema({ darkMode, setDarkMode }: CambioTemaProps) {
  return (
    <button onClick={() => setDarkMode((previous) => !previous)}>
      {darkMode ? <FaMoon /> : <FaSun />}
    </button>
  );
}
```

Cuando el usuario hace clic, llama a `setDarkMode` con el valor opuesto. App.tsx se entera, actualiza el estado y redibuja todo.

---

## CSS y clases dinámicas

Las clases CSS se aplican y se quitan usando JavaScript.

Cuando `darkMode` es `true`, el body tiene la clase `dark`. Cuando es `false`, tiene la clase `light`.

```tsx
document.body.classList.toggle("dark", darkMode);
document.body.classList.toggle("light", !darkMode);
```

El archivo CSS tiene reglas como:

```css
body.dark {
  background-color: #1a1a1a;
  color: #ffffff;
}

body.light {
  background-color: #ffffff;
  color: #000000;
}
```

Así, solo con cambiar la clase, todo el tema de la página cambia.

---

## Las clases BEM

BEM significa Block, Element, Modifier. Es una forma de nombrar clases CSS para que sean más organizadas.

En este proyecto:

```css
.hm-tarjeta {
} /* block: la tarjeta principal */
.hm-escena {
} /* element: la escena dentro de la tarjeta */
.hm-estrella {
} /* element: una estrella */
.hm-estrella--1 {
} /* modifier: la estrella 1 */
.hm-tierra {
} /* element: la tierra */
.hm-tierra__continente {
} /* sub-element: un continente de la tierra */
```

Esto hace que sea fácil entender qué CSS va con qué elemento, sin confusiones.

---
