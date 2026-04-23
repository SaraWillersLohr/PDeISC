const API_KEY =
  "ea4ce909ad82d0126f571fa852ae1a41a2c1eff83fd7d98d45799187ffe0ce8c";

export const validator = {
  isNotEmpty(value) {
    return value.trim().length > 0;
  },

  async isRealName(value) {
    const trimmed = value.trim();
    const nameParts = trimmed.split(/\s+/);
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const vowelRegex = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/;
    const repeatedCharRegex = /(.)\1\1/;

    // 1. Validaciones básicas locales (FILTRO ESTRICTO)
    if (nameParts.length < 2)
      return {
        valid: false,
        message: "Ingresa al menos un nombre y un apellido.",
      };
    if (!nameRegex.test(trimmed))
      return { valid: false, message: "El nombre solo debe contener letras." };
    if (repeatedCharRegex.test(trimmed))
      return { valid: false, message: "Demasiadas letras repetidas." };

    for (const part of nameParts) {
      // Un nombre real razonable debe tener al menos 2 letras (ej: "Jo")
      // pero para evitar "sd" o "ds", pediremos que tenga al menos una vocal
      if (part.length < 2)
        return {
          valid: false,
          message: "Cada parte del nombre debe ser más larga.",
        };
      if (!vowelRegex.test(part))
        return {
          valid: false,
          message:
            "Ingresa un nombre y apellido que parezca real (debe contener vocales).",
        };
    }

    const firstName = nameParts[0];

    // 2. Validación con API Externa (Gender-API)
    try {
      const response = await fetch(
        `https://gender-api.com/get?name=${firstName}&key=${API_KEY}`,
      );
      if (!response.ok) throw new Error("Error en API");

      const data = await response.json();

      // Si la API no reconoce el nombre
      if (data.gender === "unknown" || (data.accuracy && data.accuracy < 60)) {
        return {
          valid: false,
          message: "Ese nombre no parece ser un nombre real registrado.",
        };
      }

      return { valid: true };
    } catch (error) {
      console.warn("API Error, continuando con validación local:", error);
      // Si la API falla pero pasó los filtros locales estrictos, lo dejamos pasar
      return { valid: true };
    }
  },
};
