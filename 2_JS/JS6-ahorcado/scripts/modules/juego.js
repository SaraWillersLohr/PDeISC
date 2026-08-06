// maneja la lógica del juego: iniciar la partida, probar letras y verificar si el jugador ganó o perdió.
// normaliza los caracteres para quitar acentos y diacríticos.
function normalizarCaracter(char) {
  return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
//logica basica del juego
// representa el juego del ahorcado.
export default class JuegoAhorcado {
  constructor() {
    this.palabra = "";
    this.pista = "";
    this.letrasUsadas = []; // Almacena las letras en formato normalizado y en mayúscula
    this.errores = 0;
    this.maxErrores = 6;
  }

  // inicia el juego con una palabra y una pista.
  iniciar(palabra, pista) {
    this.palabra = palabra.toUpperCase();
    this.pista = pista;
    this.letrasUsadas = [];
    this.errores = 0;
  }
  // intenta adivinar una letra. devuelve true si es correcta y false si es incorrecta o ya fue usada.
  intentarLetra(letra) {
    letra = letra.toUpperCase();
    const letraNormalizada = normalizarCaracter(letra);

    if (this.letrasUsadas.includes(letraNormalizada)) {
      return false; // Ya fue usada
    }

    this.letrasUsadas.push(letraNormalizada);
    // Verificar si la letra está en la palabra (normalizada)
    const palabraNormalizada = normalizarCaracter(this.palabra);
    if (!palabraNormalizada.includes(letraNormalizada)) {
      this.errores++;
      return false; // Error
    }

    return true; // Acierto
  }
  // devuelve la palabra oculta con guiones bajos para las letras no adivinadas y espacios para las letras ya descubiertas.
  palabraOculta() {
    return this.palabra
      .split("")
      .map((letra) => {
        // Permitimos espacios u otros caracteres que no sean letras como revelados por defecto
        if (!/[A-ZÑÁÉÍÓÚÜ]/.test(letra)) {
          return letra;
        }
        const letraNormalizada = normalizarCaracter(letra);
        return this.letrasUsadas.includes(letraNormalizada) ? letra : "_";
      })
      .join(" ");
  }
  // verifica si el jugador ganó cuando ya no quedan letras ocultas.
  gano() {
    return !this.palabraOculta().includes("_");
  }
  // verifica si el jugador perdió cuando alcanza el máximo de errores.
  perdio() {
    return this.errores >= this.maxErrores;
  }
}
