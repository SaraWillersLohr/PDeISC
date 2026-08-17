import { Link } from 'react-router-dom';
import type { Tarea } from '../types/Tarea';
import { TareaCard } from '../components/TareaCard';

interface InicioProps { tareas: Tarea[]; cambiarEstadoTarea: (id: number) => void; }

export const Inicio = ({ tareas, cambiarEstadoTarea }: InicioProps) => {
  const volverArriba = () => {
    // subo al principio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const main = document.getElementById('main-content');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container task-list-page pb-5">
      <header className="page-heading">
        <p className="eyebrow">ORGANIZACIÓN PERSONAL</p>
        <h1>Mis tareas</h1>
        <p className="text-muted">Organizá tus tareas y mantené tus pendientes bajo control.</p>
      </header>
      <div className="d-flex justify-content-start mb-4">
        <Link to="/crear" className="btn btn-primary rounded-pill px-4 py-2">+ Nueva tarea</Link>
      </div>
      {tareas.length === 0 ? (
        <div className="empty-state list-empty"><p className="mb-0">No tenés tareas guardadas.</p></div>
      ) : (
        <div className="row g-3">
          {tareas.map((tarea) => (
            <div className="col-12 col-md-6 col-xxl-4" key={tarea.id}>
              <TareaCard tarea={tarea} cambiarEstadoTarea={cambiarEstadoTarea} />
            </div>
          ))}
        </div>
      )}

      {/* botón flotante para volver arriba del todo */}
      {tareas.length > 0 && (
        <button 
          onClick={volverArriba} 
          className="btn btn-primary rounded-circle shadow-lg position-fixed"
          style={{ 
            bottom: '2rem', 
            right: '2rem', 
            zIndex: 1000, 
            width: '3.5rem', 
            height: '3.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          aria-label="Volver arriba"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-up-short" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
          </svg>
        </button>
      )}
    </div>
  );
};
