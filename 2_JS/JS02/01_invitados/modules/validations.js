// validaciones del proyecto 1 (nombres reales, edad lógica, mail si existe)

const BASURA = ["asdf", "qwerty", "test", "aaa", "xxx", "spam", "fake", "nombre"];
const tieneVocales = (txt) => /[aeiouáéíóú]/i.test(txt);

export const validarNombreReal = (texto) => {
  const valor = texto.trim();
  if (valor.length < 2) return { valido: false, mensaje: "Mínimo 2 letras" };
  if (valor.length > 30) return { valido: false, mensaje: "Máximo 30 caracteres" };
  if (/\d/.test(valor)) return { valido: false, mensaje: "No uses números" };
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s'-]+$/.test(valor)) return { valido: false, mensaje: "Solo letras válidas" };
  if (/(.)\1{2,}/.test(valor)) return { valido: false, mensaje: "Muchas letras repetidas" };
  if (!tieneVocales(valor)) return { valido: false, mensaje: "Parece texto basura" };

  const min = valor.toLowerCase();
  if (BASURA.some((b) => min.includes(b))) return { valido: false, mensaje: "Texto no permitido" };

  const unicos = new Set(min.replace(/\s/g, "").split(""));
  if (valor.length >= 6 && unicos.size < 3) return { valido: false, mensaje: "Escribí un nombre real" };

  return { valido: true, mensaje: "Nombre válido" };
};

export const validarEdad = (edad, min = 18, max = 99) => {
  const numero = Number(edad);
  if (edad === "" || Number.isNaN(numero)) return { valido: false, mensaje: "Edad obligatoria" };
  if (!Number.isInteger(numero)) return { valido: false, mensaje: "Sin decimales" };
  if (numero < min || numero > max) return { valido: false, mensaje: `Entre ${min} y ${max} años` };
  return { valido: true, mensaje: "Edad correcta" };
};

export const validarEmail = (email) => {
  const valor = email.trim();
  if (!valor) return { valido: false, mensaje: "Email obligatorio" };
  const patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!patron.test(valor)) return { valido: false, mensaje: "Formato de email inválido" };
  const dominio = valor.split("@")[1]?.toLowerCase() || "";
  if (dominio.length < 4 || dominio.startsWith(".")) return { valido: false, mensaje: "Dominio inválido" };
  return { valido: true, mensaje: "Email válido" };
};

export const validarAcompanantes = (valor) => {
  const num = Number(valor);
  if (Number.isNaN(num)) return { valido: false, mensaje: "Número inválido" };
  if (num < 0 || num > 5) return { valido: false, mensaje: "Entre 0 y 5 acompañantes" };
  return { valido: true, mensaje: "Cantidad válida" };
};
