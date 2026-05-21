// consola visual de eventos (historial en sessionStorage)
const CLAVE_LOG = "js02-consola-p1";

export class EventConsole {
  constructor(contenedorId) {
    this.contenedor = document.getElementById(contenedorId);
    this.cuerpo = this.contenedor?.querySelector(".console-body");
    this.logs = JSON.parse(sessionStorage.getItem(CLAVE_LOG) || "[]");
    this.render();
  }

  log(mensaje) {
    const hora = new Date().toLocaleTimeString("es-AR", { hour12: false });
    this.logs.push(`[${hora}] ${mensaje}`);
    if (this.logs.length > 80) this.logs.shift();
    sessionStorage.setItem(CLAVE_LOG, JSON.stringify(this.logs));
    this.render();
  }

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

  limpiar() {
    this.logs = [];
    sessionStorage.removeItem(CLAVE_LOG);
    this.render();
  }
}
