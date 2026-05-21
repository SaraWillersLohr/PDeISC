const BASURA = ["asdf", "qwerty", "test", "xxx", "spam", "fake", "lorem"];

const tieneVocales = (t) => /[aeiouáéíóú]/i.test(t);

export const validarNombre = (texto) => {
  const valor = texto.trim();
  if (valor.length < 2) return { valido: false, mensaje: "Mínimo 2 letras" };
  if (/\d/.test(valor)) return { valido: false, mensaje: "Sin números" };
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s'-]+$/.test(valor)) return { valido: false, mensaje: "Caracteres inválidos" };
  if (/(.)\1{2,}/.test(valor)) return { valido: false, mensaje: "Repetición excesiva" };
  if (!tieneVocales(valor)) return { valido: false, mensaje: "Texto poco real" };
  if (BASURA.some((b) => valor.toLowerCase().includes(b))) return { valido: false, mensaje: "Dato no permitido" };
  return { valido: true, mensaje: "OK" };
};

export const validarEmail = (email) => {
  const valor = email.trim();
  if (!valor) return { valido: false, mensaje: "Email obligatorio" };
  const patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!patron.test(valor)) return { valido: false, mensaje: "Formato inválido" };
  const dominio = valor.split("@")[1] || "";
  if (dominio.length < 4 || !dominio.includes(".")) return { valido: false, mensaje: "Dominio inválido" };
  return { valido: true, mensaje: "Email válido" };
};

export const validarTelefono = (tel) => {
  const limpio = tel.replace(/[\s\-()]/g, "");
  if (!/^\d{10,12}$/.test(limpio)) return { valido: false, mensaje: "10 a 12 dígitos" };
  if (/^(\d)\1{5,}$/.test(limpio)) return { valido: false, mensaje: "Número poco real" };
  return { valido: true, mensaje: "Teléfono válido" };
};

export const validarEdad = (edad) => {
  const n = Number(edad);
  if (edad === "" || Number.isNaN(n)) return { valido: false, mensaje: "Edad obligatoria" };
  if (!Number.isInteger(n) || n < 16 || n > 100) return { valido: false, mensaje: "Entre 16 y 100" };
  return { valido: true, mensaje: "Edad válida" };
};

export const validarMesa = (mesa) => {
  const n = Number(mesa);
  if (Number.isNaN(n) || n < 1 || n > 80) return { valido: false, mensaje: "Mesa entre 1 y 80" };
  return { valido: true, mensaje: "Mesa válida" };
};

export const validarAcompanantes = (valor) => {
  const n = Number(valor);
  if (Number.isNaN(n) || n < 0 || n > 8) return { valido: false, mensaje: "Entre 0 y 8" };
  return { valido: true, mensaje: "Cantidad válida" };
};

export const validarNotas = (texto) => {
  const valor = texto.trim();
  if (valor.length > 120) return { valido: false, mensaje: "Máximo 120 caracteres" };
  if (valor && /(.)\1{4,}/.test(valor)) return { valido: false, mensaje: "Texto spam detectado" };
  return { valido: true, mensaje: "OK" };
};
