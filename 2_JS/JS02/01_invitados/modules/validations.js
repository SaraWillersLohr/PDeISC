// Yo creo las validaciones del proyecto 1 para asegurar nombres reales, edad lógica y email válido
// Esto evita que el usuario ingrese datos falsos o incorrectos

const BASURA = [
  "asdf",
  "qwerty",
  "test",
  "aaa",
  "xxx",
  "spam",
  "fake",
  "nombre",
];
// Función tieneVocales que ayuda a entender la lógica.
const tieneVocales = (txt) => /[aeiouáéíóú]/i.test(txt);

export const validarNombreReal = (texto) => {
  const valor = texto.trim();
  // Yo verifico que el nombre tenga al menos 2 letras
  if (valor.length < 2) return { valido: false, mensaje: "Mínimo 2 letras" };
  // Yo limito el nombre a máximo 30 caracteres
  if (valor.length > 30)
    return { valido: false, mensaje: "Máximo 30 caracteres" };
  // Yo rechazo nombres que contengan números
  if (/\d/.test(valor)) return { valido: false, mensaje: "No uses números" };
  // Yo solo permito letras válidas incluyendo acentos y ñ
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s'-]+$/.test(valor))
    return { valido: false, mensaje: "Solo letras válidas" };
  // Yo detecto si hay muchas letras repetidas seguidas (ej: "aaaa")
  if (/(.)\1{2,}/.test(valor))
    return { valido: false, mensaje: "Muchas letras repetidas" };
  // Yo verifico que el texto tenga vocales para evitar texto basura
  if (!tieneVocales(valor))
    return { valido: false, mensaje: "Parece texto basura" };

  const min = valor.toLowerCase();
  // Yo rechazo palabras comunes de prueba o basura
  if (BASURA.some((b) => min.includes(b)))
    return { valido: false, mensaje: "Texto no permitido" };

  // Yo verifico que haya suficiente variedad de letras para que sea un nombre real
  const unicos = new Set(min.replace(/\s/g, "").split(""));
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (valor.length >= 6 && unicos.size < 3)
    return { valido: false, mensaje: "Escribí un nombre real" };

  return { valido: true, mensaje: "Nombre válido" };
};

export const validarEdad = (edad, min = 18, max = 99) => {
  const numero = Number(edad);
  // Yo verifico que la edad no esté vacía y sea un número válido
  if (edad === "" || Number.isNaN(numero))
    return { valido: false, mensaje: "Edad obligatoria" };
  // Yo rechazo edades con decimales
  if (!Number.isInteger(numero))
    return { valido: false, mensaje: "Sin decimales" };
  // Yo verifico que la edad esté en un rango lógico
  if (numero < min || numero > max)
    return { valido: false, mensaje: `Entre ${min} y ${max} años` };
  return { valido: true, mensaje: "Edad correcta" };
};

export const validarEmail = (email) => {
  const valor = email.trim();
  // Yo verifico que el email no esté vacío
  if (!valor) return { valido: false, mensaje: "Email obligatorio" };
  // Yo uso un regex para validar el formato estándar de email
  const patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!patron.test(valor))
    return { valido: false, mensaje: "Formato de email inválido" };
  // Yo verifico que el dominio sea válido
  const dominio = valor.split("@")[1]?.toLowerCase() || "";
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dominio.length < 4 || dominio.startsWith("."))
    return { valido: false, mensaje: "Dominio inválido" };
  return { valido: true, mensaje: "Email válido" };
};

export const validarAcompanantes = (valor) => {
  const num = Number(valor);
  // Yo verifico que sea un número válido
  if (Number.isNaN(num)) return { valido: false, mensaje: "Número inválido" };
  // Yo limito la cantidad de acompañantes entre 0 y 5
  if (num < 0 || num > 5)
    return { valido: false, mensaje: "Entre 0 y 5 acompañantes" };
  return { valido: true, mensaje: "Cantidad válida" };
};