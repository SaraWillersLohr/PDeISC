/**
 * Lógica de validación robusta para evitar datos basura
 * Pensada para ser profesional pero defendible oralmente
 */

const BLACKLIST = [
  "asdf",
  "qwerty",
  "jajaja",
  "xxxx",
  "test",
  "fake",
  "user",
  "admin",
  "xddd",
  "aaaa",
  "qqqq",
  "1111",
  "trash",
  "spam",
];
const MASH_PATTERNS = [
  "qwer",
  "asdf",
  "zxcv",
  "dfgh",
  "hjkl",
  "tyui",
  "vbnm",
  "1234",
];

/**
 * Valida nombres y apellidos de forma estricta
 */
// Exporto esta función para poder usarla en el resto del proyecto
export const validateRealName = (text) => {
  const val = text.trim();

  // 1. Longitud básica
  if (val.length < 2) return { valid: false, msg: "Es demasiado corto" };
  if (val.length > 35) return { valid: false, msg: "Es demasiado largo" };

  // 2. Solo letras y espacios, permitiendo tildes y ñ
  // Esta función valida que el formato sea real
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) {
    return { valid: false, msg: "Solo se permiten letras" };
  }

  // 3. Detectar repeticiones absurdas (aaa, bbb, etc)
  if (/(.)\1\1/.test(val)) {
    return { valid: false, msg: "Demasiadas letras repetidas" };
  }

  // 4. Detectar patrones de teclado (asdf, qwerty)
  const lowerVal = val.toLowerCase();
  if (
    BLACKLIST.some((b) => lowerVal.includes(b)) ||
    MASH_PATTERNS.some((p) => lowerVal.includes(p))
  ) {
    return { valid: false, msg: "Nombre no parece real" };
  }

  // 5. Verificación de diversidad de caracteres para nombres largos
  const distinctChars = new Set(lowerVal.replace(/\s/g, "").split("")).size;
  if (val.length >= 8 && distinctChars < 4) {
    return { valid: false, msg: "Escriba un nombre válido" };
  }

  return { valid: true, msg: "¡Se ve bien!" };
};

/**
 * Valida edad en un rango lógico para eventos
 */
// Exporto esta función para poder usarla en el resto del proyecto
export const validateAge = (age, min = 18, max = 99) => {
  const n = Number(age);
  if (isNaN(n) || age === "") return { valid: false, msg: "Ingrese un número" };
  if (n < min) return { valid: false, msg: `Mínimo ${min} años` };
  if (n > max) return { valid: false, msg: `Máximo ${max} años` };
  return { valid: true, msg: "Edad válida" };
};

/**
 * Valida emails con regex estándar profesional
 */
// Exporto esto para que sea reutilizable
export const validateEmail = (email) => {
  // Esta función valida que el formato sea real
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!regex.test(email)) return { valid: false, msg: "Email inválido" };
  return { valid: true, msg: "Email correcto" };
};
