// ¡Hola! Hoy vamos a ver map().
// A diferencia de forEach(), map() crea un array nuevo con los resultados de la transformación. ¡Es súper potente!

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

// Arranco mi consola para ver cómo se transforman mis datos.
const log = boot("map");

// Datos iniciales que se van a transformar.
const INICIAL_NUMEROS = [5, 10, 15, 20, 25];
const INICIAL_NOMBRES = ["ana", "beto", "carla", "daniel"];
const INICIAL_PRECIOS = [100, 250, 500, 1000];

const numeros = [...INICIAL_NUMEROS];
const nombres = [...INICIAL_NOMBRES];
const precios = [...INICIAL_PRECIOS];

// Referencias a los elementos del DOM.
const dom = {
  displayOriginal1: document.getElementById("displayOriginal1"),
  displayResult1: document.getElementById("displayResult1"),
  btnMapX3: document.getElementById("btnMapX3"),
  displayOriginal2: document.getElementById("displayOriginal2"),
  displayResult2: document.getElementById("displayResult2"),
  btnMapUpper: document.getElementById("btnMapUpper"),
  displayOriginal3: document.getElementById("displayOriginal3"),
  displayResult3: document.getElementById("displayResult3"),
  btnMapIVA: document.getElementById("btnMapIVA"),
  btnReset: document.getElementById("btnReset"),
};

// Función para mostrar el proceso de mapeo visualmente.
const flowMap = (origEl, resEl, original, resultado, operacion) => {
  paintFlow(origEl, {
    before: original,
    operation: operacion,
    after: original,
    note: "El original NO cambia (map devuelve otro array).",
  });
  paintFlow(resEl, {
    before: [],
    operation: "array nuevo devuelto por map",
    after: resultado,
    note: "Este es el resultado que guardé en una variable.",
  });
};

// Actualizo la UI con el estado inicial.
const updateUI = () => {
  flowMap(dom.displayOriginal1, dom.displayResult1, numeros, [], "numeros.map(n => n * 3)");
  flowMap(dom.displayOriginal2, dom.displayResult2, nombres, [], 'nombres.map(n => n.toUpperCase())');
  flowMap(
    dom.displayOriginal3,
    dom.displayResult3,
    precios,
    [],
    "precios.map(p => p * 1.21)",
  );
};

// Caso 1: Triplico cada número.
dom.btnMapX3.onclick = () => {
  const triplicados = numeros.map((n) => n * 3);
  log(`map() creó un nuevo array con ${triplicados.length} números (×3)`, "success");
  flowMap(dom.displayOriginal1, dom.displayResult1, numeros, triplicados, "numeros.map(n => n * 3)");
  dom.btnMapX3.disabled = true;
};

// Caso 2: Convierto todos los nombres a MAYÚSCULAS.
dom.btnMapUpper.onclick = () => {
  const mayusculas = nombres.map((nombre) => nombre.toUpperCase());
  log(`map() convirtió ${mayusculas.length} nombres a mayúsculas`, "success");
  flowMap(dom.displayOriginal2, dom.displayResult2, nombres, mayusculas, "nombres.map(n => n.toUpperCase())");
  dom.btnMapUpper.disabled = true;
};

// Caso 3: Calculo el IVA (21%) para cada precio de mi lista.
dom.btnMapIVA.onclick = () => {
  const preciosConIVA = precios.map((precio) => Number((precio * 1.21).toFixed(2)));
  log(`map() calculó IVA en ${preciosConIVA.length} precios`, "success");
  flowMap(
    dom.displayOriginal3,
    dom.displayResult3,
    precios,
    preciosConIVA,
    "precios.map(p => p * 1.21)",
  );
  dom.btnMapIVA.disabled = true;
};

// Reseteo todo para volver a transformar.
dom.btnReset.onclick = () => {
  dom.btnMapX3.disabled = false;
  dom.btnMapUpper.disabled = false;
  dom.btnMapIVA.disabled = false;
  log("Reinicié map()", "system");
  updateUI();
};

// Inicio la interfaz.
window.addEventListener("DOMContentLoaded", updateUI);
