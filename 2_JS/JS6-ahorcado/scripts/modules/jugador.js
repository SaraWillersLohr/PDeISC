// maneja los datos del jugador, como su nombre, puntos y tiempo.
// cuando termina la partida, esos datos se pueden guardar en la base de datos.
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
