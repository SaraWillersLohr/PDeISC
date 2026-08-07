# Ej6 - Ta-Te-Ti

Juego de Ta-Te-Ti desarrollado con React, TypeScript y Vite, siguiendo la filosofía del [tutorial oficial de React](https://es.react.dev/learn/tutorial-tic-tac-toe).

---

## ¿Qué hace el proyecto?

- Tablero 3x3 donde dos jugadores se turnan para colocar X y O
- Detecta automáticamente al ganador y resalta las casillas ganadoras
- Detecta empates cuando se llenó el tablero sin ganador
- Guarda el historial completo de movimientos
- Permite volver a cualquier jugada anterior (time travel)
- Modo claro y oscuro con preferencia guardada en localStorage
- Diseño responsive: en pantallas grandes muestra tablero y panel lado a lado, en celulares el panel pasa debajo

---

## Estructura del proyecto

```
src/
  components/
    Square.tsx      → una casilla del tablero
    Board.tsx       → el tablero completo (3x3)
    Game.tsx        → la lógica principal del juego
    Header.tsx      → título y botón de tema
    Footer.tsx      → pie de página
  context/
    ThemeContext.tsx → maneja el modo claro/oscuro
  utils/
    calculateWinner.ts → función que detecta al ganador
  styles/
    app.css         → estilos generales y componentes
    light.css       → variables del modo claro
    dark.css        → variables del modo oscuro
  App.tsx           → componente raíz
  main.tsx          → punto de entrada
```

---

## Tecnologías

- **React 19** con hooks (`useState`, `createContext`, `useContext`, `useEffect`)
- **TypeScript** para tipar props, funciones y estado
- **Vite** como bundler
- **Lucide React** para los íconos
- **CSS** puro con variables (sin frameworks)

---

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

---

## Lo que enseña este proyecto

Este proyecto sigue exactamente la forma en que React enseña en su tutorial oficial:

1. Componentes pequeños con una sola responsabilidad
2. Comunicación entre componentes a través de props
3. Estado con `useState`
4. Levantar el estado al componente padre
5. Actualizar el estado con copias (inmutabilidad)
6. Renderizado con `map()` y uso correcto de `key`
7. Time travel (viajar en el tiempo a jugadas anteriores)
8. Context para el tema global

La diferencia con el tutorial original es únicamente el diseño visual y la organización en múltiples archivos.
