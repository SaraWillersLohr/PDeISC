/* 
  Este archivo controla la navegación dinámica. 
  Cargamos las secciones sin que la página se refresque.
*/
import { router } from "../modules/router.js";
import { uiLogger } from "../modules/logger.js";
import { Notificador } from "../modules/notifications.js";

document.addEventListener("DOMContentLoaded", () => {
  const contentId = "content";
  const logId = "log-container";
  const navLinks = document.querySelectorAll("nav a");

  // Esta función prepara los eventos de cada página cuando se carga
  const prepararEventosDeSeccion = (nombrePagina) => {
    if (nombrePagina === "inicio") {
      const caja = document.getElementById("box-dbclick");
      caja?.addEventListener("dblclick", () => {
        uiLogger.log("¡Doble click en el Inicio!", logId);
        Notificador.mostrar("¡Doble click detectado!");
      });
    } else if (nombrePagina === "perfil") {
      const selector = document.getElementById("perfil-select");
      selector?.addEventListener("change", (e) => {
        uiLogger.log(`Cambiaste el perfil a: ${e.target.value}`, logId);
      });
    } else if (nombrePagina === "config") {
      const entrada = document.getElementById("config-input");
      entrada?.addEventListener("keydown", (e) => {
        uiLogger.log(`Tocaste la tecla: ${e.key}`, logId);
      });
    } else if (nombrePagina === "stats") {
      const area = document.getElementById("stats-area");
      area?.addEventListener("contextmenu", (e) => {
        e.preventDefault(); // Evitamos que salga el menú normal del navegador
        uiLogger.log("Hiciste click derecho en Estadísticas", logId);
        Notificador.mostrar("Menú bloqueado por seguridad");
      });
    } else if (nombrePagina === "ayuda") {
      const elemento = document.getElementById("drag-element");
      elemento?.addEventListener("dragstart", () => {
        uiLogger.log("Empezaste a arrastrar el cuadro naranja", logId);
      });
    }
  };

  // Manejamos los clics en el menú
  navLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const pagina = e.target.getAttribute("data-page");

      // Marcamos cuál es la página activa en el menú
      navLinks.forEach((l) => l.classList.remove("active"));
      e.target.classList.add("active");

      uiLogger.log(`Cambiando a la sección: ${pagina}`, logId);
      
      // Llamamos al router para que traiga el HTML
      const cargoBien = await router.loadPage(pagina, contentId);
      if (cargoBien) {
        prepararEventosDeSeccion(pagina);
      }
    });
  });

  // Cargamos el Inicio apenas abre la web
  router.loadPage("inicio", contentId).then(() => prepararEventosDeSeccion("inicio"));
});
