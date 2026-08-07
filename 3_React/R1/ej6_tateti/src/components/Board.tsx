import Square from './Square';
import { calculateWinner } from '../utils/calculateWinner';

// las props que recibe el tablero desde Game
interface BoardProps {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (nextSquares: (string | null)[]) => void;
}

// muestra el tablero y maneja los clicks en las casillas
export default function Board({ xIsNext, squares, onPlay }: BoardProps) {
  // maneja el click en una casilla
  function handleClick(i: number) {
    // si ya hay un ganador o la casilla está ocupada, no hace nada
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    // hace una copia del array para no mutar el estado directamente
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }

    // avisa al componente padre que hubo una jugada
    onPlay(nextSquares);
  }

  // busca si hay ganador para destacar las casillas ganadoras
  const winnerResult = calculateWinner(squares);
  const winningLine = winnerResult ? winnerResult.line : [];

  return (
    <div className="board">
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} isWinning={winningLine.includes(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} isWinning={winningLine.includes(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} isWinning={winningLine.includes(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} isWinning={winningLine.includes(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} isWinning={winningLine.includes(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} isWinning={winningLine.includes(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} isWinning={winningLine.includes(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} isWinning={winningLine.includes(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} isWinning={winningLine.includes(8)} />
      </div>
    </div>
  );
}
