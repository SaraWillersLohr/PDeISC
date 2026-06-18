// Consola de logs
// Permite agregar logs a la consola y mantenerlos en sessionStorage para que persistan entre recargas de página.
const STORAGE_KEY = "p4_console_history";
export function initConsole() {
  document
    .getElementById("btn-clear-console")
    ?.addEventListener("click", limpiar);
  cargar();
}
export function agregarLog(m, msg) {
  const c = document.getElementById("console-body");
  // Si if (!c), entonces se ejecuta este bloque.
  if (!c) return;
  c.querySelector(".console-placeholder")?.remove();
  const t = new Date(),
    ts = `[${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:${String(t.getSeconds()).padStart(2, "0")}]`;
  try {
    const h = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    h.push({ timestamp: ts, modulo: m, mensaje: msg });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(h));
  } catch (_) {}
  const l = document.createElement("div");
  l.className = "console-line";
  l.innerHTML = `<span class="console-time">${ts}</span><span class="console-method">${m}</span><span class="console-text">${msg}</span>`;
  c.appendChild(l);
  c.scrollTop = c.scrollHeight;
}
function limpiar() {
  document.getElementById("console-body").innerHTML =
    '<div class="console-placeholder text-muted fst-italic fs-7">Consola vaciada.</div>';
  sessionStorage.removeItem(STORAGE_KEY);
}
function cargar() {
  const c = document.getElementById("console-body");
  // Si if (!c), entonces se ejecuta este bloque.
  if (!c) return;
  try {
    JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]").forEach((log) => {
      const l = document.createElement("div");
      l.className = "console-line";
      l.innerHTML = `<span class="console-time">${log.timestamp}</span><span class="console-method">${log.modulo}</span><span class="console-text">${log.mensaje}</span>`;
      c.appendChild(l);
    });
  } catch (_) {}
}
