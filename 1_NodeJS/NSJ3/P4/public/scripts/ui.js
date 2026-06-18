// Este archivo contiene funciones de utilidad para la interfaz de usuario, como el botón "Volver arriba" y el registro de cambios de atributos.
// Función para inicializar el botón "Volver arriba"
export function initBackToTop() {
  const b = document.getElementById("back-to-top");
  // Si if (!b), entonces se ejecuta este bloque.
  if (!b) return;
  window.addEventListener("scroll", () => {
    b.style.display = window.scrollY > 300 ? "flex" : "none";
  });
  b.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

export function logAtributo(textoEnlace, atributo, anterior, nuevo) {
  const log = document.getElementById("attr-log");
  // Si if (!log), entonces se ejecuta este bloque.
  if (!log) return;
  log.querySelector(".attr-log-empty")?.remove();
  const fila = document.createElement("div");
  fila.className = "attr-log-row";
  fila.innerHTML = `
    <span class="attr-name">${atributo}</span>
    <span class="attr-old">${anterior ?? "(vacío)"}</span>
    <span class="attr-arrow"><i class="bi bi-arrow-right"></i></span>
    <span class="attr-new">${nuevo}</span>
    <span class="attr-link text-muted">· ${textoEnlace}</span>
  `;
  log.prepend(fila);
}
