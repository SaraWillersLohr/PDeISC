// ¡Hola! En este TP vamos a ver el método pop().
// Básicamente, sirve para quitar el último elemento de un array. ¡Es como el opuesto a push!

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

// Arranco mi consola para ver qué vamos eliminando.
const log = boot("pop");

// Mis listas iniciales para tener algo que borrar.
const INICIAL_ANIMALES = ["Perro", "Gato", "Loro", "Pez"];
const INICIAL_COMPRAS = ["Leche", "Pan", "Frutas", "Café"];
const INICIAL_VACIADO = ["A", "B", "C", "D", "E"];

let animales = [...INICIAL_ANIMALES];
let compras = [...INICIAL_COMPRAS];
let vaciado = [...INICIAL_VACIADO];

// Aquí guardo las referencias a los elementos de mi página.
const dom = {
  listaAni: document.getElementById("listaAni"),
  btnAni: document.getElementById("btnAni"),
  listaCom: document.getElementById("listaCom"),
  btnCom: document.getElementById("btnCom"),
  resCom: document.getElementById("resCom"),
  listaVac: document.getElementById("listaVac"),
  btnVac: document.getElementById("btnVac"),
  btnReset: document.getElementById("btnReset"),
};

// Una función cortita para pintar los cambios en la pantalla.
const flow = (el, antes, op, despues, nota) => {
  paintFlow(el, { before: antes, operation: op, after: despues, note: nota });
};

// Actualizo mi interfaz y deshabilito botones si no hay nada más que borrar.
const updateUI = () => {
  flow(dom.listaAni, [...animales], "listo para pop()", [...animales], "Un clic = un pop() al final.");
  flow(dom.listaCom, [...compras], "listo para pop()", [...compras], "Guardo lo eliminado en una variable.");
  flow(dom.listaVac, [...vaciado], "while + pop()", [...vaciado], "Vacio el array de a uno.");

  dom.btnAni.disabled = animales.length === 0;
  dom.btnCom.disabled = compras.length === 0;
  dom.btnVac.disabled = vaciado.length === 0;
};

// Caso 1: Borro un animal del final. ¡Chau pez!
dom.btnAni.onclick = () => {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!animales.length) return;
  const antes = [...animales];
  animales.pop();
  log(`pop() eliminó el último de animales (quedan ${animales.length})`, "success");
  flow(dom.listaAni, antes, "pop()", [...animales], "Modifica el array original.");
  updateUI();
};

// Caso 2: Borro algo de las compras pero guardo qué fue lo que borré.
dom.btnCom.onclick = () => {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!compras.length) return;
  const antes = [...compras];
  const eliminado = compras.pop();
  dom.resCom.className = "feedback-box feedback-danger";
  dom.resCom.innerHTML = `<i class="fas fa-trash me-2"></i>pop() devolvió: <strong>${eliminado}</strong>`;
  log(`pop() eliminó "${eliminado}" de compras`, "success");
  flow(dom.listaCom, antes, "const x = compras.pop()", [...compras]);
  updateUI();
};

// Caso 3: Vaciado automático usando un intervalo (como si fuera un loop).
dom.btnVac.onclick = () => {
  dom.btnVac.disabled = true;
  // Función interval que organiza esta parte del código.
  const interval = setInterval(() => {
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!vaciado.length) {
      clearInterval(interval);
      log("while terminó: array vacío con pop()", "system");
      updateUI();
      return;
    }
    const antes = [...vaciado];
    const sacado = vaciado.pop();
    log(`pop() eliminó "${sacado}" (quedan ${vaciado.length})`, "info");
    flow(dom.listaVac, antes, "vaciado.pop() dentro del while", [...vaciado]);
  }, 220);
};

// Reseteo todo a sus valores originales.
dom.btnReset.onclick = () => {
  animales = [...INICIAL_ANIMALES];
  compras = [...INICIAL_COMPRAS];
  vaciado = [...INICIAL_VACIADO];
  dom.resCom.className = "feedback-box feedback-waiting";
  dom.resCom.textContent = "Esperando…";
  log("Reinicié pop()", "system");
  updateUI();
};

// Inicio la UI apenas carga la página.
window.addEventListener("DOMContentLoaded", updateUI);