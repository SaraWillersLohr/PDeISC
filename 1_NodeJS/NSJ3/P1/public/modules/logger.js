/* 
  Este módulo sirve para escribir mensajes en la pantalla 
  y que el usuario sepa qué está pasando en tiempo real.
*/
export const uiLogger = {
  log(mensaje, containerId) {
    const contenedor = document.getElementById(containerId);
    if (!contenedor) return;

    // Si es el primer mensaje, limpiamos el texto de espera
    const mensajeInicial = contenedor.querySelector(".event-item");
    if (mensajeInicial && mensajeInicial.textContent.includes("Esperando")) {
      contenedor.innerHTML = "";
    }

    // Creamos un nuevo renglón para el historial
    const item = document.createElement("div");
    item.className = "event-item";

    // Le ponemos la hora actual para que se vea prolijo
    const ahora = new Date().toLocaleTimeString();
    item.textContent = `[${ahora}] ${mensaje}`;

    // Lo ponemos al principio de la lista
    contenedor.prepend(item);
  },
};
