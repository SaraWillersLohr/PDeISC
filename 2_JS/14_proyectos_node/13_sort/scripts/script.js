// proyecto 13_sort

// constantes
const INICIAL_NUMEROS = [40, 100, 1, 5, 25, 10];
const INICIAL_PALABRAS = ["Zapato", "Avión", "Mesa", "Lápiz", "Cuaderno"];
const INICIAL_OBJETOS = [
  { nombre: "Ana", edad: 25 },
  { nombre: "Leo", edad: 18 },
  { nombre: "Sonia", edad: 40 },
  { nombre: "Beto", edad: 32 },
];

// --- ESTADO ---
let numeros = [...INICIAL_NUMEROS];
let palabras = [...INICIAL_PALABRAS];
let objetos = [...INICIAL_OBJETOS];

// elementos del html
const dom = {
  // Ejercicio 1
  displayOriginal1: document.getElementById("displayOriginal1"),
  btnSortNums: document.getElementById("btnSortNums"),

  // Ejercicio 2
  displayOriginal2: document.getElementById("displayOriginal2"),
  btnSortWords: document.getElementById("btnSortWords"),

  // Ejercicio 3
  displayOriginal3: document.getElementById("displayOriginal3"),
  btnSortObj: document.getElementById("btnSortObj"),

  // Global
  btnReset: document.getElementById("btnReset"),
};

// funciones para dibujar en pantalla

const updateUI = () => {
  dom.displayOriginal1.textContent = `Array: [${numeros.join(", ")}]`;
  dom.displayOriginal2.textContent = `Array: ["${palabras.join('", "')}"]`;
  dom.displayOriginal3.textContent = `[${objetos.map((o) => "{" + o.nombre + ", " + o.edad + "}").join(", ")}]`;
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Ordena un array de números de menor a mayor
dom.btnSortNums.onclick = () => {
  // usamos el metodo  sort() - Ejercicio 1
  // Importante: sort() por defecto ordena como strings, requiere función de comparación para números
  numeros.sort((a, b) => a - b);

  dom.displayOriginal1.className =
    "array-display mb-4 animate__animated animate__pulse";
  updateUI();
};

// 2. Ordena un array de palabras alfabéticamente
dom.btnSortWords.onclick = () => {
  // usamos el metodo  sort() - Ejercicio 2
  palabras.sort();

  dom.displayOriginal2.className =
    "array-display mb-4 animate__animated animate__pulse";
  updateUI();
};

// 3. Dado un array de objetos {nombre, edad}, ordénalos por edad
dom.btnSortObj.onclick = () => {
  // usamos el metodo  sort() - Ejercicio 3
  objetos.sort((a, b) => a.edad - b.edad);

  dom.displayOriginal3.className =
    "array-display mb-4 animate__animated animate__pulse";
  updateUI();
};

// --- RESET ---

dom.btnReset.onclick = () => {
  numeros = [...INICIAL_NUMEROS];
  palabras = [...INICIAL_PALABRAS];
  objetos = [...INICIAL_OBJETOS];

  // Limpiar clases de animación
  [dom.displayOriginal1, dom.displayOriginal2, dom.displayOriginal3].forEach(
    (el) => {
      el.className = "array-display mb-4";
    },
  );

  updateUI();
};

// --- INIT ---
window.addEventListener("DOMContentLoaded", updateUI);
