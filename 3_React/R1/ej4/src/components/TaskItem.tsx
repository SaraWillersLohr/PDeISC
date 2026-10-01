// representa una sola tarea en la lista

import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Task } from "../types/Task";

// props que recibe el componente
interface TaskItemProps {
  tarea: Task;
  onCompletar: (id: number) => void;
  onEditar: (id: number, texto: string) => void;
  onEliminar: (id: number) => void;
}

function TaskItem({ tarea, onCompletar, onEditar, onEliminar }: TaskItemProps) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(tarea.texto);

  function guardarEdicion(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const textoActualizado = texto.trim();
    if (!textoActualizado) return;
    onEditar(tarea.id, textoActualizado);
    setEditando(false);
  }

  function cancelarEdicion() {
    setTexto(tarea.texto);
    setEditando(false);
  }

  return (
    <li className={`task-item ${tarea.completada ? "completada" : ""}`}>
      {/* radio para marcar o desmarcar la tarea */}
      <input
        type="radio"
        name={`tarea-${tarea.id}`}
        className="task-radio"
        checked={tarea.completada}
        onChange={() => {
          if (!tarea.completada) onCompletar(tarea.id);
        }}
        onClick={() => {
          if (tarea.completada) onCompletar(tarea.id);
        }}
        aria-label={`Marcar como ${tarea.completada ? "pendiente" : "completada"}: ${tarea.texto}`}
      />

      <div className="task-info">
        {editando ? (
          <form className="task-edit-form" onSubmit={guardarEdicion}>
            <input
              className="task-edit-input"
              aria-label="Editar tarea"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              autoFocus
            />
            <button
              className="btn-accion-tarea"
              type="submit"
              title="Guardar cambios"
              aria-label="Guardar cambios"
            >
              <Check size={18} />
            </button>
            <button
              className="btn-accion-tarea"
              type="button"
              onClick={cancelarEdicion}
              title="Cancelar edición"
              aria-label="Cancelar edición"
            >
              <X size={18} />
            </button>
          </form>
        ) : (
          <span className="task-texto">{tarea.texto}</span>
        )}
        <span className="task-fecha">{tarea.fechaCreacion}</span>
      </div>

      {!editando && (
        <>
          <button
            className="btn-accion-tarea"
            onClick={() => setEditando(true)}
            title="Editar tarea"
            aria-label="Editar tarea"
          >
            <Pencil size={18} />
          </button>
          {tarea.completada && (
            <button
              className="btn-accion-tarea btn-borrar-tarea"
              onClick={() => onEliminar(tarea.id)}
              title="Borrar tarea completada"
              aria-label={`Borrar tarea: ${tarea.texto}`}
            >
              <Trash2 size={18} />
            </button>
          )}
        </>
      )}
    </li>
  );
}

export default TaskItem;
