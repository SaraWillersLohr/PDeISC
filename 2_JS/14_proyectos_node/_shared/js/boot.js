import { setupPage } from "./setupPage.js";
import { createEventConsole } from "./eventConsole.js";

/** Arranco tema + banner + consola en cada TP */
export function boot(methodId) {
  const { log } = createEventConsole();
  const runSetup = () => setupPage(methodId);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSetup);
  } else {
    runSetup();
  }

  log("Listo. Usá los botones para probar el método.", "system");

  return log;
}
