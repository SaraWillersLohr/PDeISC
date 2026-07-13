function normalizarCaracter(char) {
  return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default class JuegoAhorcado {
  constructor() {
    this.palabra = "";
    this.pista = "";
    this.letrasUsadas = []; // Almacena las letras en formato normalizado y en mayúscula
    this.errores = 0;
    this.maxErrores = 6;
  }

  iniciar(palabra, pista) {
    this.palabra = palabra.toUpperCase();
    this.pista = pista;
    this.letrasUsadas = [];
    this.errores = 0;
  }

  intentarLetra(letra) {
    letra = letra.toUpperCase();
    const letraNormalizada = normalizarCaracter(letra);

    if (this.letrasUsadas.includes(letraNormalizada)) {
      return false; // Ya fue usada
    }

    this.letrasUsadas.push(letraNormalizada);

    const palabraNormalizada = normalizarCaracter(this.palabra);
    if (!palabraNormalizada.includes(letraNormalizada)) {
      this.errores++;
      return false; // Error
    }

    return true; // Acierto
  }

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

  gano() {
    return !this.palabraOculta().includes("_");
  }

  perdio() {
    return this.errores >= this.maxErrores;
  }
}
