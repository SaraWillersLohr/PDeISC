// Eventos P1 — consigna 1: H1 e imagen con DOM real
import { agregarLog } from "./consola.js";
import { mostrarAviso } from "./ui.js";

const estado = { h1: null, img: null, colorIndex: 0, imgIndex: 0, sizeIndex: 0 };
const COLORES = ["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
const IMAGENES = [
  "https://picsum.photos/seed/p1a/320/200",
  "https://picsum.photos/seed/p1b/320/200",
  "https://picsum.photos/seed/p1c/320/200"
];
const TAMANOS = ["200px", "280px", "360px"];

export function bindEventos() {
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => ejecutar(btn.dataset.action));
  });
}

function ejecutar(accion) {
  const zona = document.getElementById("playground-dhtml");
  if (!zona) return;

  if (accion === "add-h1") {
    if (estado.h1) { mostrarAviso("Ya existe un H1.", "info"); return; }
    estado.h1 = document.createElement("h1");
    estado.h1.className = "dom-h1 animate-pop";
    estado.h1.textContent = "Hola DOM";
    zona.appendChild(estado.h1);
    agregarLog("DHTML", "Se agregó el H1 «Hola DOM»");
  }

  if (accion === "change-h1-text") {
    if (!estado.h1) { mostrarAviso("Primero agregá el H1.", "warning"); return; }
    estado.h1.textContent = "Chau DOM";
    agregarLog("DHTML", "Se cambió el texto del H1 a «Chau DOM»");
  }

  if (accion === "change-h1-color") {
    if (!estado.h1) { mostrarAviso("Primero agregá el H1.", "warning"); return; }
    estado.colorIndex = (estado.colorIndex + 1) % COLORES.length;
    estado.h1.style.color = COLORES[estado.colorIndex];
    agregarLog("DHTML", `Se cambió el color del H1 a ${COLORES[estado.colorIndex]}`);
  }

  if (accion === "add-img") {
    if (estado.img) { mostrarAviso("Ya hay una imagen.", "info"); return; }
    estado.img = document.createElement("img");
    estado.img.className = "dom-img animate-pop";
    estado.img.src = IMAGENES[0];
    estado.img.alt = "Imagen DHTML";
    estado.img.style.maxWidth = TAMANOS[0];
    zona.appendChild(estado.img);
    agregarLog("DHTML", "Se agregó una imagen");
  }

  if (accion === "change-img") {
    if (!estado.img) { mostrarAviso("Primero agregá la imagen.", "warning"); return; }
    estado.imgIndex = (estado.imgIndex + 1) % IMAGENES.length;
    estado.img.src = IMAGENES[estado.imgIndex];
    agregarLog("DHTML", "Imagen actualizada (nuevo src)");
  }

  if (accion === "resize-img") {
    if (!estado.img) { mostrarAviso("Primero agregá la imagen.", "warning"); return; }
    estado.sizeIndex = (estado.sizeIndex + 1) % TAMANOS.length;
    estado.img.style.maxWidth = TAMANOS[estado.sizeIndex];
    agregarLog("DHTML", `Tamaño de imagen: ${TAMANOS[estado.sizeIndex]}`);
  }
}
