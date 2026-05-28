/** 
 * ¡Hola! Este es mi gestor de temas (claro/oscuro).
 * Uso localStorage para que, si elegís el modo oscuro, se mantenga así aunque recargues la página.
 */
const STORAGE_KEY = "array-tp-theme";

// Esta función inicializa el tema cuando carga la página.
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  // Si no hay nada guardado, me fijo en la preferencia del sistema operativo.
  const theme = saved || (prefersDark ? "dark" : "light");
  applyTheme(theme, false);

  // Configuro el botón para que al hacer click cambie el tema.
  const btn = document.getElementById("themeToggle");
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  }
}

// Esta función aplica el tema al documento y actualiza el icono del botón.
function applyTheme(theme, persist) {
  document.documentElement.setAttribute("data-theme", theme);
  if (persist) localStorage.setItem(STORAGE_KEY, theme);

  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const isDark = theme === "dark";
  btn.innerHTML = isDark
    ? '<i class="fas fa-sun"></i><span class="theme-toggle__label">Claro</span>'
    : '<i class="fas fa-moon"></i><span class="theme-toggle__label">Oscuro</span>';
  btn.setAttribute("aria-label", isDark ? "Activar modo claro" : "Activar modo oscuro");
}
