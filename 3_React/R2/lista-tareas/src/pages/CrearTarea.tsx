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
  const [completa, setCompleta] = useState<boolean | null>(null);
  
  // acá guardo los errores
  const [errorTitulo, setErrorTitulo] = useState('');
  const [errorDescripcion, setErrorDescripcion] = useState('');
  const [errorEstado, setErrorEstado] = useState('');

  // manejo el evento onSubmit del formulario
  const manejarEnvio = (e: React.FormEvent<HTMLFormElement>) => {
    // evito que la página se recargue (comportamiento por defecto)
    e.preventDefault();
    
    let hayError = false;
    
    // valido el título
    if (titulo.trim() === '') {
      setErrorTitulo('El título es obligatorio.');
      hayError = true;
    } else if (titulo.trim().length < 3 || titulo.trim().length > 80) {
      setErrorTitulo('El título es muy corto.');
      hayError = true;
    } else {
      setErrorTitulo('');
    }

    // valido la descripción
    if (descripcion.trim() === '') {
      setErrorDescripcion('La descripción es obligatoria.');
      hayError = true;
    } else if (descripcion.trim().length < 5 || descripcion.trim().length > 300) {
      setErrorDescripcion('La descripción debe tener entre 5 y 300 caracteres.');
      hayError = true;
    } else {
      setErrorDescripcion('');
    }

    // valido que se haya elegido un estado
    if (completa === null) {
      setErrorEstado('Seleccioná un estado.');
      hayError = true;
    } else {
      setErrorEstado('');
    }

    // si hay errores, no sigo
    if (hayError) return;

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
      completa: completa as boolean
    };

    // la agrego al estado
    agregarTarea(nuevaTarea);
    
    // vuelvo al inicio
    navigate('/');
  };

  return (
    <div className="container pb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 form-column">
          <div className="card border-0 shadow-sm p-4 form-card">
            <h1 className="fw-bold mb-2">Crear nueva tarea</h1>
            <p className="text-muted mb-4">Completá los datos para sumarla a tu lista.</p>
            
            <form onSubmit={manejarEnvio} noValidate>
              <div className="mb-4">
                <label htmlFor="titulo" className="form-label text-muted fw-medium">Título</label>
                <input 
                  type="text" 
                  className={`form-control ${errorTitulo ? 'is-invalid' : ''}`} 
                  id="titulo" 
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    if (errorTitulo) setErrorTitulo('');
                  }}
                  placeholder="Ej: Leer material de clase"
                  required
                />
                {errorTitulo && <div className="invalid-feedback">{errorTitulo}</div>}
              </div>

              <div className="mb-4">
                <label htmlFor="descripcion" className="form-label text-muted fw-medium">Descripción</label>
                <textarea 
                  className={`form-control ${errorDescripcion ? 'is-invalid' : ''}`} 
                  id="descripcion" 
                  rows={3}
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    if (errorDescripcion) setErrorDescripcion('');
                  }}
                  placeholder="Escribí los detalles de tu tarea acá..."
                  required
                ></textarea>
                {errorDescripcion && <div className="invalid-feedback">{errorDescripcion}</div>}
              </div>

              <fieldset className="mb-4">
                <legend className="form-label text-muted fw-medium mb-2">Estado</legend>
                <div className="d-flex flex-wrap gap-4">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="estado" id="incompleta" checked={completa === false} onChange={() => { setCompleta(false); setErrorEstado(''); }} />
                    <label className="form-check-label" htmlFor="incompleta">Incompleta</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="estado" id="completa" checked={completa === true} onChange={() => { setCompleta(true); setErrorEstado(''); }} />
                    <label className="form-check-label" htmlFor="completa">Completa</label>
                  </div>
                </div>
                {errorEstado && <div className="invalid-feedback d-block">{errorEstado}</div>}
              </fieldset>

              <div className="d-flex flex-column gap-3 mt-5">
                <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill">
                  Crear tarea
                </button>
                <Link to="/" className="btn btn-light w-100 rounded-pill">
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
