// ==========================================
// Tema claro / oscuro
// Este archivo se carga en el <head> para evitar parpadeo al recargar.
// ==========================================

(function aplicarTemaGuardado() {
  const link = document.getElementById("theme-link");
  const icon = document.getElementById("theme-icon");
  if (!link) return;

  const guardado = localStorage.getItem("theme") || "light";
  if (guardado === "dark") {
    link.setAttribute("href", "../styles/dark.css");
    document.documentElement.setAttribute("data-theme", "dark");
    document.body?.classList.add("dark-theme");
    if (icon) icon.className = "bi bi-moon-stars-fill fs-5 text-info";
  }
})();

window.initTheme = function initTheme() {
  const btn = document.getElementById("btn-theme-toggle");
  const link = document.getElementById("theme-link");
  const icon = document.getElementById("theme-icon");
  if (!btn || !link || !icon) return;

  btn.addEventListener("click", () => {
    const actual = localStorage.getItem("theme") || "light";
    const nuevo = actual === "light" ? "dark" : "light";
    aplicarTema(nuevo, link, icon);
    localStorage.setItem("theme", nuevo);
  });
};

function aplicarTema(tema, link, icon) {
  if (tema === "dark") {
    link.setAttribute("href", "../styles/dark.css");
    icon.className = "bi bi-moon-stars-fill fs-5 text-info";
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.classList.add("dark-theme");
  } else {
    link.setAttribute("href", "../styles/light.css");
    icon.className = "bi bi-sun-fill fs-5";
    document.documentElement.setAttribute("data-theme", "light");
    document.body.classList.remove("dark-theme");
  }
}
