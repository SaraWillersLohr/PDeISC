import { useState } from 'react';
import { RotateCcw, History } from 'lucide-react';
import Board from './Board';
import { calculateWinner } from '../utils/calculateWinner';

// componente principal que maneja toda la lógica del juego
export default function Game() {
  // guarda todo el historial de tableros jugados
  const [history, setHistory] = useState<(string | null)[][]>([Array(9).fill(null)]);
  // guarda en qué movimiento estamos parados ahora
  const [currentMove, setCurrentMove] = useState(0);

  // el turno se calcula a partir del movimiento actual, no se guarda por separado
  const xIsNext = currentMove % 2 === 0;
  // el tablero actual es el que corresponde al movimiento actual
  const currentSquares = history[currentMove];

  // guarda una jugada nueva en el historial
  function handlePlay(nextSquares: (string | null)[]) {
    // si viajamos al pasado y jugamos desde ahí, descarta el futuro
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  // vuelve a un movimiento anterior
  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  // reinicia la partida
  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  // verifica si hay ganador o empate
  const winnerResult = calculateWinner(currentSquares);
  const winner = winnerResult ? winnerResult.winner : null;
  const isDraw = !winner && currentMove === 9;

  // arma el mensaje de estado del juego
  let statusMessage: string;
  if (winner) {
    statusMessage = `¡Ganó el jugador ${winner}!`;
  } else if (isDraw) {
    statusMessage = '¡Empate!';
  } else {
    statusMessage = `Turno: Jugador ${xIsNext ? 'X' : 'O'}`;
  }

  // crea la lista de botones del historial usando map()
  const moves = history.map((_squares, move) => {
    let description: string;
    if (move > 0) {
      description = `Jugada #${move}`;
    } else {
      description = 'Inicio del juego';
    }

    // la jugada actual se muestra diferente en vez de botón
    const isCurrent = move === currentMove;

    return (
      <li key={move} className={`move-item ${isCurrent ? 'move-item--current' : ''}`}>
        {isCurrent ? (
          <span className="move-current-label">
            {move === 0 ? 'Inicio del juego' : `Jugada #${move} (actual)`}
          </span>
        ) : (
          <button className="move-button" onClick={() => jumpTo(move)}>
            {description}
          </button>
        )}
      </li>
    );
  });

  return (
    <div className="game">
      {/* lado izquierdo: el tablero */}
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>

      {/* lado derecho: panel de información */}
      <div className="game-info">
        {/* estado del juego */}
        <div className={`status-panel ${winner ? 'status-panel--winner' : ''} ${isDraw ? 'status-panel--draw' : ''}`}>
          <p className="status-text">{statusMessage}</p>
          <p className="status-moves">Movimientos jugados: {currentMove}</p>
        </div>

        {/* botón de reinicio */}
        <button className="reset-button" onClick={resetGame}>
          <RotateCcw size={16} />
          Reiniciar partida
        </button>

        {/* historial de movimientos */}
        <div className="history-panel">
          <h3 className="history-title">
            <History size={16} />
            Historial
          </h3>
          <ol className="moves-list">
            {moves}
          </ol>
        </div>
      </div>
    </div>
  );
}
