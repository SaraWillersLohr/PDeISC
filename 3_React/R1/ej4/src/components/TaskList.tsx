// muestra la lista de tareas filtradas

import { ChevronLeft, ChevronRight, ClipboardX } from "lucide-react";
import { useState } from "react";
import type { Task } from "../types/Task";
import TaskItem from "./TaskItem";

// props que recibe el componente
interface TaskListProps {
  tareas: Task[];
  onCompletar: (id: number) => void;
  onEditar: (id: number, texto: string) => void;
  onEliminar: (id: number) => void;
}

function TaskList({
  tareas,
  onCompletar,
  onEditar,
  onEliminar,
}: TaskListProps) {
  const [pagina, setPagina] = useState(1);
  const tareasPorPagina = 10;
  const totalPaginas = Math.ceil(tareas.length / tareasPorPagina);
  const paginaActual = Math.max(1, Math.min(pagina, totalPaginas));
  const tareasVisibles = tareas.slice(
    (paginaActual - 1) * tareasPorPagina,
    paginaActual * tareasPorPagina,
  );
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
    <>
      <ul className="task-list">
        {tareasVisibles.map((tarea) => (
          <TaskItem
            key={tarea.id}
            tarea={tarea}
            onCompletar={onCompletar}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        ))}
      </ul>
      {totalPaginas > 1 && (
        <nav className="paginacion-tareas" aria-label="Paginación de tareas">
          <button
            type="button"
            className="btn-pagina"
            onClick={() => setPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            type="button"
            className="btn-pagina"
            onClick={() => setPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            aria-label="Página siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      )}
    </>
  );
}

export default TaskList;
