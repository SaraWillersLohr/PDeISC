// Punto de entrada para el Proyecto 6
// Arranca la lógica de validación y la interfaz de usuario.
import { initConsole, agregarLog } from "./consola.js";
import { bindEventos } from "./eventos.js";
import { initBackToTop } from "./ui.js";
import { initModalTerminos } from "./terminos.js";

window.addEventListener("DOMContentLoaded", () => {
  window.initTheme?.();
  initConsole();
  initModalTerminos();
  bindEventos();
  initBackToTop();
  setTimeout(() => agregarLog("P6", "Formulario listo — probá el enlace de Términos"), 300);
});
