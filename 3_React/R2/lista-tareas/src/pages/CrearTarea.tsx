import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Tarea } from '../types/Tarea';

interface CrearTareaProps {
  agregarTarea: (tarea: Tarea) => void;
}

export const CrearTarea = ({ agregarTarea }: CrearTareaProps) => {
  const navigate = useNavigate();
  
  // acá guardo los valores del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [completa, setCompleta] = useState(false);
  
  // acá guardo los errores
  const [errorTitulo, setErrorTitulo] = useState('');
  const [errorDescripcion, setErrorDescripcion] = useState('');

  // manejo el evento onSubmit del formulario
  const manejarEnvio = (e: React.FormEvent) => {
    // evito que la página se recargue (comportamiento por defecto)
    e.preventDefault();
    
    let hasError = false;
    
    // valido el título
    if (titulo.trim() === '') {
      setErrorTitulo('El título es obligatorio.');
      hasError = true;
    } else if (titulo.length < 3) {
      setErrorTitulo('El título es muy corto.');
      hasError = true;
    } else {
      setErrorTitulo('');
    }

    // valido la descripción
    if (descripcion.trim() === '') {
      setErrorDescripcion('La descripción es obligatoria.');
      hasError = true;
    } else {
      setErrorDescripcion('');
    }

    // si hay errores, no sigo
    if (hasError) return;

    // genero la fecha actual
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${año}`;

    // acá creo la nueva tarea con los datos del formulario
    const nuevaTarea: Tarea = {
      id: Date.now(), 
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      fechaCreacion: fechaFormateada,
      completa
    };

    // la agrego al estado
    agregarTarea(nuevaTarea);
    
    // vuelvo al inicio
    navigate('/');
  };

  return (
    <div className="container-fluid pt-4 pt-md-5 mt-md-4 pb-4">
      <div className="row justify-content-center">
        {/* Hacemos el ancho amplio pero el alto compacto */}
        <div className="col-12 col-md-10 col-lg-8 col-xl-7">
          <div className="mb-3">
            <h2 className="fw-bold mb-1 fs-3">Crear nueva tarea</h2>
            <p className="text-muted small mb-0">Completá los datos para sumarla a tu lista.</p>
          </div>
            
          <form onSubmit={manejarEnvio} noValidate>
            <div className="mb-3">
              <label htmlFor="titulo" className="form-label fw-semibold small mb-1">Título</label>
              <input 
                type="text" 
                className={`form-control custom-input py-2 ${errorTitulo ? 'is-invalid' : ''}`} 
                id="titulo" 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Leer material de clase"
                required
              />
              {errorTitulo && <div className="invalid-feedback">{errorTitulo}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="descripcion" className="form-label fw-semibold small mb-1">Descripción</label>
              <textarea 
                className={`form-control custom-input py-2 ${errorDescripcion ? 'is-invalid' : ''}`} 
                id="descripcion" 
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Escribí los detalles de tu tarea acá..."
                required
              ></textarea>
              {errorDescripcion && <div className="invalid-feedback">{errorDescripcion}</div>}
            </div>

            <div className="mb-3">
              <span className="form-label fw-semibold small mb-2 d-block">Estado</span>
              <div className="d-flex gap-4">
                <div className="form-check custom-radio">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="estado" 
                    id="incompleta" 
                    checked={!completa}
                    onChange={() => setCompleta(false)}
                  />
                  <label className="form-check-label ms-1 small" htmlFor="incompleta">
                    Incompleta
                  </label>
                </div>
                <div className="form-check custom-radio">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="estado" 
                    id="completa"
                    checked={completa}
                    onChange={() => setCompleta(true)}
                  />
                  <label className="form-check-label ms-1 small" htmlFor="completa">
                    Completa
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 d-flex flex-column gap-2">
              <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-semibold">
                Crear tarea
              </button>
              <Link to="/" className="btn btn-light w-100 rounded-pill py-2 fw-semibold text-center text-decoration-none">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
