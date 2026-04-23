/* 
  Este archivo maneja lo que pasa cuando el usuario hace clic 
  o interactúa con los elementos de la página.
*/
import { uiLogger } from "../modules/logger.js";

document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display-container");
  const emptyMsg = document.getElementById("empty-msg");
  const logId = "log-container";

  // Aquí guardamos los elementos que vamos creando
  let currentH1 = null;
  let currentImg = null;

  // --- Controles para el Título (H1) ---
  const btnAddH1 = document.getElementById("btn-add-h1");
  const btnChangeText = document.getElementById("btn-change-text");
  const btnChangeColor = document.getElementById("btn-change-color");

  btnAddH1.addEventListener("click", () => {
    if (!currentH1) {
      // Quitamos el mensaje de "vacío"
      if (emptyMsg) emptyMsg.style.display = "none";
      
      // Creamos el H1 desde cero
      currentH1 = document.createElement("h1");
      currentH1.textContent = "Hola DOM";
      currentH1.style.transition = "all 0.3s ease";
      display.appendChild(currentH1);
      
      // Bloqueamos el botón de crear y activamos los otros
      btnAddH1.disabled = true;
      btnChangeText.disabled = false;
      btnChangeColor.disabled = false;
      
      uiLogger.log("Pusimos el título 'Hola DOM'", logId);
    }
  });

  btnChangeText.addEventListener("click", () => {
    if (currentH1) {
      // Cambiamos entre hola y chau
      const isHello = currentH1.textContent === "Hola DOM";
      currentH1.textContent = isHello ? "Chau DOM" : "Hola DOM";
      uiLogger.log(`Cambiamos el texto a: ${currentH1.textContent}`, logId);
    }
  });

  btnChangeColor.addEventListener("click", () => {
    if (currentH1) {
      // Color al azar
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      currentH1.style.color = randomColor;
      uiLogger.log(`Pusimos un color nuevo: ${randomColor}`, logId);
    }
  });

  // --- Controles para la Imagen ---
  const btnAddImg = document.getElementById("btn-add-img");
  const btnChangeImg = document.getElementById("btn-change-img");
  const btnResizeImg = document.getElementById("btn-resize-img");

  const images = [
    'https://picsum.photos/id/1/200/200',
    'https://picsum.photos/id/10/200/200',
    'https://picsum.photos/id/20/200/200'
  ];
  let imgIdx = 0;

  btnAddImg.addEventListener("click", () => {
    if (!currentImg) {
      if (emptyMsg) emptyMsg.style.display = "none";
      
      // Creamos la etiqueta img
      currentImg = document.createElement("img");
      currentImg.src = images[imgIdx];
      currentImg.alt = "Imagen de prueba";
      currentImg.style.borderRadius = "12px";
      currentImg.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
      currentImg.style.transition = "all 0.3s ease";
      display.appendChild(currentImg);
      
      btnAddImg.disabled = true;
      btnChangeImg.disabled = false;
      btnResizeImg.disabled = false;
      
      uiLogger.log("Agregamos una imagen linda", logId);
    }
  });

  btnChangeImg.addEventListener("click", () => {
    if (currentImg) {
      // Vamos rotando las fotos
      imgIdx = (imgIdx + 1) % images.length;
      currentImg.src = images[imgIdx];
      uiLogger.log("Cambiamos la foto por otra", logId);
    }
  });

  btnResizeImg.addEventListener("click", () => {
    if (currentImg) {
      // Cambiamos entre chico y grande
      const currentWidth = parseInt(currentImg.style.width) || 200;
      const newWidth = currentWidth === 200 ? 300 : 200;
      currentImg.style.width = `${newWidth}px`;
      uiLogger.log(`La imagen ahora mide ${newWidth}px`, logId);
    }
  });
});
