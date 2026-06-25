// acá busco coincidencias por nombre o apodo

export function filtrarPorNombre(usuarios, busqueda) {
  if (!busqueda || busqueda.trim() === "") {
    return usuarios;
  }

  const texto = busqueda.trim().toLowerCase();

  return usuarios.filter(
    (usuario) =>
      usuario.name.toLowerCase().includes(texto) ||
      usuario.username.toLowerCase().includes(texto)
  );
}


// acá muestro solo los nombres filtrados en una tabla simple

export function renderizarTablaNombres(usuarios, contenedor, alSeleccionar) {

  if (!contenedor) return;



  if (usuarios.length === 0) {

    contenedor.innerHTML = `<p class="text-muted text-center py-4 mb-0">No se encontraron usuarios con ese nombre o apodo.</p>`;

    return;

  }



  contenedor.innerHTML = `

    <div class="table-responsive userhub-table userhub-search-table">

      <table class="table table-hover mb-0">

        <thead>

          <tr>

            <th scope="col">Nombre</th>

            <th scope="col">Apodo</th>

          </tr>
        </thead>

        <tbody>

          ${usuarios

            .map(

              (usuario) => `

            <tr class="userhub-fade-in userhub-row-clickable" data-usuario-id="${usuario.id}" role="button" tabindex="0">

              <td>${usuario.name}</td>

              <td>@${usuario.username}</td>

            </tr>`
            )

            .join("")}

        </tbody>

      </table>

    </div>`;



  contenedor.querySelectorAll(".userhub-row-clickable").forEach((fila) => {

    const id = Number(fila.dataset.usuarioId);

    const usuario = usuarios.find((u) => u.id === id);

    if (!usuario) return;



    fila.addEventListener("click", () => alSeleccionar?.(usuario, fila));

    fila.addEventListener("keydown", (evento) => {

      if (evento.key === "Enter" || evento.key === " ") {

        evento.preventDefault();

        alSeleccionar?.(usuario, fila);

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

