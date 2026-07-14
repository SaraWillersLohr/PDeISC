// crea la clase score para guardar los datos de una partida en el ranking.
// guarda el nombre del jugador, el tiempo, los puntos y la especialidad.
export default class Score {
  constructor(nombre, tiempo, puntos, especialidad) {
    this.nombre = nombre;

    this.tiempo = tiempo;

    this.puntos = puntos;

    this.especialidad = especialidad;
  }
}
