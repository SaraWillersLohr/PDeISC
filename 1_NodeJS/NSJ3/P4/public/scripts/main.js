//Este archivo maneja la creación y cambio de enlaces
//  en tiempo real. ¡Todo sin recargar la página!

import { nodeManager } from "../modules/nodes.js";
import { Notificador } from "../modules/notifications.js";
// Espera a que el DOM esté listo para ejecutar el código
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("link-container");
  const monitor = document.getElementById("event-log");
  const btnModificar = document.getElementById("btn-modify-all");
  const btnEstilo = document.getElementById("btn-change-style");

  // Función para escribir en la "pantalla verde" (monitor)
  const escribirEnMonitor = (mensaje) => {
    // Si es el primer mensaje, limpiamos el texto de espera
    if (monitor.innerHTML.includes("Esperando")) monitor.innerHTML = "";

    const linea = document.createElement("div");
    linea.className = "log-entry";
    const ahora = new Date().toLocaleTimeString();
    linea.innerHTML = `[${ahora}] ${mensaje}`;

    // Lo ponemos arriba de todo
    monitor.prepend(linea);
  };

  // Datos de los sitios que vamos a crear
  const sitios = [
    { nombre: "Google", url: "https://google.com" },
    { nombre: "GitHub", url: "https://github.com" },
    { nombre: "MDN Web", url: "https://developer.mozilla.org" },
    { nombre: "Wikipedia", url: "https://wikipedia.org" },
    { nombre: "StackOverflow", url: "https://stackoverflow.com" },
  ];

  // Preparamos los botones para crear cada link
  sitios.forEach((sitio, indice) => {
    const btn = document.getElementById(`btn-create-${indice + 1}`);
    btn.addEventListener("click", () => {
      // Creamos el enlace usando nuestro módulo
      const enlace = nodeManager.createAnchor(sitio.nombre, sitio.url);
      contenedor.appendChild(enlace);

      escribirEnMonitor(
        `Creado: <strong>${sitio.nombre}</strong> &rarr; ${sitio.url}`,
      );
      Notificador.exito(`¡Link a ${sitio.nombre} creado!`);

      // Si ya hay links, dejamos usar los botones de modificación
      if (contenedor.children.length > 0) {
        btnModificar.disabled = false;
        btnEstilo.disabled = false;
      }
    });
  });

  // Botón para cambiar todos los destinos a YouTube
  btnModificar.addEventListener("click", () => {
    const enlaces = contenedor.querySelectorAll("a");
    const nuevaUrl = "https://youtube.com";

    enlaces.forEach((a) => {
      const { oldValue } = nodeManager.modifyAttribute(a, "href", nuevaUrl);
      escribirEnMonitor(
        `Cambiamos destino de "${a.textContent}": era <u>${oldValue}</u> y ahora es <u>${nuevaUrl}</u>`,
      );
    });

    Notificador.mostrar("¡Todos los links ahora van a YouTube!");
  });

  // Botón para cambiar cómo se abren los links (misma ventana o nueva)
  btnEstilo.addEventListener("click", () => {
    const enlaces = contenedor.querySelectorAll("a");
    enlaces.forEach((a) => {
      const nuevoTarget = a.target === "_blank" ? "_self" : "_blank";
      nodeManager.modifyAttribute(a, "target", nuevoTarget);

      const modo = nuevoTarget === "_blank" ? "ventana nueva" : "misma ventana";
      escribirEnMonitor(`"${a.textContent}" ahora se abre en: <b>${modo}</b>`);

      // Le ponemos un borde rojo para que se note el cambio
      a.style.borderColor = "red";
    });

    Notificador.mostrar("Cambiamos el modo de apertura de los links");
  });
});
