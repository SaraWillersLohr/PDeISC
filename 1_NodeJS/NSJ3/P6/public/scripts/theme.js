// ==========================================
// Tema claro / oscuro — comportamiento unificado NSJ3
// Se carga en el <head> para evitar parpadeo al recargar.
// ==========================================

(function aplicarTemaGuardado() {
  const link = document.getElementById("theme-link");
  const icon = document.getElementById("theme-icon");
  if (!link) return;

  // leo el tema guardado en localStorage
  const guardado = localStorage.getItem("theme") || "light";
  if (guardado === "dark") {
    aplicarTema("dark", link, icon);
  }
})();

window.initTheme = function initTheme() {
  const btn = document.getElementById("btn-theme-toggle");
  const link = document.getElementById("theme-link");
  const icon = document.getElementById("theme-icon");
  if (!btn || !link || !icon) return;

  // cambio el tema cuando aprieto el botón
  btn.addEventListener("click", () => {
    const actual = localStorage.getItem("theme") || "light";
    const nuevo = actual === "light" ? "dark" : "light";
    aplicarTema(nuevo, link, icon);
    localStorage.setItem("theme", nuevo);
  });
};

// aplico el css y actualizo el icono según el tema elegido
function aplicarTema(tema, link, icon) {
  if (tema === "dark") {
    link.setAttribute("href", "../styles/dark.css");
    if (icon) icon.className = "bi bi-moon-stars-fill fs-5 text-info";
    document.documentElement.setAttribute("data-theme", "dark");
    document.body?.classList.add("dark-theme");
  } else {
    link.setAttribute("href", "../styles/light.css");
    if (icon) icon.className = "bi bi-sun-fill fs-5";
    document.documentElement.setAttribute("data-theme", "light");
    document.body?.classList.remove("dark-theme");
  }
}
