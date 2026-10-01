import { Link } from "react-router-dom";
import type { Tarea } from "../types/Tarea";

interface TareaCardProps {
  tarea: Tarea;
  cambiarEstadoTarea: (id: number) => void;
}

export const TareaCard = ({ tarea, cambiarEstadoTarea }: TareaCardProps) => (
  <article className={`task-card ${tarea.completa ? "is-complete" : ""}`}>
    <label className="task-check">
      <input
        type="radio"
        name={`estado-${tarea.id}`}
        aria-label={`Marcar ${tarea.titulo} como ${tarea.completa ? "incompleta" : "completa"}`}
        checked={tarea.completa}
        onClick={() => cambiarEstadoTarea(tarea.id)}
        readOnly
      />
      <span aria-hidden="true" />
    </label>
    <Link
      to={`/tarea/${tarea.id}`}
      className="task-link"
      aria-label={`Ver detalle de ${tarea.titulo}`}
    >
      <div className="task-card-content">
        <h3>{tarea.titulo}</h3>
        <p>
          {tarea.descripcion.length > 58
            ? `${tarea.descripcion.substring(0, 58)}...`
            : tarea.descripcion}
        </p>
      </div>
      <span
        className={`task-status ${tarea.completa ? "complete" : "pending"}`}
      >
        {tarea.completa ? "Completa" : "Incompleta"}
      </span>
      <span className="task-arrow" aria-hidden="true">
        ›
      </span>
    </Link>
  </article>
);
