// ¡Hola! Hoy vamos a ver reduce(), uno de los métodos más potentes (y a veces confusos) de los arrays.
// Sirve para "reducir" todo un array a un único valor (una suma, un producto, un objeto, etc.).

import { boot } from "../../_shared/js/boot.js";
import { paintFlow, formatArrayLiteral } from "../../_shared/js/arrayDisplay.js";

// Arranco mi consola para ver cómo se va acumulando el resultado.
const log = boot("reduce");

// Datos para reducir.
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

// Referencias a los elementos del DOM.
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

// Función para mostrar visualmente el resultado de la reducción.
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

// Actualizo la UI con el estado inicial y las operaciones que vamos a hacer.
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

// Caso 1: Sumo todos los números del array.
dom.btnSum.onclick = () => {
  const suma = elementos.reduce((acc, curr) => acc + curr, 0);
  log(`reduce() sumó → ${suma}`, "success");
  flowReduce(dom.displayOriginal1, dom.resSum, elementos, suma, "reduce suma");
  dom.btnSum.disabled = true;
};

// Caso 2: Multiplico todos los números (producto).
dom.btnMult.onclick = () => {
  const producto = enteros.reduce((acc, curr) => acc * curr, 1);
  log(`reduce() multiplicó → ${producto}`, "success");
  flowReduce(dom.displayOriginal2, dom.resMult, enteros, producto, "reduce producto");
  dom.btnMult.disabled = true;
};

// Caso 3: Sumo los precios de una lista de objetos (como un carrito de compras).
dom.btnTotalObj.onclick = () => {
  const total = carrito.reduce((acc, curr) => acc + curr.precio, 0);
  log(`reduce() total carrito → $${total}`, "success");
  flowReduce(dom.displayOriginal3, dom.resTotalObj, carrito, `$${total}`, "reduce precios");
  dom.btnTotalObj.disabled = true;
};

// Reseteo todo para volver a reducir.
dom.btnReset.onclick = () => {
  dom.btnSum.disabled = false;
  dom.btnMult.disabled = false;
  dom.btnTotalObj.disabled = false;
  log("Reinicié reduce()", "system");
  updateUI();
};

// Inicio la interfaz.
window.addEventListener("DOMContentLoaded", updateUI);
