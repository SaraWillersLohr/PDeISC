import { router } from "../modules/router.js";
import { uiLogger } from "../modules/logger.js";

document.addEventListener("DOMContentLoaded", () => {
  const contentId = "content";
  const logId = "log-container";
  const navLinks = document.querySelectorAll("nav a");

  const setupEventListeners = (page) => {
    if (page === "inicio") {
      const box = document.getElementById("box-dbclick");
      box?.addEventListener("dblclick", () =>
        uiLogger.log("Doble click en Inicio", logId),
      );
    } else if (page === "perfil") {
      const select = document.getElementById("perfil-select");
      select?.addEventListener("change", (e) =>
        uiLogger.log(`Cambio a perfil: ${e.target.value}`, logId),
      );
    } else if (page === "config") {
      const input = document.getElementById("config-input");
      input?.addEventListener("keydown", (e) =>
        uiLogger.log(`Tecla: ${e.key}`, logId),
      );
    } else if (page === "stats") {
      const area = document.getElementById("stats-area");
      area?.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        uiLogger.log("Click derecho en Estadísticas", logId);
      });
    } else if (page === "ayuda") {
      const drag = document.getElementById("drag-element");
      drag?.addEventListener("dragstart", () =>
        uiLogger.log("Inicio de arrastre", logId),
      );
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const page = e.target.getAttribute("data-page");

      // UI Feedback
      navLinks.forEach((l) => l.classList.remove("active"));
      e.target.classList.add("active");

      uiLogger.log(`Navegando a ${page}`, logId);
      const success = await router.loadPage(page, contentId);
      if (success) {
        setupEventListeners(page);
      }
    });
  });

  // Cargar página inicial
  router
    .loadPage("inicio", contentId)
    .then(() => setupEventListeners("inicio"));
});
