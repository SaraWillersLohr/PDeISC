// formulario para agregar nuevas tareas

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';

// props que recibe el componente
interface TaskFormProps {
  onAgregar: (texto: string) => void;
}

function TaskForm({ onAgregar }: TaskFormProps) {
  const [texto, setTexto] = useState<string>('');
  const [error, setError] = useState<string>('');

  // maneja el envío del formulario
  function handleSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    // valida que no esté vacío ni sea solo espacios
    if (texto.trim() === '') {
      setError('El texto no puede estar vacío.');
      return;
    }

    // llama a la función del padre para agregar la tarea
    onAgregar(texto.trim());

    // limpia el input y el error
    setTexto('');
    setError('');
  }

  // actualiza el texto mientras el usuario escribe
  function handleChange(evento: React.ChangeEvent<HTMLInputElement>) {
    setTexto(evento.target.value);

    // borra el error apenas el usuario empieza a escribir
    if (error) {
      setError('');
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-fila">
        <input
          type="text"
          className="form-input"
          placeholder="Escribí una nueva tarea..."
          value={texto}
          onChange={handleChange}
        />

        {/* el botón está deshabilitado si el input está vacío */}
        <button
          type="submit"
          className="btn-agregar"
          disabled={texto.trim() === ''}
        >
          <PlusCircle size={20} />
          <span>Agregar</span>
        </button>
      </div>

      {/* muestra el error si existe */}
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}

export default TaskForm;
