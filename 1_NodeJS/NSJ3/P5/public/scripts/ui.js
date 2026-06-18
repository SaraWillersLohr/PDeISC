// UI auxiliar — botón volver arriba
export function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  // Si if (!btn), entonces se ejecuta este bloque.
  if (!btn) return;

  // muestro el botón al hacer scroll
  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 300 ? "flex" : "none";
  });

  // subo suave al inicio
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
