// Punto de entrada para el Proyecto 3
// Inicializa los componentes básicos de la página al cargar el DOM.
import { initConsole, agregarLog } from "./consola.js";
import { bindEventos } from "./eventos.js";
import { initBackToTop } from "./ui.js";

window.addEventListener("DOMContentLoaded", () => {
  window.initTheme?.();
  initConsole();
  bindEventos();
  initBackToTop();
  setTimeout(() => agregarLog("P3", "Proyecto 3 — pulsá el botón para contar hijos"), 300);
});
