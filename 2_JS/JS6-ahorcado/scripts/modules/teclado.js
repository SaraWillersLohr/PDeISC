const abecedario = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "Ñ", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];

export function crearTeclado(contenedor, callback) {
  contenedor.innerHTML = "";

  abecedario.forEach((letra) => {
    const boton = document.createElement("button");
    boton.textContent = letra;
    boton.className = "btn btn-tecla";
    boton.setAttribute("data-letra", letra);

    boton.addEventListener("click", () => {
      if (!boton.disabled) {
        callback(letra);
      }
    });

    contenedor.appendChild(boton);
  });
}
