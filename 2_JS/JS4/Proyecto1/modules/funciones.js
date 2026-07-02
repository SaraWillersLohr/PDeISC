// muestro mensajes de estado en pantalla (sin alert)
export function mostrarEstado(mensaje, tipo = "info") {
  const contenedor = document.getElementById("estado-carga");
  if (!contenedor) return;

  contenedor.className = `alert alert-${tipo === "error" ? "danger" : tipo === "exito" ? "success" : "info"}`;
  contenedor.textContent = mensaje;
  contenedor.classList.remove("d-none");
}

export function ocultarEstado() {
  const contenedor = document.getElementById("estado-carga");
  if (contenedor) contenedor.classList.add("d-none");
}

// actualizo el panel que muestra el flujo API → array → DOM
export function actualizarPanelFlujo(metodo, cantidad) {
  const panel = document.getElementById("panel-flujo");
  if (!panel) return;
//acá actualizo el panel que muestra el flujo API → array → DOM
  panel.classList.remove("d-none");
  document.getElementById("flujo-metodo").textContent = metodo;
  document.getElementById("flujo-cantidad").textContent = cantidad;

  panel.querySelectorAll(".userhub-flow-step").forEach((paso) => {
    paso.classList.add("active");
  });
}

// cambio el badge que muestra si el método activo fue fetch o axios
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

// acá recorro los usuarios para armar las cards con nombre, email y botones
// alSeleccionar se llama cuando hacen click en la card
// alEliminar se llama cuando hacen click en el botón Eliminar
export function renderizarUsuarios(usuarios, contenedor, alSeleccionar, alEliminar) {
  if (!contenedor) return;

  const contador = document.getElementById("contador-usuarios");
  if (contador) contador.textContent = usuarios.length;

  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    contenedor.innerHTML = `<p class="text-muted text-center py-4">No hay usuarios para mostrar.</p>`;
    return;
  }

  // genero el HTML de cada card con la inicial, nombre, email y los dos botones
  const html = usuarios
    .map(
      (usuario) => `
      <div class="col-md-6 col-lg-4 userhub-fade-in">
        <article class="userhub-card userhub-card-explorer userhub-card-clickable" data-usuario-id="${usuario.id}" role="button" tabindex="0">
          <div class="userhub-card-icon">
            <span>${usuario.name.charAt(0)}</span>
          </div>
          <h3 class="userhub-card-title">${usuario.name}</h3>
          <p class="userhub-card-email mb-2"><i class="bi bi-envelope"></i> ${usuario.email}</p>
          <div class="userhub-card-actions">
            <button class="btn btn-userhub-outline btn-sm btn-perfil-card" data-id="${usuario.id}" type="button">
              <i class="bi bi-person"></i> Perfil
            </button>
            <button class="btn btn-userhub-danger btn-sm btn-eliminar-card" data-id="${usuario.id}" type="button">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </article>
      </div>`
    )
    .join("");

  contenedor.innerHTML = html;

  // agrego eventos a las cards: click en la card abre el perfil
  contenedor.querySelectorAll(".userhub-card-clickable").forEach((card) => {
    const id = Number(card.dataset.usuarioId);
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;

    // click en la card completa selecciona el usuario
    card.addEventListener("click", (evento) => {
      // evito que el click en los botones internos también dispare esto
      if (evento.target.closest("button")) return;
      alSeleccionar?.(usuario, card);
    });

    card.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        alSeleccionar?.(usuario, card);
      }
    });
  });

  // evento en el botón Perfil: muestra el panel lateral
  contenedor.querySelectorAll(".btn-perfil-card").forEach((btn) => {
    const id = Number(btn.dataset.id);
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;

    btn.addEventListener("click", (evento) => {
      evento.stopPropagation();
      const card = btn.closest(".userhub-card-clickable");
      alSeleccionar?.(usuario, card);
    });
  });

  // evento en el botón Eliminar: abre el modal de confirmación
  contenedor.querySelectorAll(".btn-eliminar-card").forEach((btn) => {
    const id = Number(btn.dataset.id);
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;

    btn.addEventListener("click", (evento) => {
      evento.stopPropagation();
      alEliminar?.(usuario);
    });
  });
}

// acá valido que lo que llegó de la api tenga nombre y email
export function validarUsuarios(usuarios) {
  if (!Array.isArray(usuarios)) return false;
  return usuarios.every((u) => u.id && u.name && u.email);
}
