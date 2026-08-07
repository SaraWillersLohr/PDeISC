// pestañas para filtrar las tareas por estado

// tipo para las opciones de pestaña
export type TabActiva = 'todas' | 'pendientes' | 'completadas';

// props que recibe el componente
interface TaskTabsProps {
  tabActiva: TabActiva;
  onCambiarTab: (tab: TabActiva) => void;
}

function TaskTabs({ tabActiva, onCambiarTab }: TaskTabsProps) {
  return (
    <div className="tabs">
      {/* pestaña todas */}
      <button
        className={`tab ${tabActiva === 'todas' ? 'tab-activa' : ''}`}
        onClick={() => onCambiarTab('todas')}
      >
        Todas
      </button>

      {/* pestaña pendientes */}
      <button
        className={`tab ${tabActiva === 'pendientes' ? 'tab-activa' : ''}`}
        onClick={() => onCambiarTab('pendientes')}
      >
        Pendientes
      </button>

      {/* pestaña completadas */}
      <button
        className={`tab ${tabActiva === 'completadas' ? 'tab-activa' : ''}`}
        onClick={() => onCambiarTab('completadas')}
      >
        Completadas
      </button>
    </div>
  );
}

export default TaskTabs;
