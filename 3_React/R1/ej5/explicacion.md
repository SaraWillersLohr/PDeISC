# Explicación del proyecto

Este documento explica cómo funciona cada parte del proyecto con palabras simples.  
Está pensado para alguien que está aprendiendo React por primera vez.

---

## ¿Qué hace cada componente?

### Header.tsx

Muestra el título de la aplicación arriba del todo.  
También muestra el botón para cambiar entre modo claro y modo oscuro.  
No maneja ningún estado propio. Solo recibe el tema desde el contexto.

### UserForm.tsx

Es el formulario donde el usuario escribe su nombre.  
Tiene un input, un botón para enviar y un botón para limpiar.  
Valida el nombre mientras el usuario escribe.  
Si hay un error, lo muestra debajo del input.  
Cuando el nombre es válido y el usuario hace clic en Enviar, llama a una función que le pasó App.tsx.

### WelcomeCard.tsx

Muestra el mensaje de bienvenida con el nombre del usuario.  
No sabe nada del formulario. Solo recibe el nombre como prop.  
Tiene un botón "Cambiar nombre" que llama a una función de App.tsx para volver al formulario.

### Footer.tsx

Muestra el pie de página con el texto "Hecho con React + TypeScript + Vite".  
No tiene estado ni lógica. Solo es visual.

---

## ¿Cómo funciona useState?

`useState` es la forma que tiene React de recordar información entre renders.

Ejemplo del proyecto:

```tsx
const [nombre, setNombre] = useState("");
```

- `nombre` es el valor actual (empieza vacío).
- `setNombre` es la función para cambiarlo.
- Cada vez que se llama a `setNombre`, React vuelve a dibujar el componente con el nuevo valor.

En este proyecto se usan tres estados en `UserForm`:

```tsx
const [nombre, setNombre] = useState("");        // el texto que escribe el usuario
const [error, setError] = useState("");          // el mensaje de error
const [tocado, setTocado] = useState(false);     // si el usuario ya tocó el input
```

Y dos estados en `App`:

```tsx
const [usuario, setUsuario] = useState("");                    // el nombre confirmado
const [mostrarBienvenida, setMostrarBienvenida] = useState(false); // qué pantalla mostrar
```

---

## ¿Cómo funcionan los eventos?

En React, los eventos se escriben con camelCase y reciben una función como valor.

Ejemplo del input:

```tsx
<input
  value={nombre}
  onChange={manejarCambio}
/>
```

La función `manejarCambio` recibe el evento y lee el valor del input:

```tsx
function manejarCambio(evento: React.ChangeEvent<HTMLInputElement>) {
  const valor = evento.target.value;
  setNombre(valor);
  setError(validarNombre(valor));
}
```

Ejemplo del formulario al enviarse:

```tsx
<form onSubmit={manejarEnvio}>
```

```tsx
function manejarEnvio(evento: React.FormEvent<HTMLFormElement>) {
  evento.preventDefault(); // evita que la página se recargue
  if (!error && nombre.trim().length > 0) {
    onEnviar(nombre.trim());
  }
}
```

---

## ¿Cómo funciona la validación?

La validación se hace en tiempo real: cada vez que el usuario escribe algo, se llama a `validarNombre`.

```tsx
function validarNombre(valor: string): string {
  if (valor.length === 0)          return "El nombre es obligatorio.";
  if (valor.trim().length === 0)   return "El nombre no puede contener solo espacios.";
  if (valor.trim().length < 3)     return "El nombre debe tener al menos 3 caracteres.";
  if (valor.length > 30)           return "El nombre no puede tener más de 30 caracteres.";

  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']+$/;
  if (!soloLetras.test(valor))     return "Solo se permiten letras, espacios y apóstrofes.";

  return ""; // sin errores
}
```

Si devuelve un texto, se muestra como error.  
Si devuelve vacío, el nombre es válido.

La clase del input cambia según el estado:

- Sin tocar → sin borde especial
- Con error → borde rojo (`input-error`)
- Sin error → borde verde (`input-valido`)

El botón Enviar se deshabilita cuando hay error o el campo está vacío:

```tsx
const botonDeshabilitado = error !== "" || nombre.trim().length === 0;
```

---

## ¿Cómo se muestra la bienvenida?

En `App.tsx` hay un estado booleano:

```tsx
const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
```

Cuando el formulario se envía con éxito, `guardarUsuario` cambia ese estado a `true`.  
React vuelve a dibujar y muestra `WelcomeCard` en lugar de `UserForm`.

```tsx
{mostrarBienvenida ? (
  <WelcomeCard nombre={usuario} onCambiarNombre={volverAlFormulario} />
) : (
  <UserForm onEnviar={guardarUsuario} />
)}
```

Cuando el usuario hace clic en "Cambiar nombre", `volverAlFormulario` cambia el estado a `false` y React vuelve a mostrar el formulario.

---

## ¿Cómo funciona ThemeContext?

Un contexto en React es una forma de compartir información entre componentes sin tener que pasar props de padre a hijo manualmente.

En este proyecto, el contexto guarda el tema actual (`"claro"` u `"oscuro"`).

1. Se crea el contexto con `createContext`.
2. `ProveedorTema` envuelve toda la app y comparte el tema.
3. Cualquier componente puede leer el tema con `usarTema()`.

```tsx
const { tema, cambiarTema } = usarTema();
```

La preferencia se guarda en `localStorage` para que se recuerde aunque el usuario cierre la pestaña:

```tsx
localStorage.setItem("tema", nuevoTema);
```

Al iniciar la app, se lee ese valor:

```tsx
const [tema, setTema] = useState<string>(
  () => localStorage.getItem("tema") ?? "claro"
);
```

La clase `tema-claro` o `tema-oscuro` se aplica al div principal de la app.  
Esa clase activa las variables CSS correspondientes definidas en `light.css` y `dark.css`.
