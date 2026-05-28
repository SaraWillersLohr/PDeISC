// ¡Hola! En este TP vamos a ver el método shift().
// Es el opuesto a unshift(): sirve para sacar el primer elemento del array. ¡Ideal para filas!

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

// Arranco mi consola para ver quién sale primero.
const log = boot("shift");

// Listas iniciales para probar el método.
const INICIAL_ENTEROS = [10, 20, 30, 40, 50];
const INICIAL_MENSAJES = ["Hola", "¿Qué tal?", "Todo bien", "Adiós"];
const INICIAL_COLA = ["Carlos", "Marta", "Pedro", "Lucía"];

let enteros = [...INICIAL_ENTEROS];
let mensajes = [...INICIAL_MENSAJES];
let cola = [...INICIAL_COLA];

// Mis referencias a los elementos de la página.
const dom = {
  listaNum: document.getElementById("listaNum"),
  btnNum: document.getElementById("btnNum"),
  listaMsg: document.getElementById("listaMsg"),
  btnMsg: document.getElementById("btnMsg"),
  listaCola: document.getElementById("listaCola"),
  btnCola: document.getElementById("btnCola"),
  resCola: document.getElementById("resCola"),
  btnReset: document.getElementById("btnReset"),
};

// Función para pintar los cambios visuales.
const flow = (el, antes, op, despues, nota) =>
  paintFlow(el, { before: antes, operation: op, after: despues, note: nota });

// Actualizo la UI y bloqueo botones si ya no queda nada que sacar.
const updateUI = () => {
  flow(dom.listaNum, [...enteros], "shift()", [...enteros]);
  flow(dom.listaMsg, [...mensajes], "shift()", [...mensajes]);
  flow(dom.listaCola, [...cola], "const atendido = cola.shift()", [...cola]);

  dom.btnNum.disabled = !enteros.length;
  dom.btnMsg.disabled = !mensajes.length;
  dom.btnCola.disabled = !cola.length;
};

// Caso 1: Saco el primer número de la lista.
dom.btnNum.onclick = () => {
  if (!enteros.length) return;
  const antes = [...enteros];
  const sacado = enteros.shift();
  log(`shift() quitó ${sacado} del inicio (enteros)`, "success");
  flow(dom.listaNum, antes, "enteros.shift()", [...enteros]);
  updateUI();
};

// Caso 2: Saco el primer mensaje.
dom.btnMsg.onclick = () => {
  if (!mensajes.length) return;
  const antes = [...mensajes];
  const sacado = mensajes.shift();
  log(`shift() eliminó el mensaje "${sacado}"`, "success");
  flow(dom.listaMsg, antes, "mensajes.shift()", [...mensajes]);
  updateUI();
};

// Caso 3: Atiendo al primer cliente de la fila y lo saco de la cola.
dom.btnCola.onclick = () => {
  if (!cola.length) return;
  const antes = [...cola];
  const cliente = cola.shift();
  dom.resCola.className = "feedback-box feedback-success";
  dom.resCola.innerHTML = `<i class="fas fa-headset me-2"></i>Atendiendo a: <strong>${cliente}</strong>`;
  log(`shift() sacó a "${cliente}" de la cola`, "success");
  flow(dom.listaCola, antes, "const cliente = cola.shift()", [...cola], "Simulo atención al cliente.");
  updateUI();
};

// Reseteo todo a los valores iniciales.
dom.btnReset.onclick = () => {
  enteros = [...INICIAL_ENTEROS];
  mensajes = [...INICIAL_MENSAJES];
  cola = [...INICIAL_COLA];
  dom.resCola.className = "feedback-box feedback-waiting";
  dom.resCola.textContent = "Esperando…";
  log("Reinicié shift()", "system");
  updateUI();
};

// Inicio la interfaz.
window.addEventListener("DOMContentLoaded", updateUI);
