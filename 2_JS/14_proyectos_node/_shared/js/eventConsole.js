/** Consola visual de eventos — registro real en el DOM */
export function createEventConsole(rootSelector = "#eventConsole") {
  let root = document.querySelector(rootSelector);
  const history = [];

  const ensureRoot = () => {
    if (root) return root;

    root = document.createElement("aside");
    root.id = "eventConsole";
    root.className = "event-console glass-panel";
    root.innerHTML = `
      <div class="event-console__head">
        <div>
          <h2 class="event-console__title"><i class="fas fa-terminal"></i> Consola de eventos</h2>
          <p class="event-console__sub">Registro de esta sesión</p>
        </div>
        <button type="button" class="btn-console-clear" id="btnClearConsole" title="Limpiar historial">
          <i class="fas fa-eraser"></i>
        </button>
      </div>
      <div class="event-console__body" id="eventConsoleBody" role="log" aria-live="polite"></div>
    `;
    document.body.appendChild(root);

    root.querySelector("#btnClearConsole")?.addEventListener("click", () => {
      history.length = 0;
      const body = root.querySelector("#eventConsoleBody");
      if (body) body.innerHTML = "";
      log("Historial limpiado", "system");
    });

    return root;
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("es-AR", { hour12: false });
  };

  const scrollToBottom = (body) => {
    requestAnimationFrame(() => {
      body.scrollTop = body.scrollHeight;
    });
  };

  const log = (message, type = "info") => {
    ensureRoot();
    const body = root.querySelector("#eventConsoleBody");
    if (!body) return;

    const entry = document.createElement("div");
    entry.className = `event-console__line event-console__line--${type}`;
    entry.innerHTML = `<span class="event-console__time">[${formatTime()}]</span> <span class="event-console__msg">${message}</span>`;

    body.appendChild(entry);
    history.push({ time: formatTime(), message, type });
    scrollToBottom(body);
  };

  return { log, history, root: () => ensureRoot() };
}
