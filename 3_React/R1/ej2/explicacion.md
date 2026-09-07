# Explicación del proyecto — Tarjeta de Presentación

Este documento explica cómo funciona el proyecto de forma sencilla.  
Está pensado para alguien que está aprendiendo React por primera vez.

---

## ¿Qué hace cada componente?

### Tarjeta.tsx

Es el componente principal que muestra la tarjeta de presentación.

Recibe cuatro props:

- `nombre`: el nombre de la persona
- `apellido`: el apellido
- `profesion`: la profesión o título
- `imagen`: la URL de la foto de perfil

La tarjeta muestra la imagen en la parte superior y los datos (nombre, apellido y profesión) debajo. También tiene un efecto visual especial (BorderGlow) que hace un brillo alrededor de la tarjeta.

Este componente es totalmente reutilizable. Si cambias los props, cambia la información que muestra.

### CambioTema.tsx

Es un botón que permite cambiar entre modo claro y modo oscuro.

Recibe dos props:

- `isDark`: un booleano que dice si el modo oscuro está activo
- `onToggle`: una función que se ejecuta cuando el usuario hace clic

Cuando el usuario hace clic, llama a `onToggle`, que es una función que pasa App.tsx.

### App.tsx

Es el componente que maneja todo el estado de la app.

Guarda un estado `isDark` que controla si la aplicación está en modo claro u oscuro. Cada vez que cambia, ejecuta un `useEffect` que actualiza el atributo `data-theme` del `<html>` de la página.

---

## useState

`useState` es la forma que tiene React de recordar información entre renders.

En este proyecto:

```tsx
const [isDark, setIsDark] = useState<boolean>(
  () => window.matchMedia("(prefers-color-scheme: dark)").matches,
);
```

Esto es un poco más complejo que un `useState` simple:

- La función `() => window.matchMedia(...)` se ejecuta solo una vez, al iniciar
- Verifica la preferencia del sistema operativo (si el usuario prefiere tema oscuro)
- Usa eso como valor inicial

Cada vez que el usuario cambia el tema con el botón, `setIsDark` actualiza el estado y React redibuja todo.

---

## useEffect

`useEffect` es un hook que permite ejecutar código en momentos específicos.

En este proyecto:

```tsx
useEffect(() => {
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );
}, [isDark]);
```

Cada vez que `isDark` cambia, el código dentro del `useEffect` se ejecuta. Cambia el atributo `data-theme` en el `<html>` de la página.

El CSS usa ese atributo para aplicar los estilos:

```css
[data-theme="dark"] {
  --color-background: #1a1a1a;
  --color-text: #ffffff;
}

[data-theme="light"] {
  --color-background: #ffffff;
  --color-text: #000000;
}
```

---

## Las props y las interfaces

Las props son la forma en que los componentes se comunican entre sí.

Pero en TypeScript, las props deben tener un tipo. Por eso usamos interfaces:

```tsx
interface TarjetaProps {
  nombre: string;
  apellido: string;
  profesion: string;
  imagen: string;
}
```

Esta interfaz dice: "Tarjeta recibe una prop llamada `nombre` que es texto, una prop `apellido` que es texto", etc.

Gracias a esto, TypeScript puede ayudarte si cometes un error. Si le pasas un número donde debería haber un texto, te lo dice.

Cuando defines el componente, desestructuras las props:

```tsx
function Tarjeta({ nombre, apellido, profesion, imagen }: TarjetaProps) {
  // aquí nombre, apellido, profesion e imagen ya son variables disponibles
}
```

---

## Pasar los props desde el padre

En App.tsx, creamos la tarjeta así:

```tsx
<Tarjeta
  nombre="Sara"
  apellido="Willers Löhr"
  profesion="Estudiante de Informática"
  imagen={imgTarjeta}
/>
```

Cada atributo es un prop. Cuando Tarjeta se renderiza, recibe esos valores en sus parámetros.

Si quisieras mostrar múltiples tarjetas, podrías hacer:

```tsx
<Tarjeta nombre="Juan" apellido="Pérez" profesion="Ingeniero" imagen={img1} />
<Tarjeta nombre="María" apellido="García" profesion="Diseñadora" imagen={img2} />
```

Cada una mostraría sus propios datos.

---

## Variables CSS

El proyecto usa variables CSS (también llamadas custom properties) para almacenar colores y otros valores.

En `light.css`:

```css
:root {
  --color-card: #ffffff;
  --color-text: #000000;
  --color-accent: #3b82f6;
}
```

En `dark.css`:

```css
:root {
  --color-card: #2a2a2a;
  --color-text: #ffffff;
  --color-accent: #60a5fa;
}
```

Luego, en la tarjeta:

```tsx
<BorderGlow
  backgroundColor="var(--color-card)"
  ...
>
```

Esto hace que el código sea más mantenible. Si quieres cambiar el color de todas las tarjetas, solo cambias la variable CSS una vez.

---

## Accesibilidad

El proyecto usa `alt` en la imagen para que los lectores de pantalla (para personas ciegas) sepan qué es la foto:

```tsx
<img src={imagen} alt={`Foto de perfil de ${nombre} ${apellido}`} />
```

El `alt` también aparece si la imagen no carga.

---
