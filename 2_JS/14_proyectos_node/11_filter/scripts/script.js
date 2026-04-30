/**
 * Proyecto: 11 - filter() "Filtrado Maestro"
 * Objetivo: Demostrar filter() mediante 3 casos literales e independientes.
 */

// --- DATOS INICIALES ---
const INICIAL_NUMEROS = [2, 15, 8, 20, 5, 12, 30];
const INICIAL_PALABRAS = [
  "sol",
  "planeta",
  "luz",
  "estrellas",
  "galaxia",
  "mar",
];
const INICIAL_USUARIOS = [
  { nombre: "Ana", activo: true },
  { nombre: "Beto", activo: false },
  { nombre: "Carla", activo: true },
  { nombre: "Daniel", activo: false },
];

// --- ESTADO ---
let numeros = [...INICIAL_NUMEROS];
let palabras = [...INICIAL_PALABRAS];
let usuarios = [...INICIAL_USUARIOS];

// --- DOM ---
const dom = {
  // Ejercicio 1
  displayOriginal1: document.getElementById("displayOriginal1"),
  displayResult1: document.getElementById("displayResult1"),
  btnFilterNums: document.getElementById("btnFilterNums"),

  // Ejercicio 2
  displayOriginal2: document.getElementById("displayOriginal2"),
  displayResult2: document.getElementById("displayResult2"),
  btnFilterWords: document.getElementById("btnFilterWords"),

  // Ejercicio 3
  displayOriginal3: document.getElementById("displayOriginal3"),
  displayResult3: document.getElementById("displayResult3"),
  btnFilterActive: document.getElementById("btnFilterActive"),

  // Global
  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const updateUI = () => {
  dom.displayOriginal1.textContent = `Original: [${numeros.join(", ")}]`;
  dom.displayOriginal2.textContent = `Original: ["${palabras.join('", "')}"]`;
  dom.displayOriginal3.textContent = `Original: [${usuarios.map((u) => u.nombre + (u.activo ? "✓" : "✗")).join(", ")}]`;
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Filtra los números mayores a 10 de un array
dom.btnFilterNums.onclick = () => {
  // MÉTODO ARRAY: filter() - Ejercicio 1
  const mayoresADiez = numeros.filter((n) => n > 10);

  dom.displayResult1.className =
    "array-display result-display mb-4 animate__animated animate__fadeIn";
  dom.displayResult1.textContent = `Filtrados: [${mayoresADiez.join(", ")}]`;
  dom.btnFilterNums.disabled = true; // Deshabilitar después de filtrar
};

// 2. Dado un array de palabras, filtra las que tengan más de 5 letras
dom.btnFilterWords.onclick = () => {
  // MÉTODO ARRAY: filter() - Ejercicio 2
  const largas = palabras.filter((p) => p.length > 5);

  dom.displayResult2.className =
    "array-display result-display mb-4 animate__animated animate__fadeIn";
  dom.displayResult2.textContent = `Filtrados: ["${largas.join('", "')}"]`;
  dom.btnFilterWords.disabled = true; // Deshabilitar después de filtrar
};

// 3. Filtra los usuarios activos de un array de objetos {nombre, activo}
dom.btnFilterActive.onclick = () => {
  // MÉTODO ARRAY: filter() - Ejercicio 3
  const activos = usuarios.filter((u) => u.activo);

  dom.displayResult3.className =
    "array-display result-display mb-4 animate__animated animate__fadeIn";
  dom.displayResult3.textContent = `Filtrados: [${activos.map((u) => u.nombre).join(", ")}]`;
  dom.btnFilterActive.disabled = true; // Deshabilitar después de filtrar
};

// --- RESET ---

dom.btnReset.onclick = () => {
  numeros = [...INICIAL_NUMEROS];
  palabras = [...INICIAL_PALABRAS];
  usuarios = [...INICIAL_USUARIOS];

  // Habilitar botones
  dom.btnFilterNums.disabled = false;
  dom.btnFilterWords.disabled = false;
  dom.btnFilterActive.disabled = false;

  // Limpiar resultados
  [dom.displayResult1, dom.displayResult2, dom.displayResult3].forEach((el) => {
    el.textContent = "Filtrados: []";
    el.className = "array-display result-display mb-4";
  });

  updateUI();
};

// --- INIT ---
window.addEventListener("DOMContentLoaded", updateUI);
