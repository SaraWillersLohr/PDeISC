// ¡Hola! Hoy vamos a ver includes().
// Este método es genial porque solo nos dice true o false si un elemento existe en el array. ¡Muy práctico!

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

// Arranco mi consola para ver las respuestas de mis preguntas al array.
const log = boot("includes");

// Datos iniciales para preguntar.
const INICIAL_USUARIOS = ["pepe", "admin", "maria", "lucas"];
const INICIAL_COLORES = ["rojo", "azul", "amarillo", "blanco"];
const INICIAL_NUMEROS = [10, 20, 30, 40];

let usuarios = [...INICIAL_USUARIOS];
let colores = [...INICIAL_COLORES];
let numeros = [...INICIAL_NUMEROS];

// Referencias a los elementos del DOM.
const dom = {
  displayUsers: document.getElementById("displayUsers"),
  btnCheckAdmin: document.getElementById("btnCheckAdmin"),
  resAdmin: document.getElementById("resAdmin"),
  displayColores: document.getElementById("displayColores"),
  btnCheckVerde: document.getElementById("btnCheckVerde"),
  resVerde: document.getElementById("resVerde"),
  displayNumeros: document.getElementById("displayNumeros"),
  inputNumero: document.getElementById("inputNumero"),
  btnAddNumero: document.getElementById("btnAddNumero"),
  resNumero: document.getElementById("resNumero"),
  btnReset: document.getElementById("btnReset"),
};

// Función para mostrar el chequeo visualmente.
const flowCheck = (el, arr, valor, resultado, resEl) => {
  paintFlow(el, {
    before: arr,
    operation: `includes("${valor}") → ${resultado}`,
    after: arr,
    note: "includes no modifica el array.",
  });
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (resEl) {
    resEl.className = `feedback-box ${resultado ? "feedback-success" : "feedback-danger"}`;
    resEl.innerHTML = resultado
      ? `<i class="fas fa-check me-2"></i>Sí está: <strong>${valor}</strong>`
      : `<i class="fas fa-times me-2"></i>No está: <strong>${valor}</strong>`;
  }
};

// Actualizo la UI con el estado inicial.
const updateUI = () => {
  paintFlow(dom.displayUsers, {
    before: usuarios,
    operation: 'usuarios.includes("admin")',
    after: usuarios,
  });
  paintFlow(dom.displayColores, {
    before: colores,
    operation: 'colores.includes("verde")',
    after: colores,
  });
  paintFlow(dom.displayNumeros, {
    before: numeros,
    operation: "includes(n) antes de push",
    after: numeros,
  });
};

// Caso 1: Pregunto si "admin" está en la lista de usuarios.
dom.btnCheckAdmin.onclick = () => {
  const ok = usuarios.includes("admin");
  log(`includes("admin") → ${ok}`, ok ? "success" : "warn");
  flowCheck(dom.displayUsers, usuarios, "admin", ok, dom.resAdmin);
  dom.btnCheckAdmin.disabled = true;
};

// Caso 2: Pregunto si "verde" está en mi lista de colores.
dom.btnCheckVerde.onclick = () => {
  const ok = colores.includes("verde");
  log(`includes("verde") → ${ok}`, ok ? "success" : "warn");
  flowCheck(dom.displayColores, colores, "verde", ok, dom.resVerde);
  dom.btnCheckVerde.disabled = true;
};

// Caso 3: Uso includes() para evitar agregar números duplicados. ¡Súper útil!
dom.btnAddNumero.onclick = () => {
  const val = parseInt(dom.inputNumero.value, 10);
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (Number.isNaN(val)) {
    dom.resNumero.className = "feedback-box feedback-danger";
    dom.resNumero.textContent = "Número inválido";
    return;
  }

  const antes = [...numeros];
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (numeros.includes(val)) {
    log(`includes(${val}) → true, no agregué duplicado`, "warn");
    dom.resNumero.className = "feedback-box feedback-danger";
    dom.resNumero.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${val} ya existe.`;
    paintFlow(dom.displayNumeros, {
      before: antes,
      operation: `if (numeros.includes(${val})) → no push`,
      after: numeros,
    });
    return;
  }

  numeros.push(val);
  dom.inputNumero.value = "";
  dom.resNumero.className = "feedback-box feedback-success";
  dom.resNumero.innerHTML = `<i class="fas fa-plus me-2"></i>Agregué ${val} porque no estaba.`;
  log(`includes(${val}) → false, agregando con push()`, "success");
  paintFlow(dom.displayNumeros, {
    before: antes,
    operation: `push(${val}) porque no estaba`,
    after: [...numeros],
  });
};

// Reseteo todo para probar de nuevo.
dom.btnReset.onclick = () => {
  usuarios = [...INICIAL_USUARIOS];
  colores = [...INICIAL_COLORES];
  numeros = [...INICIAL_NUMEROS];
  [dom.resAdmin, dom.resVerde, dom.resNumero].forEach((el) => {
    el.className = "feedback-box feedback-waiting";
    el.textContent = "Esperando…";
  });
  dom.btnCheckAdmin.disabled = false;
  dom.btnCheckVerde.disabled = false;
  dom.inputNumero.value = "";
  log("Reinicié includes()", "system");
  updateUI();
};

// Inicio la interfaz.
window.addEventListener("DOMContentLoaded", updateUI);