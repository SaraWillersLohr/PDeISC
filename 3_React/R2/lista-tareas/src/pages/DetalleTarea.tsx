import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Tarea } from '../types/Tarea';

interface DetalleTareaProps {
  tareas: Tarea[];
  eliminarTarea: (id: number) => void;
  cambiarEstadoTarea: (id: number) => void;
}

export const DetalleTarea = ({ tareas, eliminarTarea, cambiarEstadoTarea }: DetalleTareaProps) => {
  // obtengo el id de la url
  const { id } = useParams();
  const navigate = useNavigate();
  
  // estado para mostrar la confirmación visual de eliminación
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState(false);
  
  // busco la tarea por el id
  const tarea = tareas.find(t => t.id === Number(id));

  // si la tarea no existe muestro esto
  if (!tarea) {
    return (
      <div className="container text-center py-5">
        <h2 className="mb-4">Tarea no encontrada</h2>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    );
  }

  // elimino la tarea y vuelvo al inicio
  const confirmarEliminacion = () => {
    eliminarTarea(tarea.id);
    navigate('/');
  };

  return (
    <div className="container pb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg detail-card p-4">
            <div className="d-flex justify-content-end mb-3">
              <Link to="/" className="text-decoration-none close-btn" title="Volver al inicio">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </Link>
            </div>
            
            <h1 className="fw-bold mb-3">{tarea.titulo}</h1>
            <p className="lead text-muted mb-4">{tarea.descripcion}</p>
            
            <hr className="text-muted opacity-25 mb-4" />
            
            <p className="mb-3">
              <span className="text-muted">Fecha de Creación: </span> 
              <span className="fw-medium">{tarea.fechaCreacion}</span>
            </p>
            
            <div className="d-flex align-items-center mb-5">
              <span className="me-3 fw-medium">Estado:</span>
              {tarea.completa ? (
                <span className="badge bg-success px-3 py-2 fw-normal fs-6">Completa</span>
              ) : (
                <span className="badge app-badge-purple px-3 py-2 fw-normal fs-6">Incompleta</span>
              )}
            </div>

            {/* botones de acción principal */}
            {!mostrandoConfirmacion && (
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mt-4">
                <button 
                  onClick={() => cambiarEstadoTarea(tarea.id)} 
                  className="btn btn-primary px-4 py-2 rounded-pill flex-grow-1"
                >
                  {tarea.completa ? 'Marcar como incompleta' : 'Marcar como completa'}
                </button>
                <button 
                  onClick={() => setMostrandoConfirmacion(true)} 
                  className="btn btn-outline-danger px-4 py-2 rounded-pill flex-grow-1"
                >
                  Eliminar tarea
                </button>
              </div>
            )}

            {/* confirmación visual de eliminación */}
            {mostrandoConfirmacion && (
              <div className="alert alert-danger mt-4 text-center border-0 rounded-4 shadow-sm" role="alert">
                <h5 className="alert-heading mb-3 text-danger">¿Querés eliminar esta tarea?</h5>
                <p className="small mb-4 text-danger opacity-75">Esta acción no se puede deshacer.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button 
                    onClick={() => setMostrandoConfirmacion(false)} 
                    className="btn btn-light rounded-pill px-4"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={confirmarEliminacion} 
                    className="btn btn-danger rounded-pill px-4"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
