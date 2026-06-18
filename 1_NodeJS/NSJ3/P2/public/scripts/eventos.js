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
  // Si if (nombre === "inicio"), entonces se ejecuta este bloque.
  if (nombre === "inicio") {
    document.getElementById("box-dbclick")?.addEventListener("dblclick", () => {
      agregarLog("Inicio", "Evento dblclick detectado");
    });
  }
  // Si if (nombre === "perfil"), entonces se ejecuta este bloque.
  if (nombre === "perfil") {
    document.getElementById("perfil-select")?.addEventListener("change", (e) => {
      agregarLog("Perfil", `Evento change — valor: ${e.target.value}`);
    });
  }
  // Si if (nombre === "config"), entonces se ejecuta este bloque.
  if (nombre === "config") {
    document.getElementById("config-input")?.addEventListener("keydown", (e) => {
      agregarLog("Config", `Evento keydown — tecla: ${e.key}`);
    });
  }
  // Si if (nombre === "stats"), entonces se ejecuta este bloque.
  if (nombre === "stats") {
    document.getElementById("stats-area")?.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      agregarLog("Stats", "Evento contextmenu (menú bloqueado)");
    });
  }
  // Si if (nombre === "ayuda"), entonces se ejecuta este bloque.
  if (nombre === "ayuda") {
    document.getElementById("drag-element")?.addEventListener("dragstart", () => {
      agregarLog("Ayuda", "Evento dragstart");
    });
  }
}
