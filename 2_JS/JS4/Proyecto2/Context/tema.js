// manejo del tema claro/oscuro con localStorage
const CLAVE_TEMA = "userhub-tema";
const TEMA_CLARO = "claro";
const TEMA_OSCURO = "oscuro";

export function obtenerTema() {
  return localStorage.getItem(CLAVE_TEMA) || TEMA_CLARO;
}

export function aplicarTema(tema) {
  const linkEstilos = document.getElementById("estilos-tema");
  if (!linkEstilos) return;

  linkEstilos.href = `../styles/${tema}.css`;
  document.documentElement.setAttribute("data-tema", tema);
  localStorage.setItem(CLAVE_TEMA, tema);
}

export function alternarTema() {
  const temaActual = obtenerTema();
  const nuevoTema = temaActual === TEMA_CLARO ? TEMA_OSCURO : TEMA_CLARO;
  aplicarTema(nuevoTema);
  return nuevoTema;
}

export function inicializarTema() {
  aplicarTema(obtenerTema());

  const btnTema = document.getElementById("btn-tema");
  if (btnTema) {
    btnTema.addEventListener("click", () => {
      const nuevo = alternarTema();
      btnTema.textContent = nuevo === TEMA_CLARO ? "Modo oscuro" : "Modo claro";
    });
    btnTema.textContent = obtenerTema() === TEMA_CLARO ? "Modo oscuro" : "Modo claro";
  }
}
