import { renderPalabra, renderLetras, renderAhorcado } from "./render.js";

const normalizar = (c) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Colorea y deshabilita la tecla virtual correspondiente
// Busca tanto por la letra original como normalizada para cubrir acentos y Ñ
export function colorearTecla(letraOriginal, esCorrecta) {
  // Buscar por la letra original primero
  let boton = document.querySelector(`.btn-tecla[data-letra="${letraOriginal.toUpperCase()}"]`);

  // Si no encontró, buscar por la versión normalizada
  if (!boton) {
    const letraNorm = normalizar(letraOriginal.toUpperCase());
    boton = document.querySelector(`.btn-tecla[data-letra="${letraNorm}"]`);
  }

  if (boton) {
    boton.disabled = true;
    boton.classList.remove("tecla-correcta", "tecla-incorrecta");
    boton.classList.add(esCorrecta ? "tecla-correcta" : "tecla-incorrecta");
  }
}

// Procesa una letra jugada (desde teclado virtual o físico)
export function manejarLetra(juego, letra, palabraRender, letrasUsadas) {
  letra = letra.toUpperCase();
  const letraNorm = normalizar(letra);

  // Ya fue usada: ignorar
  if (juego.letrasUsadas.includes(letraNorm)) return false;

  // Intentar la letra
  const esCorrecta = juego.intentarLetra(letra);

  // Colorear en el teclado (buscar por letra original para Ñ y acentuadas)
  colorearTecla(letra, esCorrecta);

  // Actualizar UI
  renderPalabra(juego, palabraRender);
  renderLetras(juego, letrasUsadas);
  renderAhorcado(juego.errores);

  return true;
}

// Botón "Volver arriba"
export function configurarScrollTop(btnTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) btnTop.classList.add("visible");
    else                       btnTop.classList.remove("visible");
  });

  btnTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
