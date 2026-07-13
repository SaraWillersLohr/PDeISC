export default class Jugador {
  constructor() {
    this.nombre = "";
    this.puntos = 0;
    this.tiempo = 0;
  }

  sumarPuntos(cantidad) {
    this.puntos += cantidad;
  }
}
