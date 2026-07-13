import { renderPalabra, renderLetras, renderAhorcado } from "./render.js";

// Colorea y deshabilita la tecla virtual correspondiente
export function colorearTecla(letra, esCorrecta) {
  const boton = document.querySelector(`.btn-tecla[data-letra="${letra.toUpperCase()}"]`);
  if (boton) {
    boton.disabled = true;
    if (esCorrecta) {
      boton.classList.add("tecla-correcta");
    } else {
      boton.classList.add("tecla-incorrecta");
    }
  }
}

// Procesa una letra jugada (virtual o física)
export function manejarLetra(juego, letra, palabraRender, letrasUsadas) {
  letra = letra.toUpperCase();
  
  // Normalizar para verificar si ya fue usada
  const normalizar = (c) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const letraNorm = normalizar(letra);

  if (juego.letrasUsadas.includes(letraNorm)) {
    return false; // Ya fue jugada, ignorar
  }

  // Intentar la letra
  const esCorrecta = juego.intentarLetra(letra);

  // Aplicar color en el teclado
  colorearTecla(letraNorm, esCorrecta);

  // Renderizar cambios
  renderPalabra(juego, palabraRender);
  renderLetras(juego, letrasUsadas);
  renderAhorcado(juego.errores);

  return true;
}

// Configura el botón "Volver arriba" de forma animada
export function configurarScrollTop(btnTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      btnTop.classList.add("visible");
    } else {
      btnTop.classList.remove("visible");
    }
  });

  btnTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}
