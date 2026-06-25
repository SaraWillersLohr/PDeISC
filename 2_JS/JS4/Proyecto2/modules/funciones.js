// acá busco coincidencias por nombre completo o apodo (username)
// uso toLowerCase() para que "bret", "Bret" y "BRET" den el mismo resultado
export function filtrarPorNombre(usuarios, busqueda) {
  if (!busqueda || busqueda.trim() === "") {
    return usuarios;
  }

  const texto = busqueda.trim().toLowerCase();

  // filter recorre el array y devuelve solo los que tienen el texto en name o username
  return usuarios.filter(
    (usuario) =>
      usuario.name.toLowerCase().includes(texto) ||
      usuario.username.toLowerCase().includes(texto)
  );
}

// acá muestro los resultados filtrados en una tabla con columnas Nombre, Apodo y acciones
// alSeleccionar se llama cuando hacen click en la fila
// alEliminar se llama cuando hacen click en el botón Eliminar
export function renderizarTablaNombres(usuarios, contenedor, alSeleccionar, alEliminar) {
  if (!contenedor) return;

  if (usuarios.length === 0) {
    contenedor.innerHTML = `<p class="text-muted text-center py-4 mb-0">No se encontraron usuarios con ese nombre o apodo.</p>`;
    return;
  }

  // construyo la tabla con una fila por usuario, sin mostrar el id
  contenedor.innerHTML = `
    <div class="table-responsive userhub-table userhub-search-table">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Apodo</th>
            <th scope="col" class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios
            .map(
              (usuario) => `
            <tr class="userhub-fade-in userhub-row-clickable" data-usuario-id="${usuario.id}" role="button" tabindex="0">
              <td>${usuario.name}</td>
              <td>@${usuario.username}</td>
              <td class="text-end">
                <button class="btn btn-userhub-danger btn-sm btn-eliminar-fila" data-id="${usuario.id}" type="button">
                  <i class="bi bi-trash"></i> Eliminar
                </button>
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;

  // evento en las filas: click en cualquier celda (excepto el botón) selecciona el usuario
  contenedor.querySelectorAll(".userhub-row-clickable").forEach((fila) => {
    const id = Number(fila.dataset.usuarioId);
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;

    fila.addEventListener("click", (evento) => {
      if (evento.target.closest("button")) return;
      alSeleccionar?.(usuario, fila);
    });

    fila.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        alSeleccionar?.(usuario, fila);
      }
    });
  });

  // evento en el botón Eliminar: abre el modal con datos del usuario
  contenedor.querySelectorAll(".btn-eliminar-fila").forEach((btn) => {
    const id = Number(btn.dataset.id);
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;

    btn.addEventListener("click", (evento) => {
      evento.stopPropagation();
      alEliminar?.(usuario);
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
  const el = document.getElementById("estado-carga");
  if (el) el.classList.add("d-none");
}

// actualizo el panel que muestra el flujo API → array → DOM
export function actualizarPanelFlujo(metodo, cantidad) {
  const panel = document.getElementById("panel-flujo");
  if (!panel) return;

  panel.classList.remove("d-none");
  document.getElementById("flujo-metodo").textContent = metodo;
  document.getElementById("flujo-cantidad").textContent = cantidad;

  panel.querySelectorAll(".userhub-flow-step").forEach((paso) => {
    paso.classList.add("active");
  });
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
