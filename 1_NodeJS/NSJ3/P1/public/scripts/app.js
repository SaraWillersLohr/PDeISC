// Punto de entrada P1 — consigna 1
import { initConsole, agregarLog } from "./consola.js";
import { bindEventos } from "./eventos.js";
import { initBackToTop } from "./ui.js";
// Inicializa el tema y los eventos cuando el DOM esté listo
window.addEventListener("DOMContentLoaded", () => {
  window.initTheme?.();
  initConsole();
  bindEventos();
  initBackToTop();
  setTimeout(
    () => agregarLog("P1", "Proyecto 1 listo — probá los botones DHTML"),
    300,
  );
});
