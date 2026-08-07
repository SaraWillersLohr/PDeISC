// muestra el encabezado de la app con el título y el botón de tema

import { Sun, Moon, ClipboardList } from 'lucide-react';

// props que recibe el componente
interface HeaderProps {
  modoOscuro: boolean;
  onToggleModo: () => void;
}

function Header({ modoOscuro, onToggleModo }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-titulo">
        <ClipboardList size={28} />
        <h1>Lista de Tareas</h1>
      </div>

      {/* botón para cambiar entre modo claro y oscuro */}
      <button
        className="btn-tema"
        onClick={onToggleModo}
        title={modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {modoOscuro ? <Sun size={20} /> : <Moon size={20} />}
        <span>{modoOscuro ? 'Modo claro' : 'Modo oscuro'}</span>
      </button>
    </header>
  );
}

export default Header;
