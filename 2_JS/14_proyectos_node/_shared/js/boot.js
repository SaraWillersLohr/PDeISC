// Comentarios claros: este archivo explica la lógica paso a paso.

/** 
 * ¡Hola! Este es el archivo de arranque (boot). 
 * Se encarga de inicializar todo lo necesario cuando carga la página de un TP.
 */

import { setupPage } from "./setupPage.js";
import { createEventConsole } from "./eventConsole.js";

// Esta función la llamo al principio de cada script.js para que todo empiece a funcionar.
export function boot(methodId) {
  // Primero, preparo mi consola de eventos personalizada.
  const { log } = createEventConsole();
  
  // Configuro la página (título, banners, etc.) según el método que estemos viendo.
  const runSetup = () => setupPage(methodId);

  // Me aseguro de que el DOM esté listo antes de correr el setup.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSetup);
  } else {
    runSetup();
  }

  // Dejo un mensajito inicial en la consola.
  log("Listo. Usá los botones para probar el método.", "system");

  // Devuelvo la función log para poder usarla en el script del TP.
  return log;
}