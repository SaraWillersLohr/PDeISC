const MAX_ENTRADAS = 50;

// acá limpio todos los mensajes de la consola
export function limpiarConsola() {
  const consola = document.getElementById("consola-userhub");
  if (!consola) return;

  consola.innerHTML = "";
}

// acá escribo un mensaje educativo en la consola dinámica
export function logConsola(tipo, mensajes) {
  const consola = document.getElementById("consola-userhub");
  if (!consola) return;

  const placeholder = consola.querySelector(".userhub-consola-vacia");
  if (placeholder) placeholder.remove();

  const lineas = Array.isArray(mensajes) ? mensajes : [mensajes];
  const entrada = document.createElement("div");
  entrada.className = "userhub-consola-entry userhub-fade-in";

  entrada.innerHTML = `
    <span class="userhub-consola-tag ${tipo.toLowerCase()}">[${tipo}]</span>
    ${lineas.map((linea) => `<p class="userhub-consola-line">${linea}</p>`).join("")}
  `;

  consola.prepend(entrada);

  while (consola.children.length > MAX_ENTRADAS) {
    consola.removeChild(consola.lastChild);
  }
}

// acá dejo la consola lista con un mensaje inicial y el botón de limpiar
export function initConsola(mensajeInicial = "Esperando acciones del usuario...") {
  const consola = document.getElementById("consola-userhub");
  if (!consola) return;

  const panel = consola.closest(".userhub-consola-panel");
  if (panel && !document.getElementById("btn-limpiar-consola")) {
    const titulo = panel.querySelector(".userhub-sidebar-title");
    if (titulo) {
      const cabecera = document.createElement("div");
      cabecera.className = "userhub-consola-header";
      titulo.parentNode.insertBefore(cabecera, titulo);
      cabecera.appendChild(titulo);

      const btnLimpiar = document.createElement("button");
      btnLimpiar.id = "btn-limpiar-consola";
      btnLimpiar.type = "button";
      btnLimpiar.className = "btn btn-userhub-outline btn-sm";
      btnLimpiar.textContent = "Limpiar consola";
      btnLimpiar.addEventListener("click", limpiarConsola);
      cabecera.appendChild(btnLimpiar);
    }
  }

  consola.innerHTML = `<p class="userhub-consola-vacia text-muted small mb-0">${mensajeInicial}</p>`;
}
