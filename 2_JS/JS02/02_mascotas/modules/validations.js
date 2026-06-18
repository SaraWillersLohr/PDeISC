// Yo creo las validaciones del proyecto 2 para asegurar datos reales y correctos
// Esto evita que el usuario ingrese datos falsos o incorrectos
const BASURA = ["asdf", "qwerty", "test", "xxx", "spam", "fake", "lorem"];

// Función tieneVocales que ayuda a entender la lógica.
const tieneVocales = (t) => /[aeiouáéíóú]/i.test(t);

export const validarNombre = (texto) => {
  const valor = texto.trim();
  // Yo verifico que el nombre tenga al menos 2 letras
  if (valor.length < 2) return { valido: false, mensaje: "Mínimo 2 letras" };
  // Yo rechazo nombres que contengan números
  if (/\d/.test(valor)) return { valido: false, mensaje: "Sin números" };
  // Yo solo permito letras válidas incluyendo acentos y ñ
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s'-]+$/.test(valor))
    return { valido: false, mensaje: "Caracteres inválidos" };
  // Yo detecto si hay muchas letras repetidas seguidas
  if (/(.)\1{2,}/.test(valor))
    return { valido: false, mensaje: "Repetición excesiva" };
  // Yo verifico que el texto tenga vocales para evitar texto basura
  if (!tieneVocales(valor))
    return { valido: false, mensaje: "Texto poco real" };
  // Yo rechazo palabras comunes de prueba o basura
  if (BASURA.some((b) => valor.toLowerCase().includes(b)))
    return { valido: false, mensaje: "Dato no permitido" };
  return { valido: true, mensaje: "OK" };
};

export const validarEmail = (email) => {
  const valor = email.trim();
  // Yo verifico que el email no esté vacío
  if (!valor) return { valido: false, mensaje: "Email obligatorio" };
  // Yo uso un regex para validar el formato estándar de email
  const patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!patron.test(valor))
    return { valido: false, mensaje: "Formato inválido" };
  // Yo verifico que el dominio sea válido
  const dominio = valor.split("@")[1] || "";
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dominio.length < 4 || !dominio.includes("."))
    return { valido: false, mensaje: "Dominio inválido" };
  return { valido: true, mensaje: "Email válido" };
};

export const validarTelefono = (tel) => {
  // Yo limpio el teléfono eliminando espacios, guiones y paréntesis
  const limpio = tel.replace(/[\s\-()]/g, "");
  // Yo verifico que tenga entre 10 y 12 dígitos
  if (!/^\d{10,12}$/.test(limpio))
    return { valido: false, mensaje: "10 a 12 dígitos" };
  // Yo rechazo números con muchos dígitos repetidos
  if (/^(\d)\1{5,}$/.test(limpio))
    return { valido: false, mensaje: "Número poco real" };
  return { valido: true, mensaje: "Teléfono válido" };
};

export const validarEdad = (edad) => {
  const n = Number(edad);
  // Yo verifico que la edad no esté vacía y sea un número válido
  if (edad === "" || Number.isNaN(n))
    return { valido: false, mensaje: "Edad obligatoria" };
  // Yo verifico que sea un entero entre 16 y 100 años
  if (!Number.isInteger(n) || n < 16 || n > 100)
    return { valido: false, mensaje: "Entre 16 y 100" };
  return { valido: true, mensaje: "Edad válida" };
};

export const validarMesa = (mesa) => {
  const n = Number(mesa);
  // Yo verifico que la mesa sea un número entre 1 y 80
  if (Number.isNaN(n) || n < 1 || n > 80)
    return { valido: false, mensaje: "Mesa entre 1 y 80" };
  return { valido: true, mensaje: "Mesa válida" };
};

export const validarAcompanantes = (valor) => {
  const n = Number(valor);
  // Yo verifico que sea un número entre 0 y 8 acompañantes
  if (Number.isNaN(n) || n < 0 || n > 8)
    return { valido: false, mensaje: "Entre 0 y 8" };
  return { valido: true, mensaje: "Cantidad válida" };
};

export const validarNotas = (texto) => {
  const valor = texto.trim();
  // Yo limito las notas a máximo 120 caracteres
  if (valor.length > 120)
    return { valido: false, mensaje: "Máximo 120 caracteres" };
  // Yo detecto si hay texto spam con muchas letras repetidas
  if (valor && /(.)\1{4,}/.test(valor))
    return { valido: false, mensaje: "Texto spam detectado" };
  return { valido: true, mensaje: "OK" };
};