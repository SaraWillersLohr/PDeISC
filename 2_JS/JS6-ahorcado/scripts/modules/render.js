// muestra la palabra oculta, las letras equivocadas y el ahorcado en la interfaz.
// la función renderPalabra actualiza el contenido del contenedor con la palabra del juego.
const normalizar = (c) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// muestra la palabra oculta en la interfaz.
export function renderPalabra(juego, contenedor) {
  contenedor.textContent = juego.palabraOculta();
}

// muestra las letras incorrectas como burbujas rojas.

export function renderLetras(juego, contenedor) {
  contenedor.innerHTML = "";

  const palabraNorm = normalizar(juego.palabra);
  // Recorrer las letras usadas y mostrar solo las incorrectas
  juego.letrasUsadas.forEach((letra) => {
    // Solo mostrar las incorrectas en las burbujas
    if (!palabraNorm.includes(normalizar(letra))) {
      const span = document.createElement("span");
      span.textContent = letra;
      span.className = "badge-letra-usada";
      span.setAttribute("aria-label", `Letra incorrecta: ${letra}`);
      contenedor.appendChild(span);
    }
  });
}

// muestra las partes del cuerpo de forma progresiva según los errores.
export function renderAhorcado(errores) {
  const partes = [
    "cabeza",
    "cuerpo",
    "brazoIzq",
    "brazoDer",
    "piernaIzq",
    "piernaDer",
  ];

  partes.forEach((parte, indice) => {
    const el = document.getElementById(parte);
    if (!el) return;

    if (indice < errores) {
      el.classList.remove("oculto");
      el.classList.add("visible");
    } else {
      el.classList.remove("visible");
      el.classList.add("oculto");
    }
  });
}
