# Explicación del proyecto Ta-Te-Ti

Este archivo explica cómo funciona el proyecto de forma sencilla, como si se lo contara a alguien que está aprendiendo React.

---

## Los componentes

### Square

Square es el componente más simple. Representa una sola casilla del tablero.

Solo sabe dos cosas: qué valor mostrar (X, O o nada) y qué hacer cuando alguien hace clic. No guarda ningún estado propio. El Board le dice qué mostrar y qué función ejecutar al hacer clic.

```tsx
function Square({ value, onSquareClick, isWinning }) {
  return (
    <button onClick={onSquareClick}>
      {value}
    </button>
  );
}
```

### Board

Board arma el tablero completo con sus nueve casillas.

Recibe el array de casillas y el turno actual como props desde Game. Cuando alguien hace clic en una casilla, Board crea una copia del array, pone la X o la O en la posición correcta, y le avisa a Game que hubo una jugada.

No guarda el historial. Solo maneja el click y muestra el tablero.

### Game

Game es el componente principal. Es el que sabe todo.

Guarda dos cosas en su estado:
- `history`: un array con todos los tableros de cada jugada
- `currentMove`: el número de la jugada en la que estamos parados ahora

A partir de esas dos cosas calcula todo lo demás: el turno actual, el tablero que se tiene que mostrar, si hay ganador, si hay empate.

### Header

Solo muestra el título del juego y el botón para cambiar entre modo claro y oscuro.

### Footer

El pie de página. Solo muestra un texto con el link al tutorial oficial.

---

## useState

`useState` es la forma que tiene React de recordar información entre renders.

Cuando escribimos:

```ts
const [currentMove, setCurrentMove] = useState(0);
```

Estamos diciendo: "React, acordate que existe esta variable que empieza en 0". Cada vez que llamamos a `setCurrentMove(nuevovalor)`, React actualiza el valor y vuelve a dibujar el componente con el nuevo valor.

Si no usáramos useState, cada vez que React redibujara el componente, la variable volvería a su valor inicial.

---

## Las props

Las props son la forma en que los componentes se comunican entre sí.

El padre le pasa información al hijo a través de props. El hijo no puede modificar las props que recibe, solo puede usarlas para mostrarse.

Por ejemplo, Game le pasa a Board el array de casillas y una función `onPlay`. Board muestra el tablero según ese array, y cuando hay un click llama a `onPlay` para avisarle a Game.

```
Game → (props: squares, xIsNext, onPlay) → Board → (props: value, onSquareClick) → Square
```

---

## Por qué React levanta el estado al componente padre

En el tutorial, al principio cada Square tenía su propio estado. El problema es que cuando los cuadrados guardan su propio estado, el Board no puede saber qué hay en cada casilla para detectar al ganador.

La solución es mover el estado al componente padre (Board, y después Game) para que tenga toda la información centralizada. Los hijos reciben todo por props.

Esto se llama "lifting state up" en React, y es uno de los conceptos más importantes.

---

## calculateWinner

Esta función vive en `src/utils/calculateWinner.ts` y no tiene nada que ver con React. Es JavaScript puro.

Recibe el array de 9 casillas y revisa si alguna de las 8 combinaciones ganadoras posibles está completa. Si encuentra una, devuelve el ganador y las posiciones de la línea ganadora. Si no, devuelve `null`.

```
Combinaciones ganadoras:
  0-1-2 (fila 1)    0-3-6 (columna 1)    0-4-8 (diagonal)
  3-4-5 (fila 2)    1-4-7 (columna 2)    2-4-6 (diagonal)
  6-7-8 (fila 3)    2-5-8 (columna 3)
```

---

## El historial

El historial es un array de arrays. Cada elemento del historial es una "foto" del tablero en ese momento.

```
history = [
  [null, null, null, null, null, null, null, null, null],  // tablero vacío
  [null, null, null, null, 'X',  null, null, null, null],  // después de la jugada 1
  [null, null, null, null, 'X',  null, null, null, 'O' ],  // después de la jugada 2
]
```

Esto es posible porque en cada jugada no modificamos el tablero anterior. En cambio, creamos una copia con `slice()` y agregamos esa copia al historial.

---

## El time travel (viajar en el tiempo)

El time travel funciona gracias al historial y a `currentMove`.

`currentMove` guarda el índice de la jugada que estamos viendo. Cuando hacemos clic en un botón del historial, simplemente cambiamos `currentMove` al número de esa jugada. El tablero que se muestra es siempre `history[currentMove]`.

```ts
function jumpTo(nextMove: number) {
  setCurrentMove(nextMove);
}
```

Si estamos viendo una jugada del pasado y hacemos una nueva jugada, el historial se corta hasta ahí y se agrega la nueva jugada. Así no quedan "futuros" que ya no son válidos.

---

## El ThemeContext

El modo claro/oscuro se maneja con Context de React.

El Context es una forma de compartir información con todos los componentes de la aplicación sin tener que pasarla por props uno a uno.

`ThemeProvider` envuelve toda la aplicación y guarda el estado del tema. Cualquier componente puede usar `useTheme()` para leer el tema actual o llamar a `toggleTheme()` para cambiarlo.

El tema elegido se guarda en `localStorage` para que la próxima vez que abramos la app, recuerde la preferencia del usuario.

---

## Inmutabilidad: por qué usamos slice()

En cada jugada, en vez de modificar el array de casillas directamente, hacemos una copia con `slice()`:

```ts
const nextSquares = squares.slice(); // copia
nextSquares[i] = 'X';               // modifica la copia
onPlay(nextSquares);                 // manda la copia al padre
```

Esto es importante por dos razones:

1. Nos permite guardar cada versión del tablero en el historial sin que se pisen entre sí
2. React puede comparar el estado anterior con el nuevo fácilmente para saber qué tiene que redibujar

---

## map() y las keys

Para mostrar la lista del historial, usamos `map()` que convierte el array de jugadas en botones de React:

```tsx
const moves = history.map((_squares, move) => {
  return (
    <li key={move}>
      <button onClick={() => jumpTo(move)}>Jugada #{move}</button>
    </li>
  );
});
```

El `key={move}` es obligatorio cuando se renderizan listas en React. Le dice a React cómo identificar cada elemento para actualizarlos correctamente cuando la lista cambia. En este caso usamos el índice del movimiento porque nunca se reordenan.
