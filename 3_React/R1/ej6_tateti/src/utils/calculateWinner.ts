// verifica si hay un ganador en el tablero
// devuelve el ganador ('X' u 'O') y las casillas ganadoras, o null si no hay ganador todavía

export interface WinnerResult {
  winner: string;
  line: number[];
}

export function calculateWinner(squares: (string | null)[]): WinnerResult | null {
  // todas las combinaciones ganadoras posibles
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      // encontró una línea ganadora
      return { winner: squares[a]!, line: lines[i] };
    }
  }

  return null;
}
