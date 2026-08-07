import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// muestra el título del juego y el botón para cambiar el tema
export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Ta-Te-Ti</h1>
        <p className="header-subtitle">El clásico juego de tres en línea</p>
      </div>

      {/* botón para cambiar entre modo claro y oscuro */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  );
}
