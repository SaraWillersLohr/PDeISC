// TP 12 — reduce(): todo el array en un solo valor

import { boot } from "../../_shared/js/boot.js";
import { paintFlow, formatArrayLiteral } from "../../_shared/js/arrayDisplay.js";

const log = boot("reduce");

const INICIAL_ELEMENTOS = [5, 10, 15, 20];
const INICIAL_ENTEROS = [1, 2, 3, 4, 5];
const INICIAL_CARRITO = [
  { nombre: "Producto A", precio: 100 },
  { nombre: "Producto B", precio: 250 },
  { nombre: "Producto C", precio: 500 },
];

const elementos = [...INICIAL_ELEMENTOS];
const enteros = [...INICIAL_ENTEROS];
const carrito = [...INICIAL_CARRITO];

const dom = {
  displayOriginal1: document.getElementById("displayOriginal1"),
  resSum: document.getElementById("resSum"),
  btnSum: document.getElementById("btnSum"),
  displayOriginal2: document.getElementById("displayOriginal2"),
  resMult: document.getElementById("resMult"),
  btnMult: document.getElementById("btnMult"),
  displayOriginal3: document.getElementById("displayOriginal3"),
  resTotalObj: document.getElementById("resTotalObj"),
  btnTotalObj: document.getElementById("btnTotalObj"),
  btnReset: document.getElementById("btnReset"),
};

const flowReduce = (origEl, resEl, arr, valor, operacion) => {
  paintFlow(origEl, {
    before: arr,
    operation: operacion,
    after: arr,
    note: "reduce no modifica el array.",
  });
  if (resEl) {
    resEl.className = "result-box feedback-success";
    resEl.innerHTML = `<span class="flow-label">RESULTADO ÚNICO</span><br><strong>${valor}</strong><br><small>Array sigue: ${formatArrayLiteral(arr)}</small>`;
  }
};

const updateUI = () => {
  paintFlow(dom.displayOriginal1, {
    before: elementos,
    operation: "elementos.reduce((acc, n) => acc + n, 0)",
    after: elementos,
  });
  paintFlow(dom.displayOriginal2, {
    before: enteros,
    operation: "enteros.reduce((acc, n) => acc * n, 1)",
    after: enteros,
  });
  paintFlow(dom.displayOriginal3, {
    before: carrito,
    operation: "carrito.reduce((acc, i) => acc + i.precio, 0)",
    after: carrito,
  });
  [dom.resSum, dom.resMult, dom.resTotalObj].forEach((el, i) => {
    el.className = "result-box feedback-waiting";
    el.textContent = i === 2 ? "Resultado: $0" : "Resultado: 0";
  });
};

dom.btnSum.onclick = () => {
  const suma = elementos.reduce((acc, curr) => acc + curr, 0);
  log(`reduce() sumó → ${suma}`, "success");
  flowReduce(dom.displayOriginal1, dom.resSum, elementos, suma, "reduce suma");
  dom.btnSum.disabled = true;
};

dom.btnMult.onclick = () => {
  const producto = enteros.reduce((acc, curr) => acc * curr, 1);
  log(`reduce() multiplicó → ${producto}`, "success");
  flowReduce(dom.displayOriginal2, dom.resMult, enteros, producto, "reduce producto");
  dom.btnMult.disabled = true;
};

dom.btnTotalObj.onclick = () => {
  const total = carrito.reduce((acc, curr) => acc + curr.precio, 0);
  log(`reduce() total carrito → $${total}`, "success");
  flowReduce(dom.displayOriginal3, dom.resTotalObj, carrito, `$${total}`, "reduce precios");
  dom.btnTotalObj.disabled = true;
};

dom.btnReset.onclick = () => {
  dom.btnSum.disabled = false;
  dom.btnMult.disabled = false;
  dom.btnTotalObj.disabled = false;
  log("Reinicié reduce()", "system");
  updateUI();
};

window.addEventListener("DOMContentLoaded", updateUI);
