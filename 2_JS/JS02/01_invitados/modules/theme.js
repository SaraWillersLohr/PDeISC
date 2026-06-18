// Yo manejo el tema claro/oscuro de la aplicación y lo guardo en localStorage
// Así el usuario mantiene su preferencia aunque cierre el navegador
const CLAVE_TEMA = "js02-tema-p1";

export const initTheme = () => {
  // Yo busco el botón de cambio de tema en el DOM
  const boton = document.getElementById("themeToggle");
  // Yo recupero el tema guardado o uso "light" como predeterminado
  const guardado = localStorage.getItem(CLAVE_TEMA) || "light";

  // Yo aplico el tema guardado al documento
  document.documentElement.setAttribute("data-theme", guardado);
  // Yo actualizo el estado del botón para reflejar el tema actual
  if (boton) boton.setAttribute("aria-pressed", guardado === "dark");

  // Yo agrego el evento click para alternar entre temas claro y oscuro
  boton?.addEventListener("click", () => {
    const actual = document.documentElement.getAttribute("data-theme");
    const nuevo = actual === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nuevo);
    localStorage.setItem(CLAVE_TEMA, nuevo);
    boton.setAttribute("aria-pressed", nuevo === "dark");
  });
};