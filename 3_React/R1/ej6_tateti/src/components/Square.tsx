// representa una sola casilla del tablero

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
  isWinning: boolean;
}

export default function Square({ value, onSquareClick, isWinning }: SquareProps) {
  // define la clase según si es casilla ganadora o no
  let className = 'square';
  if (isWinning) className += ' square--winning';
  if (value === 'X') className += ' square--x';
  if (value === 'O') className += ' square--o';

  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  );
}
