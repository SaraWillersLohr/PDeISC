// acá calculo cantidad de empleados y departamentos distintos
export function calcularEstadisticas(empleados) {
  const departamentos = [...new Set(empleados.map((e) => e.departamento))];

  return {
    total: empleados.length,
    departamentos: departamentos.length,
  };
}

// acá muestro las estadísticas corporativas en pantalla
export function renderizarEstadisticas(stats, contenedor) {
  if (!contenedor) return;

  const items = [
    { numero: stats.total, etiqueta: "Cantidad empleados", icono: "bi-people" },
    { numero: stats.departamentos, etiqueta: "Cantidad departamentos", icono: "bi-diagram-3" },
  ];

  contenedor.innerHTML = items
    .map(
      (item) => `
    <div class="col-md-6 userhub-fade-in">
      <div class="userhub-stat-card">
        <i class="bi ${item.icono} text-primary mb-2" style="font-size:1.5rem"></i>
        <div class="stat-number">${item.numero}</div>
        <div class="stat-label">${item.etiqueta}</div>
      </div>
    </div>`
    )
    .join("");
}

// acá recorro los empleados para armar la tabla corporativa
export function renderizarTablaEmpleados(empleados, contenedor, alSeleccionar) {
  if (!contenedor) return;

  if (empleados.length === 0) {
    contenedor.innerHTML = `<p class="text-muted text-center py-4 mb-0">No hay empleados para mostrar.</p>`;
    return;
  }

  contenedor.innerHTML = `
    <div class="table-responsive userhub-table userhub-enterprise-table">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cargo</th>
            <th>Departamento</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          ${empleados
            .map(
              (empleado) => `
            <tr class="userhub-fade-in userhub-row-clickable" data-empleado-id="${empleado.id}" role="button" tabindex="0">
              <td>${empleado.nombre}</td>
              <td>${empleado.cargo}</td>
              <td>${empleado.departamento}</td>
              <td>${empleado.email}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;

  contenedor.querySelectorAll(".userhub-row-clickable").forEach((fila) => {
    const id = Number(fila.dataset.empleadoId);
    const empleado = empleados.find((e) => e.id === id);
    if (!empleado) return;

    fila.addEventListener("click", () => alSeleccionar?.(empleado, fila));
    fila.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        alSeleccionar?.(empleado, fila);
      }
    });
  });
}

export function mostrarEstado(mensaje, tipo = "info") {
  const el = document.getElementById("estado-carga");
  if (!el) return;
  el.className = `alert alert-${tipo === "error" ? "danger" : tipo === "exito" ? "success" : "info"}`;
  el.textContent = mensaje;
  el.classList.remove("d-none");
}

export function ocultarEstado() {
  document.getElementById("estado-carga")?.classList.add("d-none");
}

// cambio el badge del método activo
export function actualizarMetodoActivo(metodo) {
  const badge = document.getElementById("metodo-activo");
  if (!badge) return;

  badge.textContent = metodo;
  badge.className = `userhub-metodo-badge ${metodo === "fetch()" ? "fetch" : "axios"}`;
}

// muestro si axios confirmó los mismos datos que fetch
export function mostrarVerificacionAxios(coincide) {
  const badge = document.getElementById("verificacion-axios");
  if (!badge) return;

  badge.textContent = coincide ? "Verificado con axios ✓" : "Actualizado con axios";
  badge.classList.remove("d-none");
}
