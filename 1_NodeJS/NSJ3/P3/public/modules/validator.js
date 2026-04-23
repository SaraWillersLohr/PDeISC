/* 
  Este módulo se encarga de revisar que los datos 
  que pone el usuario tengan sentido.
*/
const API_KEY =
  "ea4ce909ad82d0126f571fa852ae1a41a2c1eff83fd7d98d45799187ffe0ce8c";

export const validator = {
  isNotEmpty(value) {
    return value.trim().length > 0;
  },

  /**
   * Revisamos si el nombre parece real.
   * Usamos reglas propias y también una API externa.
   */
  async isRealName(value) {
    const limpio = value.trim();
    const partes = limpio.split(/\s+/);
    const letrasSolo = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const vocales = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/;
    const repetidas = /(.)\1\1/; // Detecta 3 letras iguales seguidas (ej: "aaa")

    // --- Validaciones Rápidas Locales ---
    if (partes.length < 2)
      return { valid: false, message: "Poné tu nombre y apellido, por favor." };

    if (!letrasSolo.test(limpio))
      return { valid: false, message: "Usá solo letras, por favor." };

    if (repetidas.test(limpio))
      return { valid: false, message: "Hay demasiadas letras repetidas." };

    // Revisamos cada palabra
    for (const palabra of partes) {
      if (palabra.length < 2)
        return {
          valid: false,
          message: "Cada palabra debe tener al menos 2 letras.",
        };

      if (!vocales.test(palabra))
        return {
          valid: false,
          message: "Eso no parece un nombre (falta alguna vocal).",
        };
    }

    const primerNombre = partes[0];

    // --- Consulta a la API Externa ---
    try {
      // Le preguntamos a la API de género si conoce este nombre
      const respuesta = await fetch(
        `https://gender-api.com/get?name=${primerNombre}&key=${API_KEY}`,
      );
      if (!respuesta.ok) throw new Error("API caída");

      const datos = await respuesta.json();

      // Si la API no tiene idea de qué nombre es ese
      if (
        datos.gender === "unknown" ||
        (datos.accuracy && datos.accuracy < 60)
      ) {
        return {
          valid: false,
          message: "Mmm, ese nombre no me suena. ¿Está bien escrito?",
        };
      }

      return { valid: true };
    } catch (error) {
      console.warn(
        "Hubo un problema con la API, pero confío en tus datos locales.",
        error,
      );
      // Si la API falla, dejamos pasar al usuario para no trabarlo
      return { valid: true };
    }
  },
};
