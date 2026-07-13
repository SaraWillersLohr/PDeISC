const normalizar = (c) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Renderiza la palabra oculta
export function renderPalabra(juego, contenedor) {
  contenedor.textContent = juego.palabraOculta();
}

// Renderiza letras incorrectas como burbujas rojas
export function renderLetras(juego, contenedor) {
  contenedor.innerHTML = "";

  const palabraNorm = normalizar(juego.palabra);

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

// Muestra partes del cuerpo de forma acumulativa y progresiva
export function renderAhorcado(errores) {
  const partes = ["cabeza", "cuerpo", "brazoIzq", "brazoDer", "piernaIzq", "piernaDer"];

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
