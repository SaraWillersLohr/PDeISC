// ¡Hola! Bienvenidos al TP sobre unshift().
// A diferencia de push(), unshift() nos permite meter elementos al principio del array.

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

// Arranco mi consola para ver los movimientos.
const log = boot("unshift");

// Unos datos de prueba para empezar.
const POOL_COLORES = ["Rojo", "Azul", "Verde"];
const INICIAL_TAREAS = ["Lavar platos", "Hacer ejercicio"];
const INICIAL_USUARIOS = ["Maria99", "Juan_Dev"];

let colores = [];
let tareas = [...INICIAL_TAREAS];
let usuarios = [...INICIAL_USUARIOS];

// Mis referencias al DOM.
const dom = {
  listaCol: document.getElementById("listaCol"),
  btnCol: document.getElementById("btnCol"),
  resCol: document.getElementById("resCol"),
  listaTask: document.getElementById("listaTask"),
  inputTask: document.getElementById("inputTask"),
  btnTask: document.getElementById("btnTask"),
  resTask: document.getElementById("resTask"),
  listaUser: document.getElementById("listaUser"),
  inputUser: document.getElementById("inputUser"),
  btnUser: document.getElementById("btnUser"),
  resUser: document.getElementById("resUser"),
  btnReset: document.getElementById("btnReset"),
};

// Función para mostrar los cambios visuales.
const flow = (el, antes, op, despues, nota) =>
  paintFlow(el, { before: antes, operation: op, after: despues, note: nota });

// Actualizo la UI según el estado de mis arrays.
const updateUI = () => {
  flow(
    dom.listaCol,
    [...colores],
    colores.length ? "estado" : "unshift(...colores)",
    [...colores],
  );
  flow(dom.listaTask, [...tareas], "unshift(tarea urgente)", [...tareas]);
  flow(dom.listaUser, [...usuarios], "unshift(nombre)", [...usuarios]);
  dom.btnCol.disabled = colores.length > 0;
};

// Caso 1: Agrego tres colores al principio de un array vacío.
dom.btnCol.onclick = () => {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (colores.length) return;
  const antes = [];
  colores.unshift(...POOL_COLORES);
  dom.resCol.className = "feedback-box feedback-success";
  dom.resCol.innerHTML =
    '<i class="fas fa-check-circle me-2"></i>3 colores al inicio.';
  log(
    `unshift() agregó ${POOL_COLORES.length} colores al principio`,
    "success",
  );
  flow(dom.listaCol, antes, `unshift("${POOL_COLORES.join('", "')}")`, [
    ...colores,
  ]);
  updateUI();
};

// Caso 2: Agrego una tarea nueva, pero la marco como urgente y la pongo primera.
dom.btnTask.onclick = () => {
  const val = dom.inputTask.value.trim();
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!val) {
    dom.resTask.className = "feedback-box feedback-danger";
    dom.resTask.textContent = "Escribí una tarea";
    return;
  }
  const antes = [...tareas];
  const urgente = `⚠️ ${val}`;
  tareas.unshift(urgente);
  dom.inputTask.value = "";
  dom.resTask.className = "feedback-box feedback-success";
  dom.resTask.innerHTML =
    '<i class="fas fa-bolt me-2"></i>Tarea urgente al inicio.';
  log(`unshift() agregó "${urgente}"`, "success");
  flow(dom.listaTask, antes, `unshift("${urgente}")`, [...tareas]);
};

// Caso 3: Un nuevo usuario se conecta y aparece primero en la lista.
dom.btnUser.onclick = () => {
  const val = dom.inputUser.value.trim();
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!val) {
    dom.resUser.className = "feedback-box feedback-danger";
    dom.resUser.textContent = "Ingresá un nombre";
    return;
  }
  const antes = [...usuarios];
  usuarios.unshift(val);
  dom.inputUser.value = "";
  dom.resUser.className = "feedback-box feedback-success";
  dom.resUser.innerHTML =
    '<i class="fas fa-user-plus me-2"></i>Usuario al inicio de la cola.';
  log(`unshift() conectó a "${val}"`, "success");
  flow(dom.listaUser, antes, `unshift("${val}")`, [...usuarios]);
};

// Vuelvo todo a como estaba al principio.
dom.btnReset.onclick = () => {
  colores = [];
  tareas = [...INICIAL_TAREAS];
  usuarios = [...INICIAL_USUARIOS];
  [dom.resCol, dom.resTask, dom.resUser].forEach((el, i) => {
    el.className = "feedback-box feedback-waiting";
    el.textContent = ["Esperando…", "Agregá tarea urgente", "Ingresá nombre"][
      i
    ];
  });
  dom.inputTask.value = "";
  dom.inputUser.value = "";
  log("Reinicié unshift()", "system");
  updateUI();
};

// Inicio la UI.
window.addEventListener("DOMContentLoaded", updateUI);