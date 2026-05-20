// P2 — navegación con 5 eventos distintos
import { agregarLog } from "./consola.js";
import { cargarSeccion } from "./ui.js";

export function bindEventos() {
  document.querySelectorAll("#subnav-pages [data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#subnav-pages .nav-link").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const pagina = btn.dataset.page;
      cargarSeccion(pagina);
      vincularEventosPagina(pagina);
      agregarLog("Navegación", `Sección: ${pagina}`);
    });
  });

  cargarSeccion("inicio");
  vincularEventosPagina("inicio");
}

function vincularEventosPagina(nombre) {
  if (nombre === "inicio") {
    document.getElementById("box-dbclick")?.addEventListener("dblclick", () => {
      agregarLog("Inicio", "Evento dblclick detectado");
    });
  }
  if (nombre === "perfil") {
    document.getElementById("perfil-select")?.addEventListener("change", (e) => {
      agregarLog("Perfil", `Evento change — valor: ${e.target.value}`);
    });
  }
  if (nombre === "config") {
    document.getElementById("config-input")?.addEventListener("keydown", (e) => {
      agregarLog("Config", `Evento keydown — tecla: ${e.key}`);
    });
  }
  if (nombre === "stats") {
    document.getElementById("stats-area")?.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      agregarLog("Stats", "Evento contextmenu (menú bloqueado)");
    });
  }
  if (nombre === "ayuda") {
    document.getElementById("drag-element")?.addEventListener("dragstart", () => {
      agregarLog("Ayuda", "Evento dragstart");
    });
  }
}
