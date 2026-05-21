// TP 09 — forEach(): recorro sin crear array nuevo

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

const log = boot("forEach");

const INICIAL_NOMBRES = ["Ana", "Beto", "Carla"];
const INICIAL_NUMEROS = [5, 10, 15, 20];
const INICIAL_OBJETOS = [
  { nombre: "Lucas", edad: 25 },
  { nombre: "Sofía", edad: 30 },
  { nombre: "Marcos", edad: 22 },
];

let nombres = [...INICIAL_NOMBRES];
let numeros = [...INICIAL_NUMEROS];
let objetos = [...INICIAL_OBJETOS];

const dom = {
  displayNombres: document.getElementById("displayNombres"),
  btnSaludar: document.getElementById("btnSaludar"),
  logSaludos: document.getElementById("logSaludos"),
  displayNumeros: document.getElementById("displayNumeros"),
  btnDoblar: document.getElementById("btnDoblar"),
  logDobles: document.getElementById("logDobles"),
  displayObjetos: document.getElementById("displayObjetos"),
  btnListar: document.getElementById("btnListar"),
  logObjetos: document.getElementById("logObjetos"),
  btnReset: document.getElementById("btnReset"),
};

const addLog = (container, text) => {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = text;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
};

const updateUI = () => {
  paintFlow(dom.displayNombres, {
    before: nombres,
    operation: "nombres.forEach(n => saludo)",
    after: nombres,
    note: "forEach no devuelve array nuevo.",
  });
  paintFlow(dom.displayNumeros, {
    before: numeros,
    operation: "numeros.forEach(n => doble)",
    after: numeros,
  });
  paintFlow(dom.displayObjetos, {
    before: objetos,
    operation: "objetos.forEach(p => listar)",
    after: objetos,
  });
};

dom.btnSaludar.onclick = () => {
  dom.logSaludos.innerHTML = "";
  nombres.forEach((nombre) => {
    const linea = `¡Hola, ${nombre}!`;
    addLog(dom.logSaludos, linea);
    log(`forEach → ${linea}`, "info");
  });
  dom.btnSaludar.disabled = true;
};

dom.btnDoblar.onclick = () => {
  dom.logDobles.innerHTML = "";
  numeros.forEach((num) => {
    const linea = `El doble de ${num} es ${num * 2}`;
    addLog(dom.logDobles, linea);
    log(`forEach → doble de ${num}`, "info");
  });
  dom.btnDoblar.disabled = true;
};

dom.btnListar.onclick = () => {
  dom.logObjetos.innerHTML = "";
  objetos.forEach((persona) => {
    const linea = `${persona.nombre}, ${persona.edad} años`;
    addLog(dom.logObjetos, linea);
    log(`forEach → ${linea}`, "info");
  });
  dom.btnListar.disabled = true;
};

dom.btnReset.onclick = () => {
  nombres = [...INICIAL_NOMBRES];
  numeros = [...INICIAL_NUMEROS];
  objetos = [...INICIAL_OBJETOS];
  dom.btnSaludar.disabled = false;
  dom.btnDoblar.disabled = false;
  dom.btnListar.disabled = false;
  [dom.logSaludos, dom.logDobles, dom.logObjetos].forEach((el) => (el.innerHTML = ""));
  log("Reinicié forEach()", "system");
  updateUI();
};

window.addEventListener("DOMContentLoaded", updateUI);
