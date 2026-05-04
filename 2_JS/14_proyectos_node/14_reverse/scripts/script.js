// proyecto 14_reverse

// constantes
const INICIAL_LETRAS = ["A", "B", "C", "D", "E"];
const INICIAL_NUMEROS = [1, 2, 3, 4, 5, 6];

// las variables
let letras = [...INICIAL_LETRAS];
let numeros = [...INICIAL_NUMEROS];

// elementos del html
const dom = {
  // Ejercicio 1
  displayOriginal1: document.getElementById("displayOriginal1"),
  btnRevLetters: document.getElementById("btnRevLetters"),

  // Ejercicio 2
  displayOriginal2: document.getElementById("displayOriginal2"),
  btnRevNums: document.getElementById("btnRevNums"),

  // Ejercicio 3
  inputString: document.getElementById("inputString"),
  displayResult3: document.getElementById("displayResult3"),
  btnRevString: document.getElementById("btnRevString"),

  // Global
  btnReset: document.getElementById("btnReset"),
};

// funciones para dibujar en pantalla

const updateUI = () => {
  dom.displayOriginal1.textContent = `[${letras.map((l) => '"' + l + '"').join(", ")}]`;
  dom.displayOriginal2.textContent = `[${numeros.join(", ")}]`;
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Invierte un array de letras
dom.btnRevLetters.onclick = () => {
  // usamos el metodo  reverse() - Ejercicio 1
  letras.reverse();

  dom.displayOriginal1.className =
    "array-display mb-4 animate__animated animate__flipInX";
  updateUI();
};

// 2. Invierte el orden de un array de números
dom.btnRevNums.onclick = () => {
  // usamos el metodo  reverse() - Ejercicio 2
  numeros.reverse();

  dom.displayOriginal2.className =
    "array-display mb-4 animate__animated animate__flipInY";
  updateUI();
};

// 3. Dado un string, conviertelo en array y revierte el texto
dom.btnRevString.onclick = () => {
  const originalText = dom.inputString.value;

  // usamos el metodo  reverse() - Ejercicio 3
  // Lógica: String -> Array -> Reverse -> String
  const reversedText = originalText.split("").reverse().join("");

  dom.displayResult3.className =
    "array-display mb-4 animate__animated animate__bounceIn";
  dom.displayResult3.textContent = reversedText;
};

// resetear

dom.btnReset.onclick = () => {
  letras = [...INICIAL_LETRAS];
  numeros = [...INICIAL_NUMEROS];
  dom.inputString.value = "Hola Mundo";
  dom.displayResult3.textContent = "odnuM aloH";

  // Limpiar animaciones
  [dom.displayOriginal1, dom.displayOriginal2, dom.displayResult3].forEach(
    (el) => {
      el.className = "array-display mb-4";
    },
  );

  updateUI();
};

// inicio
window.addEventListener("DOMContentLoaded", () => {
  updateUI();
  // Revertir el string inicial para mostrar el ejemplo
  dom.btnRevString.click();
});

