// Yo creo una consola visual de eventos que guarda el historial en sessionStorage
// Esto me permite ver qué va pasando en la aplicación mientras el usuario interactúa
const CLAVE_LOG = "js02-consola-p2";

export class EventConsole {
  // Cuando creo una nueva instancia, busco el contenedor en el DOM y recupero los logs guardados
  constructor(contenedorId) {
    this.cuerpo = document
      .getElementById(contenedorId)
      ?.querySelector(".console-body");
    this.logs = JSON.parse(sessionStorage.getItem(CLAVE_LOG) || "[]");
    this.render();
  }

  // Yo agrego un nuevo mensaje al log con la hora actual
  // Si hay más de 100 logs, elimino el más antiguo para no saturar la memoria
  log(mensaje) {
    const hora = new Date().toLocaleTimeString("es-AR", { hour12: false });
    this.logs.push(`[${hora}] ${mensaje}`);
    if (this.logs.length > 100) this.logs.shift();
    sessionStorage.setItem(CLAVE_LOG, JSON.stringify(this.logs));
    this.render();
  }

  // Yo renderizo todos los logs en el contenedor visual
  // Cada log se muestra en una línea separada y scrolleo hasta el final
  render() {
    if (!this.cuerpo) return;
    this.cuerpo.innerHTML = "";
    this.logs.forEach((linea) => {
      const fila = document.createElement("div");
      fila.className = "console-line";
      fila.textContent = linea;
      this.cuerpo.appendChild(fila);
    });
    this.cuerpo.scrollTop = this.cuerpo.scrollHeight;
  }

  // Yo limpio todos los logs y elimino el historial de sessionStorage
  limpiar() {
    this.logs = [];
    sessionStorage.removeItem(CLAVE_LOG);
    this.render();
  }
}
