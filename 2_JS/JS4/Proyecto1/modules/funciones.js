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

// acá recorro los usuarios para armar las cards con nombre y email
export function renderizarUsuarios(usuarios, contenedor, alSeleccionar) {
  if (!contenedor) return;

  const contador = document.getElementById("contador-usuarios");
  if (contador) contador.textContent = usuarios.length;

  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    contenedor.innerHTML = `<p class="text-muted text-center py-4">No hay usuarios para mostrar.</p>`;
    return;
  }

  const html = usuarios
    .map(
      (usuario) => `
      <div class="col-md-6 col-lg-4 userhub-fade-in">
        <article class="userhub-card userhub-card-explorer userhub-card-clickable" data-usuario-id="${usuario.id}" role="button" tabindex="0">
          <div class="userhub-card-icon">
            <span>${usuario.name.charAt(0)}</span>
          </div>
          <h3 class="userhub-card-title">${usuario.name}</h3>
          <p class="userhub-card-email mb-0"><i class="bi bi-envelope"></i> ${usuario.email}</p>
        </article>
      </div>`
    )
    .join("");

  contenedor.innerHTML = html;

  contenedor.querySelectorAll(".userhub-card-clickable").forEach((card) => {
    const id = Number(card.dataset.usuarioId);
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;

    card.addEventListener("click", () => alSeleccionar?.(usuario, card));
    card.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        alSeleccionar?.(usuario, card);
      }
    });
  });
}

// acá valido que lo que llegó de la api tenga nombre y email
export function validarUsuarios(usuarios) {
  if (!Array.isArray(usuarios)) return false;
  return usuarios.every((u) => u.id && u.name && u.email);
}
