/**
 * Validaciones para el Registro de Personas
 * Lógica profesional y robusta
 */

const BLACKLIST = ["asdf", "qwerty", "jajaja", "xddd", "aaaa", "trash", "test"];
const SOUTH_AMERICA = [
  "argentina",
  "brasil",
  "brazil",
  "chile",
  "uruguay",
  "paraguay",
  "bolivia",
  "peru",
  "colombia",
  "venezuela",
  "ecuador",
  "suriname",
  "guyana",
];

/**
 * Valida nombres reales
 */
export const validateRealName = (text) => {
  const val = text.trim();
  if (val.length < 3) return { valid: false, msg: "Mínimo 3 letras" };
  if (val.length > 35) return { valid: false, msg: "Muy largo" };
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s]+$/.test(val))
    return { valid: false, msg: "Solo letras" };
  if (/(.)\1\1/.test(val)) return { valid: false, msg: "Repetición detectada" };

  const lowerVal = val.toLowerCase();
  if (BLACKLIST.some((b) => lowerVal.includes(b)))
    return { valid: false, msg: "Nombre no válido" };

  const distinctChars = new Set(lowerVal.replace(/\s/g, "").split("")).size;
  if (val.length >= 8 && distinctChars < 4)
    return { valid: false, msg: "Escriba un nombre real" };

  return { valid: true, msg: "Nombre aceptado" };
};

/**
 * Valida Nacionalidad Sudamericana
 */
export const validateNationality = (country) => {
  const val = country.trim().toLowerCase();
  if (SOUTH_AMERICA.includes(val)) {
    return { valid: true, msg: "País válido" };
  }
  return { valid: false, msg: "Debe ser de Sudamérica" };
};

/**
 * Valida edad y fecha de nacimiento de forma coherente
 */
export const validateAgeAndBirth = (age, birthDate) => {
  const numAge = Number(age);
  const birth = new Date(birthDate);
  const today = new Date();

  if (age === "" || isNaN(numAge))
    return { valid: false, msg: "Edad requerida", field: "edad" };
  if (numAge < 0 || numAge > 110)
    return { valid: false, msg: "Edad no realista", field: "edad" };

  if (!birthDate)
    return { valid: false, msg: "Fecha requerida", field: "fechaNac" };
  if (birth > today)
    return { valid: false, msg: "¿Viene del futuro?", field: "fechaNac" };
  if (birth.getFullYear() < 1915)
    return { valid: false, msg: "Año no válido", field: "fechaNac" };

  const yearDiff = today.getFullYear() - birth.getFullYear();
  if (Math.abs(yearDiff - numAge) > 1) {
    return { valid: false, msg: "Edad y fecha no coinciden", field: "edad" };
  }

  return { valid: true, msg: "Coherente" };
};

/**
 * Valida DNI Real (Mínimo 1.000.000 para ser válido en Argentina/región)
 */
export const validateDNI = (dni) => {
  const num = Number(dni);
  const regex = /^\d{7,8}$/;
  if (!regex.test(dni)) return { valid: false, msg: "7 u 8 números" };
  if (num < 1000000) return { valid: false, msg: "DNI demasiado bajo" };
  if (num > 99999999) return { valid: false, msg: "DNI no existe" };
  return { valid: true, msg: "DNI válido" };
};

/**
 * Valida Teléfono (10 a 12 números)
 */
export const validatePhone = (tel) => {
  const cleanTel = tel.replace(/\s/g, "").replace(/-/g, "");
  const regex = /^\d{10,12}$/;
  if (!regex.test(cleanTel)) return { valid: false, msg: "10-12 números" };
  return { valid: true, msg: "Teléfono válido" };
};

/**
 * Valida Email profesional
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return { valid: false, msg: "Email inválido" };
  return { valid: true, msg: "Email válido" };
};
