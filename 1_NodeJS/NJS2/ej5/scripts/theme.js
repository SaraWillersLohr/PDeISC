// guardo la clave del tema en localStorage
const CLAVE_TEMA = "ej5-tema";

// iconos del menu segun cada ruta
const ICONOS_MENU = {
  "/": "bi-house-door-fill",
  "/ej1": "bi-cloud-sun-fill",
  "/ej2": "bi-folder2-open",
  "/ej3": "bi-link-45deg",
  "/ej4": "bi-box-seam",
  "/acerca": "bi-info-circle-fill",
};

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

  document.documentElement.setAttribute("data-theme", tema);
  localStorage.setItem(CLAVE_TEMA, tema);
}

// marco la pagina activa en el menu
function marcarMenuActivo() {
  const ruta = window.location.pathname;
  const enlaces = document.querySelectorAll(".navbar-nav .nav-link");

  enlaces.forEach((enlace) => {
    const href = enlace.getAttribute("href");
    const activo = href === ruta || (ruta === "/" && href === "/");

    enlace.classList.toggle("active", activo);
    enlace.setAttribute("aria-current", activo ? "page" : "false");
  });
}

// agrego iconos al menu sin cambiar menu.js
function mejorarMenu() {
  const enlaces = document.querySelectorAll(".navbar-nav .nav-link");

  enlaces.forEach((enlace) => {
    const href = enlace.getAttribute("href");
    const icono = ICONOS_MENU[href];
    const texto = enlace.textContent.trim();

    if (icono && !enlace.querySelector("i")) {
      enlace.innerHTML = `<i class="bi ${icono}"></i><span>${texto}</span>`;
    }
  });
}

// cambio entre claro y oscuro cuando aprieto el boton
function cambiarTema() {
  const temaActual = localStorage.getItem(CLAVE_TEMA) || "light";
  const temaNuevo = temaActual === "light" ? "dark" : "light";
  aplicarTema(temaNuevo);
}

// aplico el tema y mejoro el menu al cargar
document.addEventListener("DOMContentLoaded", () => {
  const temaGuardado = localStorage.getItem(CLAVE_TEMA) || "light";
  aplicarTema(temaGuardado);
  mejorarMenu();
  marcarMenuActivo();

  const botonTema = document.getElementById("theme-toggle");
  if (botonTema) {
    botonTema.addEventListener("click", cambiarTema);
  }
});
