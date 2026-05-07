/**
 * Validaciones para el Registro de Personas
 * Lógica profesional y robusta
 */

const BLACKLIST = ["asdf", "qwerty", "jajaja", "xddd", "aaaa", "trash", "test"];

// Esta parte se encarga de las validaciones
export const validateRealName = (text) => {
  const val = text.trim();
  if (val.length < 3) return { valid: false, msg: "Mínimo 3 letras" };
  if (val.length > 35) return { valid: false, msg: "Muy largo" };
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s]+$/.test(val))
    return { valid: false, msg: "Solo letras" };
  if (/(.)\1\1/.test(val)) return { valid: false, msg: "Repetición detectada" };
  if (BLACKLIST.some((b) => val.toLowerCase().includes(b)))
    return { valid: false, msg: "No parece real" };
  return { valid: true, msg: "Correcto" };
};

// Verifico el formato con una expresión regular
export const validateDNI = (dni) => {
  const regex = /^\d{7,8}$/;
  if (!regex.test(dni)) return { valid: false, msg: "7 u 8 números" };
  return { valid: true, msg: "DNI válido" };
};

// Chequeo que lo que escribió cumpla el patrón
export const validatePhone = (tel) => {
  const regex = /^\d{10,12}$/;
  if (!regex.test(tel.replace(/\s/g, "")))
    return { valid: false, msg: "10-12 números" };
  return { valid: true, msg: "Teléfono válido" };
};

// Valido el email con regex profesional
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return { valid: false, msg: "Email inválido" };
  return { valid: true, msg: "Email válido" };
};
