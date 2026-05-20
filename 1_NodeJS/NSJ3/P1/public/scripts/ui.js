// UI auxiliar P1 — botón volver arriba
export function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 300 ? "flex" : "none";
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

export function mostrarAviso(mensaje, tipo = "warning") {
  const zona = document.querySelector(".glass-panel");
  if (!zona) return;
  const prev = document.getElementById("aviso-temporal");
  if (prev) prev.remove();
  const aviso = document.createElement("div");
  aviso.id = "aviso-temporal";
  aviso.className = `alert alert-${tipo} alert-dismissible fade show mt-3 border-0`;
  aviso.innerHTML = `<i class="bi bi-info-circle me-2"></i>${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  zona.appendChild(aviso);
  setTimeout(() => aviso.remove(), 4000);
}
