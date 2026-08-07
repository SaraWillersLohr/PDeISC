// abecedario español completo con ñ en el lugar correcto.
// se usa para crear el teclado virtual del juego del ahorcado.
const abecedario = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "Ñ",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

// crea el teclado activo durante una partida.
// cada botón llama a la función callback con la letra correspondiente.
//callback es la función que maneja la letra seleccionada por el jugador.
export function crearTeclado(contenedor, callback) {
  contenedor.innerHTML = "";

  abecedario.forEach((letra) => {
    const boton = document.createElement("button");
    boton.textContent = letra;
    boton.className = "btn-tecla";
    boton.setAttribute("data-letra", letra);
    boton.setAttribute("aria-label", `Letra ${letra}`);

    boton.addEventListener("click", () => {
      if (!boton.disabled) callback(letra);
    });

    contenedor.appendChild(boton);
  });
}

// muestra el teclado deshabilitado antes de empezar una partida.
// cada botón queda inactivo y no responde hasta que comienza el juego.
export function mostrarTecladoInactivo(contenedor) {
  contenedor.innerHTML = "";
  // se deshabilitan con disabled porque no se pueden usar hasta que empiece la partida.
  abecedario.forEach((letra) => {
    const boton = document.createElement("button");
    boton.textContent = letra;
    boton.className = "btn-tecla";
    boton.setAttribute("data-letra", letra);
    boton.setAttribute("aria-label", `Letra ${letra}`);
    boton.disabled = true;

    contenedor.appendChild(boton);
  });
}
//si se ingresa ua lera por teclado fisico, se deshabilita el boton correspondiente en el teclado virtual.
