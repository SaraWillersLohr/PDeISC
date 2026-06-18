// ¡Hola! Bienvenidos a mi primer TP sobre el método push().
// Aquí voy a mostrar cómo este método nos permite agregar elementos al final de un array, modificándolo directamente.

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

// Inicializo mi consola personalizada para ir viendo qué pasa.
const log = boot("push");

// Preparo unos "pools" de datos para usar más adelante.
const FRUTAS_POOL = ["🍎 Manzana", "🍌 Banana", "🍇 Uva"];
const AMIGOS_POOL = ["Alex", "Marcos", "Lucía"];

// Estos son mis arrays iniciales con los que voy a jugar.
let frutas = [];
let amigos = ["Juan"];
let numeros = [10];

// Agrupo mis referencias al DOM para tener todo ordenado y a mano.
const dom = {
  listaFrutas: document.getElementById("listaFrutas"),
  btnFrutas: document.getElementById("btnFrutas"),
  contFrutas: document.getElementById("contFrutas"),

  listaAmigos: document.getElementById("listaAmigos"),
  btnAmigos: document.getElementById("btnAmigos"),
  contAmigos: document.getElementById("contAmigos"),

  listaNums: document.getElementById("listaNums"),
  inputNum: document.getElementById("inputNum"),
  btnNum: document.getElementById("btnNum"),
  resNum: document.getElementById("resNum"),
  contNums: document.getElementById("contNums"),

  btnReset: document.getElementById("btnReset"),
};

// Esta función me ayuda a mostrar visualmente qué pasa con las frutas cuando uso push().
const pintarFrutas = (antes, operacion) => {
  paintFlow(dom.listaFrutas, {
    before: antes,
    operation: operacion,
    after: [...frutas],
    note: "push() modifica el mismo array (mutación).",
  });
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dom.contFrutas) dom.contFrutas.textContent = `${frutas.length} ITEMS`;
};

// Lo mismo para mis amigos, para ver cómo crece la lista.
const pintarAmigos = (antes, operacion) => {
  paintFlow(dom.listaAmigos, {
    before: antes,
    operation: operacion,
    after: [...amigos],
    note: "Parto de un array con un amigo y hago push de tres más.",
  });
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dom.contAmigos) dom.contAmigos.textContent = `${amigos.length} ITEMS`;
};

// Y aquí manejo la visualización de mis números.
const pintarNums = (antes, operacion) => {
  paintFlow(dom.listaNums, {
    before: antes,
    operation: operacion,
    after: [...numeros],
    note: "Solo hago push si el número es mayor al último.",
  });
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dom.contNums)
    dom.contNums.textContent = `${numeros.length} ITEM${numeros.length === 1 ? "" : "S"}`;
};

// Con esta función mantengo mi interfaz actualizada y controlo los botones.
const updateUI = () => {
  pintarFrutas(
    [...frutas],
    frutas.length
      ? "estado actual"
      : 'push("🍎 Manzana", "🍌 Banana", "🍇 Uva")',
  );
  pintarAmigos([...amigos], "estado actual");
  pintarNums([...numeros], "estado actual");

  dom.btnFrutas.disabled = frutas.length >= 3;
  dom.btnAmigos.disabled = amigos.length >= 4;
};

// Caso 1: Mi array de frutas empieza vacío y le agrego tres de un tirón.
dom.btnFrutas.onclick = () => {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (frutas.length > 0) return;
  const antes = [];
  frutas.push(...FRUTAS_POOL);
  log(`push() agregó ${FRUTAS_POOL.length} frutas al final`, "success");
  pintarFrutas(antes, `push(${FRUTAS_POOL.map((f) => `"${f}"`).join(", ")})`);
  updateUI();
};

// Caso 2: Aquí ya tengo un amigo y le sumo otros tres amigos nuevos.
dom.btnAmigos.onclick = () => {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (amigos.length !== 1) return;
  const antes = [...amigos];
  amigos.push(...AMIGOS_POOL);
  log(`push() agregó "${AMIGOS_POOL.join('", "')}"`, "success");
  pintarAmigos(antes, `push("${AMIGOS_POOL.join('", "')}")`);
  updateUI();
};

// Caso 3: Solo voy a permitir agregar un número si es más grande que el último que puse.
dom.btnNum.onclick = () => {
  const val = parseInt(dom.inputNum.value, 10);
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (Number.isNaN(val)) return;

  const antes = [...numeros];
  const ultimo = numeros[numeros.length - 1];

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (val > ultimo) {
    numeros.push(val);
    log(`push(${val}) exitoso`, "success");
    pintarNums(antes, `push(${val})`);
    dom.inputNum.value = "";
    dom.resNum.textContent = "";
  } else {
    log(`No puedo hacer push(${val}) porque no es mayor a ${ultimo}`, "error");
    dom.resNum.textContent = `❌ ${val} no es > ${ultimo}`;
  }
  updateUI();
};

// Por último, mi botón de reset para volver a empezar desde cero.
dom.btnReset.onclick = () => {
  frutas = [];
  amigos = ["Juan"];
  numeros = [10];
  log("Todo reseteado. ¡A probar de nuevo!", "warning");
  updateUI();
};

// Inicio la interfaz para que se vea bien desde el primer momento.
updateUI();