// Punto de entrada para el Proyecto 2
// Inicializa la consola, los eventos globales y el botón de volver arriba.
import { initConsole, agregarLog } from "./consola.js";
import { bindEventos } from "./eventos.js";
import { initBackToTop } from "./ui.js";

window.addEventListener("DOMContentLoaded", () => {
  window.initTheme?.();
  initConsole();
  bindEventos();
  initBackToTop();
  setTimeout(() => agregarLog("P2", "Proyecto 2 — elegí una sección del menú"), 300);
});
