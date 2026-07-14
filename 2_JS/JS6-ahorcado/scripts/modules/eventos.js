// maneja los eventos del juego, como el teclado virtual, el teclado físico y el botón de subir.
import { renderPalabra, renderLetras, renderAhorcado } from "./render.js";
// normaliza los caracteres para quitar acentos y diacríticos.
const normalizar = (c) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// cambia el color de la tecla y la deshabilita cuando se usa.
// busca la tecla por la letra original o normalizada para cubrir acentos y ñ.
export function colorearTecla(letraOriginal, esCorrecta) {
  // Buscar por la letra original primero
  let boton = document.querySelector(
    `.btn-tecla[data-letra="${letraOriginal.toUpperCase()}"]`,
  );

  // Si no encontró, buscar por la versión normalizada
  if (!boton) {
    const letraNorm = normalizar(letraOriginal.toUpperCase());
    boton = document.querySelector(`.btn-tecla[data-letra="${letraNorm}"]`);
  }
  // Si encontró el botón, deshabilitarlo y aplicar la clase correspondiente
  if (boton) {
    boton.disabled = true;
    boton.classList.remove("tecla-correcta", "tecla-incorrecta");
    boton.classList.add(esCorrecta ? "tecla-correcta" : "tecla-incorrecta");
  }
}

// procesa una letra usada desde el teclado virtual o físico.
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

// controla el botón para volver arriba de la página.
export function configurarScrollTop(btnTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) btnTop.classList.add("visible");
    else btnTop.classList.remove("visible");
  });
  // Al hacer clic, hacer scroll suave hacia arriba
  btnTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
