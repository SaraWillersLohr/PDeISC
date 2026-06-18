// ==========================================
// Consola visual de eventos
// Registro con timestamp, autoscroll e historial de sesión.
// ==========================================

const STORAGE_KEY = "p1_console_history";

export function initConsole() {
  const btnLimpiar = document.getElementById("btn-clear-console");
  // Si if (btnLimpiar), entonces se ejecuta este bloque.
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", limpiarConsola);
  }
  cargarHistorialDeSesion();
}

// Agrego un log nuevo a la consola
export function agregarLog(modulo, mensaje) {
  const cuerpo = document.getElementById("console-body");
  // Si if (!cuerpo), entonces se ejecuta este bloque.
  if (!cuerpo) return;

  const placeholder = cuerpo.querySelector(".console-placeholder");
  // Si if (placeholder) placeholder.remove(), entonces se ejecuta este bloque.
  if (placeholder) placeholder.remove();

  const ahora = new Date();
  const h = String(ahora.getHours()).padStart(2, "0");
  const m = String(ahora.getMinutes()).padStart(2, "0");
  const s = String(ahora.getSeconds()).padStart(2, "0");
  const timestamp = `[${h}:${m}:${s}]`;

  const log = { timestamp, modulo, mensaje };
  guardarEnHistorial(log);
  pintarLogEnDOM(log, cuerpo);
}
// Agrego un log nuevo a la consola
function pintarLogEnDOM(log, contenedor) {
  const linea = document.createElement("div");
  linea.className = "console-line";
  linea.innerHTML = `
    <span class="console-time">${log.timestamp}</span>
    <span class="console-method">${log.modulo}</span>
    <span class="console-text">${log.mensaje}</span>
  `;
  contenedor.appendChild(linea);
  contenedor.scrollTop = contenedor.scrollHeight;
}
// Guarda el log en sessionStorage para mantenerlo entre recargas
function guardarEnHistorial(log) {
  try {
    const historial = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    historial.push(log);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
  } catch (e) {
    console.error("No pude guardar el historial:", e);
  }
}
// Limpia la consola y el historial de sesión
export function limpiarConsola() {
  const cuerpo = document.getElementById("console-body");
  // Si if (cuerpo), entonces se ejecuta este bloque.
  if (cuerpo) {
    cuerpo.innerHTML = `<div class="console-placeholder text-muted fst-italic fs-7">Consola vaciada. Esperando nuevas interacciones...</div>`;
  }
  sessionStorage.removeItem(STORAGE_KEY);
}
// Carga el historial de sesión y lo muestra en la consola
function cargarHistorialDeSesion() {
  const cuerpo = document.getElementById("console-body");
  // Si if (!cuerpo), entonces se ejecuta este bloque.
  if (!cuerpo) return;

  try {
    // Intento cargar el historial del sessionStorage
    //sessionStorage es un objeto que permite almacenar datos en el navegador durante la sesión actual. Es similar a localStorage, pero los datos se eliminan cuando se cierra la pestaña o el navegador.
    const historial = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    // Si if (historial.length > 0), entonces se ejecuta este bloque.
    if (historial.length > 0) {
      cuerpo.innerHTML = "";
      historial.forEach((log) => pintarLogEnDOM(log, cuerpo));
    }
  } catch (e) {
    console.error("No pude cargar el historial:", e);
  }
}
