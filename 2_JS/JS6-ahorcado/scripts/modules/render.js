// renderiza la palabra oculta
export function renderPalabra(juego, contenedor) {
  contenedor.textContent = juego.palabraOculta();
}

// renderiza letras usadas como pequeños badges circulares para coincidir con la landing
export function renderLetras(juego, contenedor) {
  contenedor.innerHTML = "";
  juego.letrasUsadas.forEach((letra) => {
    const span = document.createElement("span");
    span.textContent = letra;
    span.className = "badge-letra-usada";
    contenedor.appendChild(span);
  });
}

// muestra partes del cuerpo en secuencia obligatoria acumulativa
export function renderAhorcado(errores) {
  const partes = [
    "cabeza",
    "cuerpo",
    "brazoIzq",
    "brazoDer",
    "piernaIzq",
    "piernaDer"
  ];

  partes.forEach((parte, indice) => {
    const elemento = document.getElementById(parte);
    if (elemento) {
      if (indice < errores) {
        elemento.classList.remove("oculto");
        elemento.classList.add("visible");
      } else {
        elemento.classList.remove("visible");
        elemento.classList.add("oculto");
      }
    }
  });
}
