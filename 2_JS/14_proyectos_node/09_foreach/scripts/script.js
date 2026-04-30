/**
 * Proyecto: 09 - forEach() "Iteración Maestra"
 * Objetivo: Demostrar forEach() mediante 3 casos literales e independientes.
 */

// --- DATOS INICIALES ---
const INICIAL_NOMBRES = ["Ana", "Beto", "Carla"];
const INICIAL_NUMEROS = [5, 10, 15, 20];
const INICIAL_OBJETOS = [
  { nombre: "Lucas", edad: 25 },
  { nombre: "Sofía", edad: 30 },
  { nombre: "Marcos", edad: 22 },
];

// --- ESTADO ---
let nombres = [...INICIAL_NOMBRES];
let numeros = [...INICIAL_NUMEROS];
let objetos = [...INICIAL_OBJETOS];

// --- DOM ---
const dom = {
  // Ejercicio 1
  displayNombres: document.getElementById("displayNombres"),
  btnSaludar: document.getElementById("btnSaludar"),
  logSaludos: document.getElementById("logSaludos"),

  // Ejercicio 2
  displayNumeros: document.getElementById("displayNumeros"),
  btnDoblar: document.getElementById("btnDoblar"),
  logDobles: document.getElementById("logDobles"),

  // Ejercicio 3
  displayObjetos: document.getElementById("displayObjetos"),
  btnListar: document.getElementById("btnListar"),
  logObjetos: document.getElementById("logObjetos"),

  // Global
  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const renderArray = (arr, elementId) => {
  const container = dom[elementId];
  if (typeof arr[0] === "object") {
    container.innerHTML = arr
      .map(
        (item) => `
            <span class="array-item animate__animated animate__fadeIn">
                {${item.nombre}, ${item.edad}}
            </span>
        `,
      )
      .join("");
  } else {
    container.innerHTML = arr
      .map(
        (item) => `
            <span class="array-item animate__animated animate__fadeIn">
                ${item}
            </span>
        `,
      )
      .join("");
  }
};

const updateUI = () => {
  renderArray(nombres, "displayNombres");
  renderArray(numeros, "displayNumeros");
  renderArray(objetos, "displayObjetos");
};

const addLog = (containerId, text) => {
  const container = dom[containerId];
  const entry = document.createElement("div");
  entry.className = "log-entry animate__animated animate__fadeInLeft";
  entry.textContent = text;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Muestra todos los nombres de un array con un saludo
dom.btnSaludar.onclick = () => {
  dom.logSaludos.innerHTML = "";
  // MÉTODO ARRAY: forEach() - Ejercicio 1
  nombres.forEach((nombre) => {
    addLog("logSaludos", `¡Hola, ${nombre}! Bienvenido/a.`);
  });
};

// 2. Imprime el doble de cada número de un array con forEach()
dom.btnDoblar.onclick = () => {
  dom.logDobles.innerHTML = "";
  // MÉTODO ARRAY: forEach() - Ejercicio 2
  numeros.forEach((num) => {
    addLog("logDobles", `El doble de ${num} es ${num * 2}`);
  });
};

// 3. Dado un array de objetos {nombre, edad}, muestra cada nombre con su edad
dom.btnListar.onclick = () => {
  dom.logObjetos.innerHTML = "";
  // MÉTODO ARRAY: forEach() - Ejercicio 3
  objetos.forEach((persona) => {
    addLog(
      "logObjetos",
      `Usuario: ${persona.nombre} | Edad: ${persona.edad} años`,
    );
  });
};

// --- RESET ---

dom.btnReset.onclick = () => {
  nombres = [...INICIAL_NOMBRES];
  numeros = [...INICIAL_NUMEROS];
  objetos = [...INICIAL_OBJETOS];

  // Limpiar logs
  [dom.logSaludos, dom.logDobles, dom.logObjetos].forEach(
    (el) => (el.innerHTML = ""),
  );

  updateUI();
};

// --- INIT ---
window.addEventListener("DOMContentLoaded", updateUI);
