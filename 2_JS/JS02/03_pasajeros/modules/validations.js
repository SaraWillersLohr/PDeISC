/**
 * Validaciones para el Registro de Personas
 * Lógica profesional y robusta
 */

const BLACKLIST = ["asdf", "qwerty", "jajaja", "xddd", "aaaa", "trash", "test"];

/**
 * Valida nombres reales para pasajes
 */
export const validateRealName = (text) => {
  const val = text.trim();
  if (val.length < 3) return { valid: false, msg: "Mínimo 3 letras" };
  if (val.length > 35) return { valid: false, msg: "Muy largo" };

  // Esta función valida que el formato sea real
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s]+$/.test(val))
    return { valid: false, msg: "Solo letras" };

  if (/(.)\1\1/.test(val)) return { valid: false, msg: "Repetición detectada" };

  const lowerVal = val.toLowerCase();
  if (BLACKLIST.some((b) => lowerVal.includes(b)))
    return { valid: false, msg: "Nombre no válido" };

  // Evitar spam tipo "dssdsfds"
  const distinctChars = new Set(lowerVal.replace(/\s/g, "").split("")).size;
  if (val.length >= 8 && distinctChars < 4)
    return { valid: false, msg: "Escriba un nombre real" };

  return { valid: true, msg: "Nombre aceptado" };
};

/**
 * Valida edad y fecha de nacimiento de forma coherente
 */
export const validateAgeAndBirth = (age, birthDate) => {
  const numAge = Number(age);
  const birth = new Date(birthDate);
  const today = new Date();

  // 1. Validar Edad lógica (0 a 110 años)
  if (age === "" || isNaN(numAge))
    return { valid: false, msg: "Edad requerida", field: "edad" };
  if (numAge < 0 || numAge > 110)
    return { valid: false, msg: "Edad no realista", field: "edad" };

  // 2. Validar Fecha de Nacimiento
  if (!birthDate)
    return { valid: false, msg: "Fecha requerida", field: "fechaNac" };
  if (birth > today)
    return { valid: false, msg: "¿Viene del futuro?", field: "fechaNac" };
  if (birth.getFullYear() < 1915)
    return { valid: false, msg: "Año no válido", field: "fechaNac" };

  // 3. Coherencia entre edad y fecha de nacimiento
  const yearDiff = today.getFullYear() - birth.getFullYear();
  if (Math.abs(yearDiff - numAge) > 1) {
    return { valid: false, msg: "Edad y fecha no coinciden", field: "edad" };
  }

  return { valid: true, msg: "Coherente" };
};

/**
 * Valida DNI (7 u 8 números)
 */
export const validateDNI = (dni) => {
  const regex = /^\d{7,8}$/;
  if (!regex.test(dni)) return { valid: false, msg: "7 u 8 números" };
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
