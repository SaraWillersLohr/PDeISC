/**
 * Proyecto: 10 - map() "Transformación Maestra"
 * Objetivo: Demostrar map() mediante 3 casos literales e independientes.
 */

// --- DATOS INICIALES ---
const INICIAL_NUMEROS = [5, 10, 15, 20, 25];
const INICIAL_NOMBRES = ["ana", "beto", "carla", "daniel"];
const INICIAL_PRECIOS = [100, 250, 500, 1000];

// --- ESTADO ---
let numeros = [...INICIAL_NUMEROS];
let nombres = [...INICIAL_NOMBRES];
let precios = [...INICIAL_PRECIOS];

// --- DOM ---
const dom = {
  // Ejercicio 1
  displayOriginal1: document.getElementById("displayOriginal1"),
  displayResult1: document.getElementById("displayResult1"),
  btnMapX3: document.getElementById("btnMapX3"),

  // Ejercicio 2
  displayOriginal2: document.getElementById("displayOriginal2"),
  displayResult2: document.getElementById("displayResult2"),
  btnMapUpper: document.getElementById("btnMapUpper"),

  // Ejercicio 3
  displayOriginal3: document.getElementById("displayOriginal3"),
  displayResult3: document.getElementById("displayResult3"),
  btnMapIVA: document.getElementById("btnMapIVA"),

  // Global
  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const updateUI = () => {
  dom.displayOriginal1.textContent = `Original: [${numeros.join(", ")}]`;
  dom.displayOriginal2.textContent = `Original: ["${nombres.join('", "')}"]`;
  dom.displayOriginal3.textContent = `Original: [${precios.map((p) => "$" + p).join(", ")}]`;
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Crea un nuevo array con cada número multiplicado por 3
dom.btnMapX3.onclick = () => {
  // MÉTODO ARRAY: map() - Ejercicio 1
  const triplicados = numeros.map((n) => n * 3);

  dom.displayResult1.className =
    "array-display result-display mb-4 animate__animated animate__pulse";
  dom.displayResult1.textContent = `Resultado: [${triplicados.join(", ")}]`;
  dom.btnMapX3.disabled = true; // Deshabilitar después de transformar
};

// 2. Convierte un array de nombres en mayúsculas
dom.btnMapUpper.onclick = () => {
  // MÉTODO ARRAY: map() - Ejercicio 2
  const mayusculas = nombres.map((nombre) => nombre.toUpperCase());

  dom.displayResult2.className =
    "array-display result-display mb-4 animate__animated animate__pulse";
  dom.displayResult2.textContent = `Resultado: ["${mayusculas.join('", "')}"]`;
  dom.btnMapUpper.disabled = true; // Deshabilitar después de transformar
};

// 3. A un array de precios, agrégale el 21% de IVA y crea un nuevo array
dom.btnMapIVA.onclick = () => {
  // MÉTODO ARRAY: map() - Ejercicio 3
  const preciosConIVA = precios.map((precio) => {
    const conIVA = precio * 1.21;
    return conIVA.toFixed(2);
  });

  dom.displayResult3.className =
    "array-display result-display mb-4 animate__animated animate__pulse";
  dom.displayResult3.textContent = `Resultado: [${preciosConIVA.map((p) => "$" + p).join(", ")}]`;
  dom.btnMapIVA.disabled = true; // Deshabilitar después de transformar
};

// --- RESET ---

dom.btnReset.onclick = () => {
  numeros = [...INICIAL_NUMEROS];
  nombres = [...INICIAL_NOMBRES];
  precios = [...INICIAL_PRECIOS];

  // Habilitar botones
  dom.btnMapX3.disabled = false;
  dom.btnMapUpper.disabled = false;
  dom.btnMapIVA.disabled = false;

  // Limpiar resultados
  [dom.displayResult1, dom.displayResult2, dom.displayResult3].forEach((el) => {
    el.textContent = "Resultado: []";
    el.className = "array-display result-display mb-4";
  });

  updateUI();
};

// --- INIT ---
window.addEventListener("DOMContentLoaded", updateUI);
