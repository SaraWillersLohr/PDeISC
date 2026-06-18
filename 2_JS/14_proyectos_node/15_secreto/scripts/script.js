// Proyecto 15: decodifico mensajes con bloques invertidos entre paréntesis.
// Demuestro arrays, strings, split(), reverse(), join() y push() sin usar una regex gigante.

import { boot } from "../../_shared/js/boot.js";

const MENSAJE_INICIAL =
  "Hoy (.sh 22 sal a) (ed asac ne sominuer son) Marcelo.";

// Arranco consola visual y tema compartido del TP.
const log = boot("secreto");

const dom = {
  inputMensaje: document.getElementById("inputMensaje"),
  btnDecodificar: document.getElementById("btnDecodificar"),
  btnReset: document.getElementById("btnReset"),
  btnBackTop: document.getElementById("btnBackTop"),
  displayOriginal: document.getElementById("displayOriginal"),
  displayBloques: document.getElementById("displayBloques"),
  displayTransformacion: document.getElementById("displayTransformacion"),
  displayResultado: document.getElementById("displayResultado"),
  stepOriginal: document.getElementById("stepOriginal"),
  stepBloques: document.getElementById("stepBloques"),
  stepTransformacion: document.getElementById("stepTransformacion"),
  stepResultado: document.getElementById("stepResultado"),
};

// busco bloques codificados recorriendo el texto carácter a carácter
function detectarBloques(texto) {
  const bloques = [];
  let indice = 0;

  // Repite mientras la condición sea verdadera.
  while (indice < texto.length) {
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (texto[indice] === "(") {
      const inicio = indice;
      let contenido = "";
      indice += 1;

      // Repite mientras la condición sea verdadera.
      while (indice < texto.length && texto[indice] !== ")") {
        contenido += texto[indice];
        indice += 1;
      }

      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (texto[indice] === ")") {
        const fin = indice;
        bloques.push({
          inicio,
          fin,
          original: texto.slice(inicio, fin + 1),
          contenido,
        });
      }
    }

    indice += 1;
  }

  return bloques;
}

// invierto caracteres con split → reverse → join
function invertirTexto(texto) {
  const caracteres = texto.split("");
  caracteres.reverse();
  return caracteres.join("");
}

// armo el mensaje final reemplazando cada bloque por su versión invertida
function decodificarMensaje(texto) {
  const bloques = detectarBloques(texto);
  const partes = [];
  let ultimoCorte = 0;

  bloques.forEach((bloque) => {
    const textoPlano = texto.slice(ultimoCorte, bloque.inicio);
    partes.push(textoPlano);

    const invertido = invertirTexto(bloque.contenido);
    bloque.invertido = invertido;
    partes.push(invertido);

    ultimoCorte = bloque.fin + 1;
  });

  partes.push(texto.slice(ultimoCorte));

  return {
    bloques,
    resultado: partes.join(""),
  };
}

// escapo HTML para mostrar texto sin romper la interfaz
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// marco visualmente el paso activo del pipeline
function resaltarPaso(pasoActivo) {
  const pasos = [
    dom.stepOriginal,
    dom.stepBloques,
    dom.stepTransformacion,
    dom.stepResultado,
  ];

  pasos.forEach((paso) => paso.classList.remove("pipeline-step--active"));
  pasoActivo.classList.add("pipeline-step--active");
}

// actualizo la interfaz con el estado inicial
function mostrarEstadoInicial() {
  dom.displayOriginal.textContent = MENSAJE_INICIAL;
  dom.displayBloques.innerHTML =
    '<p class="pipeline-step__content text-muted mb-0">Esperando decodificación…</p>';
  dom.displayTransformacion.innerHTML =
    '<p class="pipeline-step__content text-muted mb-0">Acá verás cada bloque invertido.</p>';
  dom.displayResultado.textContent = "—";
  resaltarPaso(dom.stepOriginal);
}

// muestro los bloques detectados como tarjetas
function pintarBloques(bloques) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (bloques.length === 0) {
    dom.displayBloques.innerHTML =
      '<p class="pipeline-step__content text-muted mb-0">No se encontraron bloques entre paréntesis.</p>';
    return;
  }

  dom.displayBloques.innerHTML = bloques
    .map(
      (bloque, i) => `
      <div class="bloque-card">
        <div class="bloque-card__titulo">Bloque ${i + 1}</div>
        <div class="bloque-card__fila">
          <span class="bloque-card__clave">Detectado:</span>
          <span class="bloque-card__valor">${escaparHtml(bloque.original)}</span>
        </div>
      </div>
    `,
    )
    .join("");
}

// muestro la transformación de cada bloque (contenido e invertido)
function pintarTransformacion(bloques) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (bloques.length === 0) {
    dom.displayTransformacion.innerHTML =
      '<p class="pipeline-step__content text-muted mb-0">Sin transformaciones.</p>';
    return;
  }

  dom.displayTransformacion.innerHTML = bloques
    .map(
      (bloque, i) => `
      <div class="bloque-card">
        <div class="bloque-card__titulo">Bloque ${i + 1}</div>
        <div class="bloque-card__fila">
          <span class="bloque-card__clave">Bloque original:</span>
          <span class="bloque-card__valor">${escaparHtml(bloque.original)}</span>
        </div>
        <div class="bloque-card__fila">
          <span class="bloque-card__clave">Contenido:</span>
          <span class="bloque-card__valor">${escaparHtml(bloque.contenido)}</span>
        </div>
        <div class="bloque-card__fila">
          <span class="bloque-card__clave">Invertido:</span>
          <span class="bloque-card__valor bloque-card__valor--ok">${escaparHtml(bloque.invertido)}</span>
        </div>
      </div>
    `,
    )
    .join("");
}

// actualizo la interfaz después de decodificar
function actualizarInterfaz(mensaje, datos) {
  dom.displayOriginal.textContent = mensaje;
  pintarBloques(datos.bloques);
  pintarTransformacion(datos.bloques);
  dom.displayResultado.textContent = datos.resultado;
  resaltarPaso(dom.stepResultado);
}

// configuro el botón volver arriba
function initBackToTop() {
  // Función toggleBtn que organiza esta parte del código.
  const toggleBtn = () => {
    dom.btnBackTop.classList.toggle("btn-back-top--visible", window.scrollY > 280);
  };

  window.addEventListener("scroll", toggleBtn, { passive: true });
  dom.btnBackTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  toggleBtn();
}

// decodifico el mensaje ingresado
dom.btnDecodificar.onclick = () => {
  const mensaje = dom.inputMensaje.value.trim();

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!mensaje) {
    log("Ingresá un mensaje para decodificar.", "warn");
    return;
  }

  log("Inicio decodificación del mensaje.", "system");
  log(`Mensaje original: "${mensaje}"`, "info");

  const datos = decodificarMensaje(mensaje);

  log(`Bloques detectados: ${datos.bloques.length}`, "info");

  datos.bloques.forEach((bloque, i) => {
    log(
      `Bloque ${i + 1}: "${bloque.original}" → contenido "${bloque.contenido}" → invertido "${bloque.invertido}"`,
      "success",
    );
  });

  log(`Resultado final: "${datos.resultado}"`, "success");
  actualizarInterfaz(mensaje, datos);
};

// reinicio el ejercicio al mensaje precargado
dom.btnReset.onclick = () => {
  dom.inputMensaje.value = MENSAJE_INICIAL;
  mostrarEstadoInicial();
  log("Ejercicio reiniciado con el mensaje de ejemplo.", "system");
};

// inicio la interfaz
mostrarEstadoInicial();
initBackToTop();