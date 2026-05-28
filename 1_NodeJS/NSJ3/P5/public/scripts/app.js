// Punto de entrada para el Proyecto 5 (E-commerce)
// Lanza la aplicación y muestra el mensaje de bienvenida.
import { initConsole, agregarLog } from "./consola.js";
import { bindEventos } from "./eventos.js";
import { initBackToTop } from "./ui.js";

window.addEventListener("DOMContentLoaded", () => {
  window.initTheme?.();
  initConsole();
  bindEventos();
  initBackToTop();
  setTimeout(() => agregarLog("P5", "Proyecto 5 — agregá bloques con innerHTML"), 300);
});
