// guardo la clave del tema en localStorage
const CLAVE_TEMA = "ej2-tema";

// cambio el css activo segun el tema elegido
function aplicarTema(tema) {
  const linkTema = document.getElementById("theme-css");
  const icono = document.getElementById("theme-icon");
  const texto = document.getElementById("theme-label");

  if (tema === "dark") {
    linkTema.href = "/styles/dark.css";
    icono.className = "bi bi-sun-fill";
    texto.textContent = "Modo claro";
  } else {
    linkTema.href = "/styles/light.css";
    icono.className = "bi bi-moon-stars-fill";
    texto.textContent = "Modo oscuro";
  }

  localStorage.setItem(CLAVE_TEMA, tema);
}

// cambio entre claro y oscuro cuando aprieto el boton
function cambiarTema() {
  const temaActual = localStorage.getItem(CLAVE_TEMA) || "light";
  const temaNuevo = temaActual === "light" ? "dark" : "light";
  aplicarTema(temaNuevo);
}

// aplico el tema guardado al cargar la pagina
document.addEventListener("DOMContentLoaded", () => {
  const temaGuardado = localStorage.getItem(CLAVE_TEMA) || "light";
  aplicarTema(temaGuardado);

  const botonTema = document.getElementById("theme-toggle");
  botonTema.addEventListener("click", cambiarTema);
});
