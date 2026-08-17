import { Link } from 'react-router-dom';
import type { Tarea } from '../types/Tarea';
import { TareaCard } from '../components/TareaCard';

interface InicioProps { tareas: Tarea[]; cambiarEstadoTarea: (id: number) => void; }

export const Inicio = ({ tareas, cambiarEstadoTarea }: InicioProps) => (
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
        {tareas.map((tarea) => <div className="col-12 col-md-6 col-xxl-4" key={tarea.id}><TareaCard tarea={tarea} cambiarEstadoTarea={cambiarEstadoTarea} /></div>)}
      </div>
    )}
  </div>
);
