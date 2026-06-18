// Punto de entrada para el Proyecto 4
// Configura la interfaz y prepara los logs de la consola.
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
    () => agregarLog("P4", "Creá los 5 enlaces y modificá el href"),
    300,
  );
});
