const STORAGE_KEY = "p3_console_history";

export function initConsole() {
  document.getElementById("btn-clear-console")?.addEventListener("click", limpiarConsola);
  cargarHistorial();
}

export function agregarLog(modulo, mensaje) {
  const cuerpo = document.getElementById("console-body");
  if (!cuerpo) return;
  cuerpo.querySelector(".console-placeholder")?.remove();
  const ahora = new Date();
  const ts = `[${String(ahora.getHours()).padStart(2,"0")}:${String(ahora.getMinutes()).padStart(2,"0")}:${String(ahora.getSeconds()).padStart(2,"0")}]`;
  const log = { timestamp: ts, modulo, mensaje };
  try {
    const h = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    h.push(log);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(h));
  } catch (_) {}
  const linea = document.createElement("div");
  linea.className = "console-line";
  linea.innerHTML = `<span class="console-time">${ts}</span><span class="console-method">${modulo}</span><span class="console-text">${mensaje}</span>`;
  cuerpo.appendChild(linea);
  cuerpo.scrollTop = cuerpo.scrollHeight;
}

function limpiarConsola() {
  const c = document.getElementById("console-body");
  if (c) c.innerHTML = `<div class="console-placeholder text-muted fst-italic fs-7">Consola vaciada.</div>`;
  sessionStorage.removeItem(STORAGE_KEY);
}

function cargarHistorial() {
  const c = document.getElementById("console-body");
  if (!c) return;
  try {
    const h = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    if (h.length) {
      c.innerHTML = "";
      h.forEach((log) => {
        const linea = document.createElement("div");
        linea.className = "console-line";
        linea.innerHTML = `<span class="console-time">${log.timestamp}</span><span class="console-method">${log.modulo}</span><span class="console-text">${log.mensaje}</span>`;
        c.appendChild(linea);
      });
      c.scrollTop = c.scrollHeight;
    }
  } catch (_) {}
}
