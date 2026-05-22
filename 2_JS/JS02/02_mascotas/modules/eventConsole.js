const CLAVE_LOG = "js02-consola-p2";
// clase para la consola visual de eventos
export class EventConsole {
  constructor(contenedorId) {
    this.cuerpo = document.getElementById(contenedorId)?.querySelector(".console-body");
    this.logs = JSON.parse(sessionStorage.getItem(CLAVE_LOG) || "[]");
    this.render();
  }

  // método para agregar un mensaje a la consola
  log(mensaje) {
    const hora = new Date().toLocaleTimeString("es-AR", { hour12: false });
    this.logs.push(`[${hora}] ${mensaje}`);
    if (this.logs.length > 100) this.logs.shift();
    sessionStorage.setItem(CLAVE_LOG, JSON.stringify(this.logs));
    this.render();
  }

  // método para renderizar la consola
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

  // método para limpiar la consola
  limpiar() {
    this.logs = [];
    sessionStorage.removeItem(CLAVE_LOG);
    this.render();
  }
}
