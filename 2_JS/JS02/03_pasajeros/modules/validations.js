/**
 * Validaciones para el Registro de Personas (Proyecto 3)
 */

const LISTA_NEGRA = ["asdf", "qwerty", "jajaja", "xddd", "aaaa", "trash", "test"];
const SUDAMERICA = [
  "argentina", "brasil", "brazil", "chile", "uruguay", "paraguay", 
  "bolivia", "peru", "colombia", "venezuela", "ecuador", "suriname", "guyana"
];

/**
 * Valida nombres y apellidos reales
 */
export const validarNombreReal = (texto) => {
  const valor = texto.trim();
  if (valor.length < 3) return { valido: false, mensaje: "Mínimo 3 letras" };
  if (valor.length > 35) return { valido: false, mensaje: "Muy largo" };
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) return { valido: false, mensaje: "Solo letras" };
  if (/(.)\1\1/.test(valor)) return { valido: false, mensaje: "Evite repetir letras" };

  const valorMinus = valor.toLowerCase();
  if (LISTA_NEGRA.some((b) => valorMinus.includes(b))) return { valido: false, mensaje: "Dato no permitido" };

  const caracteresDistintos = new Set(valorMinus.replace(/\s/g, "").split("")).size;
  if (valor.length >= 8 && caracteresDistintos < 4) return { valido: false, mensaje: "Escriba un nombre real" };

  return { valido: true, mensaje: "Correcto" };
};

/**
 * Valida que el país sea de Sudamérica
 */
export const validarNacionalidad = (pais) => {
  const valor = pais.trim().toLowerCase();
  if (SUDAMERICA.includes(valor)) return { valido: true, mensaje: "País válido" };
  return { valido: false, mensaje: "Debe ser de Sudamérica" };
};

/**
 * Valida edad y fecha de nacimiento de forma coherente
 */
export const validarEdadYFecha = (edad, fechaNac) => {
  const numEdad = Number(edad);
  const nacimiento = new Date(fechaNac);
  const hoy = new Date();

  if (edad === "" || isNaN(numEdad)) return { valido: false, mensaje: "Edad requerida", campo: "edad" };
  if (numEdad < 0 || numEdad > 110) return { valido: false, mensaje: "Edad no realista", campo: "edad" };

  if (!fechaNac) return { valido: false, mensaje: "Fecha requerida", campo: "fechaNac" };
  if (nacimiento > hoy) return { valido: false, mensaje: "¿Viene del futuro?", campo: "fechaNac" };
  if (nacimiento.getFullYear() < 1915) return { valido: false, mensaje: "Año inválido", campo: "fechaNac" };

  const diferenciaAnos = hoy.getFullYear() - nacimiento.getFullYear();
  if (Math.abs(diferenciaAnos - numEdad) > 1) {
    return { valido: false, mensaje: "Edad y fecha no coinciden", campo: "edad" };
  }

  return { valido: true, mensaje: "Coherente" };
};

/**
 * Valida DNI Real (7 u 8 números)
 */
export const validarDNI = (dni) => {
  const num = Number(dni);
  const patron = /^\d{7,8}$/;
  if (!patron.test(dni)) return { valido: false, mensaje: "7 u 8 números" };
  if (num < 1000000) return { valido: false, mensaje: "Número muy bajo" };
  return { valido: true, mensaje: "DNI válido" };
};

/**
 * Valida Teléfono (10 a 12 números)
 */
export const validarTelefono = (tel) => {
  const limpio = tel.replace(/\s/g, "").replace(/-/g, "");
  const patron = /^\d{10,12}$/;
  if (!patron.test(limpio)) return { valido: false, mensaje: "10-12 números" };
  return { valido: true, mensaje: "Teléfono válido" };
};

/**
 * Valida Email
 */
export const validarEmail = (email) => {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patron.test(email)) return { valido: false, mensaje: "Email inválido" };
  return { valido: true, mensaje: "Email válido" };
};
