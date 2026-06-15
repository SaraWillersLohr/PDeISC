// UI auxiliar P6 — botón volver arriba
export function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  // muestro el botón al hacer scroll
  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 300 ? "flex" : "none";
  });

  // subo suave al inicio
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
