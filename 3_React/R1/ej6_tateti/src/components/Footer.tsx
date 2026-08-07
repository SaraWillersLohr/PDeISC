// pie de página con info del proyecto
export default function Footer() {
  return (
    <footer className="footer">
      <p>
        Desarrollado siguiendo el{' '}
        <a
          href="https://es.react.dev/learn/tutorial-tic-tac-toe"
          target="_blank"
          rel="noopener noreferrer"
        >
          tutorial oficial de React
        </a>{' '}
        · React + TypeScript + Vite
      </p>
    </footer>
  );
}
