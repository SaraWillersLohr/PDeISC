// Abecedario español completo con Ñ en su lugar correcto
const abecedario = [
  "A","B","C","D","E","F","G","H","I",
  "J","K","L","M","N","Ñ","O","P","Q",
  "R","S","T","U","V","W","X","Y","Z"
];

// Crea el teclado activo (durante una partida)
export function crearTeclado(contenedor, callback) {
  contenedor.innerHTML = "";

  abecedario.forEach((letra) => {
    const boton = document.createElement("button");
    boton.textContent = letra;
    boton.className   = "btn-tecla";
    boton.setAttribute("data-letra", letra);
    boton.setAttribute("aria-label", `Letra ${letra}`);

    boton.addEventListener("click", () => {
      if (!boton.disabled) callback(letra);
    });

    contenedor.appendChild(boton);
  });
}

// Muestra el teclado deshabilitado (antes de iniciar partida)
export function mostrarTecladoInactivo(contenedor) {
  contenedor.innerHTML = "";

  abecedario.forEach((letra) => {
    const boton = document.createElement("button");
    boton.textContent = letra;
    boton.className   = "btn-tecla";
    boton.setAttribute("data-letra", letra);
    boton.setAttribute("aria-label", `Letra ${letra}`);
    boton.disabled    = true;

    contenedor.appendChild(boton);
  });
}
