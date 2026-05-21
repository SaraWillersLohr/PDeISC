const CLAVE_TEMA = "js02-tema-p2";

export const initTheme = () => {
  const boton = document.getElementById("themeToggle");
  const guardado = localStorage.getItem(CLAVE_TEMA) || "light";
  document.documentElement.setAttribute("data-theme", guardado);
  boton?.setAttribute("aria-pressed", guardado === "dark");

  boton?.addEventListener("click", () => {
    const actual = document.documentElement.getAttribute("data-theme");
    const nuevo = actual === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nuevo);
    localStorage.setItem(CLAVE_TEMA, nuevo);
    boton?.setAttribute("aria-pressed", nuevo === "dark");
  });
};
