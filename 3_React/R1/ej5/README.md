# Ej5 — Formulario de Registro de Usuario

Proyecto desarrollado con **React + TypeScript + Vite** como ejercicio introductorio de React.

## ¿Qué hace la aplicación?

Permite que un usuario ingrese su nombre en un formulario.  
Cuando el formulario se envía correctamente, se muestra una tarjeta de bienvenida personalizada.  
Desde esa tarjeta, el usuario puede volver al formulario para cambiar su nombre.

## Tecnologías usadas

- React 19
- TypeScript
- Vite
- CSS (sin frameworks)
- Lucide React (iconos)

## Cómo iniciar el proyecto

```bash
npm install
npm run dev
```

## Estructura del proyecto

```
src/
  components/
    Header.tsx       → título de la app y botón de tema
    UserForm.tsx     → formulario con validaciones
    WelcomeCard.tsx  → tarjeta de bienvenida
    Footer.tsx       → pie de página
  context/
    ThemeContext.tsx  → manejo del tema claro/oscuro
  styles/
    app.css          → estilos generales
    light.css        → variables del modo claro
    dark.css         → variables del modo oscuro
  App.tsx            → componente raíz
  main.tsx           → punto de entrada
```

## Funcionalidades

- Validación en tiempo real del nombre
- Borde rojo cuando hay error, borde verde cuando es válido
- Botón Enviar deshabilitado si hay errores
- Tarjeta de bienvenida al enviar el formulario
- Botón para volver al formulario
- Modo claro / oscuro con persistencia en localStorage
