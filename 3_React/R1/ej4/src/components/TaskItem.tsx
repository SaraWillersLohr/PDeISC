// representa una sola tarea en la lista

import { Trash2 } from 'lucide-react';
import type { Task } from '../types/Task';

// props que recibe el componente
interface TaskItemProps {
  tarea: Task;
  onCompletar: (id: number) => void;
  onEliminar: (id: number) => void;
}

function TaskItem({ tarea, onCompletar, onEliminar }: TaskItemProps) {
  return (
    <li className={`task-item ${tarea.completada ? 'completada' : ''}`}>

      {/* checkbox para marcar o desmarcar la tarea */}
      <input
        type="checkbox"
        className="task-checkbox"
        checked={tarea.completada}
        onChange={() => onCompletar(tarea.id)}
      />

      <div className="task-info">
        {/* texto con tachado si está completada */}
        <span className="task-texto">{tarea.texto}</span>
        <span className="task-fecha">{tarea.fechaCreacion}</span>
      </div>

      {/* botón para eliminar la tarea */}
      <button
        className="btn-eliminar"
        onClick={() => onEliminar(tarea.id)}
        title="Eliminar tarea"
      >
        <Trash2 size={18} />
      </button>
    </li>
  );
}

export default TaskItem;
