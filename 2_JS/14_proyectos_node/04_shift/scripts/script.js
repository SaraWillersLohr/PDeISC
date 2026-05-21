// TP 04 — shift(): saco del inicio (cola FIFO)

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

const log = boot("shift");

const INICIAL_ENTEROS = [10, 20, 30, 40, 50];
const INICIAL_MENSAJES = ["Hola", "¿Qué tal?", "Todo bien", "Adiós"];
const INICIAL_COLA = ["Carlos", "Marta", "Pedro", "Lucía"];

let enteros = [...INICIAL_ENTEROS];
let mensajes = [...INICIAL_MENSAJES];
let cola = [...INICIAL_COLA];

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

const flow = (el, antes, op, despues, nota) =>
  paintFlow(el, { before: antes, operation: op, after: despues, note: nota });

const updateUI = () => {
  flow(dom.listaNum, [...enteros], "shift()", [...enteros]);
  flow(dom.listaMsg, [...mensajes], "shift()", [...mensajes]);
  flow(dom.listaCola, [...cola], "const atendido = cola.shift()", [...cola]);

  dom.btnNum.disabled = !enteros.length;
  dom.btnMsg.disabled = !mensajes.length;
  dom.btnCola.disabled = !cola.length;
};

dom.btnNum.onclick = () => {
  if (!enteros.length) return;
  const antes = [...enteros];
  const sacado = enteros.shift();
  log(`shift() quitó ${sacado} del inicio (enteros)`, "success");
  flow(dom.listaNum, antes, "enteros.shift()", [...enteros]);
  updateUI();
};

dom.btnMsg.onclick = () => {
  if (!mensajes.length) return;
  const antes = [...mensajes];
  const sacado = mensajes.shift();
  log(`shift() eliminó el mensaje "${sacado}"`, "success");
  flow(dom.listaMsg, antes, "mensajes.shift()", [...mensajes]);
  updateUI();
};

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

dom.btnReset.onclick = () => {
  enteros = [...INICIAL_ENTEROS];
  mensajes = [...INICIAL_MENSAJES];
  cola = [...INICIAL_COLA];
  dom.resCola.className = "feedback-box feedback-waiting";
  dom.resCola.textContent = "Esperando…";
  log("Reinicié shift()", "system");
  updateUI();
};

window.addEventListener("DOMContentLoaded", updateUI);
