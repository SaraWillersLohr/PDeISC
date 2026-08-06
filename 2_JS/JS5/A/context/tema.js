//tema.js
// Acá guardo y leo la preferencia de tema (claro u oscuro) en localStorage
const CLAVE_TEMA = "estanga-tema";

// Acá obtengo el tema guardado o uso 'light' si no hay ninguno
export function obtenerTemaGuardado() {
  return localStorage.getItem(CLAVE_TEMA) || "light";
}

// Acá guardo el tema elegido por el usuario
export function guardarTema(tema) {
  localStorage.setItem(CLAVE_TEMA, tema);
}

// Acá aplico el tema cambiando el archivo CSS activo en el HTML
export function aplicarTema(tema) {
  const linkTema = document.getElementById("tema-css");
  if (linkTema) {
    linkTema.href = `styles/${tema}.css`;
  }
  document.documentElement.setAttribute("data-theme", tema);
}

// Acá inicializo el tema al cargar la página y configuro el botón de cambio
export function inicializarTema() {
  const temaActual = obtenerTemaGuardado();
  aplicarTema(temaActual);
  // Acá configuro el botón de cambio
  const btnTema = document.getElementById("btn-cambiar-tema");
  if (btnTema) {
    btnTema.addEventListener("click", () => {
      const nuevoTema = obtenerTemaGuardado() === "light" ? "dark" : "light";
      guardarTema(nuevoTema);
      aplicarTema(nuevoTema);
    });
  }
}
