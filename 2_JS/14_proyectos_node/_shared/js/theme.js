const STORAGE_KEY = "array-tp-theme";

/** Tema claro/oscuro con localStorage */
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  applyTheme(theme, false);

  const btn = document.getElementById("themeToggle");
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  }
}

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
