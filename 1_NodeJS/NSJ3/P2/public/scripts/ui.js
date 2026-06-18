// Comentarios claros: este archivo explica la lógica paso a paso.

export function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  // Si if (!btn), entonces se ejecuta este bloque.
  if (!btn) return;
  window.addEventListener("scroll", () => { btn.style.display = window.scrollY > 300 ? "flex" : "none"; });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

export function cargarSeccion(nombre) {
  const contenedor = document.getElementById("nav-content");
  const tpl = document.getElementById(`tpl-${nombre}`);
  // Si if (!contenedor || !tpl), entonces se ejecuta este bloque.
  if (!contenedor || !tpl) return;
  contenedor.innerHTML = "";
  contenedor.appendChild(tpl.content.cloneNode(true));
}
