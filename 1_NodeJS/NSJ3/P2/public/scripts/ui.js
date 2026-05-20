export function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => { btn.style.display = window.scrollY > 300 ? "flex" : "none"; });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

export function cargarSeccion(nombre) {
  const contenedor = document.getElementById("nav-content");
  const tpl = document.getElementById(`tpl-${nombre}`);
  if (!contenedor || !tpl) return;
  contenedor.innerHTML = "";
  contenedor.appendChild(tpl.content.cloneNode(true));
}
