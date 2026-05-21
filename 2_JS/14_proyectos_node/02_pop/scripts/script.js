// TP 02 — pop(): saco del final y el array se achica

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

const log = boot("pop");

const INICIAL_ANIMALES = ["Perro", "Gato", "Loro", "Pez"];
const INICIAL_COMPRAS = ["Leche", "Pan", "Frutas", "Café"];
const INICIAL_VACIADO = ["A", "B", "C", "D", "E"];

let animales = [...INICIAL_ANIMALES];
let compras = [...INICIAL_COMPRAS];
let vaciado = [...INICIAL_VACIADO];

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

const flow = (el, antes, op, despues, nota) => {
  paintFlow(el, { before: antes, operation: op, after: despues, note: nota });
};

const updateUI = () => {
  flow(dom.listaAni, [...animales], "listo para pop()", [...animales], "Un clic = un pop() al final.");
  flow(dom.listaCom, [...compras], "listo para pop()", [...compras], "Guardo lo eliminado en una variable.");
  flow(dom.listaVac, [...vaciado], "while + pop()", [...vaciado], "Vacio el array de a uno.");

  dom.btnAni.disabled = animales.length === 0;
  dom.btnCom.disabled = compras.length === 0;
  dom.btnVac.disabled = vaciado.length === 0;
};

dom.btnAni.onclick = () => {
  if (!animales.length) return;
  const antes = [...animales];
  animales.pop();
  log(`pop() eliminó el último de animales (quedan ${animales.length})`, "success");
  flow(dom.listaAni, antes, "pop()", [...animales], "Modifica el array original.");
  updateUI();
};

dom.btnCom.onclick = () => {
  if (!compras.length) return;
  const antes = [...compras];
  const eliminado = compras.pop();
  dom.resCom.className = "feedback-box feedback-danger";
  dom.resCom.innerHTML = `<i class="fas fa-trash me-2"></i>pop() devolvió: <strong>${eliminado}</strong>`;
  log(`pop() eliminó "${eliminado}" de compras`, "success");
  flow(dom.listaCom, antes, "const x = compras.pop()", [...compras]);
  updateUI();
};

dom.btnVac.onclick = () => {
  dom.btnVac.disabled = true;
  const interval = setInterval(() => {
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

dom.btnReset.onclick = () => {
  animales = [...INICIAL_ANIMALES];
  compras = [...INICIAL_COMPRAS];
  vaciado = [...INICIAL_VACIADO];
  dom.resCom.className = "feedback-box feedback-waiting";
  dom.resCom.textContent = "Esperando…";
  log("Reinicié pop()", "system");
  updateUI();
};

window.addEventListener("DOMContentLoaded", updateUI);
