// muestra la lista de tareas filtradas

import { ClipboardX } from 'lucide-react';
import type { Task } from '../types/Task';
import TaskItem from './TaskItem';

// props que recibe el componente
interface TaskListProps {
  tareas: Task[];
  onCompletar: (id: number) => void;
  onEliminar: (id: number) => void;
}

function TaskList({ tareas, onCompletar, onEliminar }: TaskListProps) {
  // si no hay tareas, muestra un mensaje
  if (tareas.length === 0) {
    return (
      <div className="lista-vacia">
        <ClipboardX size={48} />
        <p>No hay tareas para mostrar.</p>
      </div>
    );
  }

  // recorre el arreglo y muestra cada tarea
  return (
    <ul className="task-list">
      {tareas.map((tarea) => (
        <TaskItem
          key={tarea.id}
          tarea={tarea}
          onCompletar={onCompletar}
          onEliminar={onEliminar}
        />
      ))}
    </ul>
  );
}

export default TaskList;
