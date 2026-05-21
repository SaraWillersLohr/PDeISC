// ==========================================
// Modal de Términos y Condiciones — P6
// Acá abro/cierro la card emergente y conecto el checkbox.
// ==========================================

import { agregarLog } from "./consola.js";

let modalBootstrap = null;

export function initModalTerminos() {
  const modalEl = document.getElementById("modal-terminos");
  if (!modalEl || typeof bootstrap === "undefined") return;

  // Uso la API de Bootstrap para backdrop, ESC y click afuera
  modalBootstrap = new bootstrap.Modal(modalEl, {
    backdrop: true,
    keyboard: true,
    focus: true
  });

  // Cualquier botón/link que abra términos
  document.querySelectorAll("[data-open-terminos]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      abrirModalTerminos();
    });
  });

  // El texto "Acepto los términos" (sin marcar el checkbox) también abre el modal
  const textoAcepto = document.getElementById("texto-acepto-terminos");
  textoAcepto?.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalTerminos();
  });

  // Botón cerrar del header
  document.getElementById("btn-cerrar-terminos")?.addEventListener("click", () => {
    cerrarModalTerminos();
  });

  // Cerrar sin aceptar (footer)
  document.getElementById("btn-solo-cerrar-terminos")?.addEventListener("click", () => {
    cerrarModalTerminos();
  });

  // Aceptar desde el modal → marca checkbox y cierra
  document.getElementById("btn-aceptar-terminos-modal")?.addEventListener("click", () => {
    const checkbox = document.getElementById("reg-terminos");
    if (checkbox) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    }
    cerrarModalTerminos();
    agregarLog("Términos", "El usuario aceptó desde el modal");
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    document.body.classList.remove("modal-terms-open");
  });

  modalEl.addEventListener("shown.bs.modal", () => {
    document.body.classList.add("modal-terms-open");
  });
}

// acá abro el modal de términos
export function abrirModalTerminos() {
  if (!modalBootstrap) return;
  modalBootstrap.show();
  agregarLog("Términos", "Modal de Términos y Condiciones abierto");
}

// cierro la card emergente
export function cerrarModalTerminos() {
  if (!modalBootstrap) return;
  modalBootstrap.hide();
}
