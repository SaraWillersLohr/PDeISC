// Yo creo las validaciones del proyecto para asegurar nombres reales y edad lógica
// Esto evita que el usuario ingrese datos falsos o incorrectos

const BASURA = [
  'asdf',
  'qwerty',
  'test',
  'aaa',
  'xxx',
  'spam',
  'fake',
  'nombre',
  'apellido'
];

// Acá verifico que el texto tenga vocales para descartar basura tipo "bcdfg"
const tieneVocales = (txt) => /[aeiouáéíóú]/i.test(txt);

// Acá valido nombre o apellido con reglas estrictas para que sean datos reales
function validarTextoReal(texto, etiqueta = 'campo') {
  const valor = texto.trim();

  if (!valor) {
    return { valido: false, mensaje: `El ${etiqueta} es obligatorio.` };
  }

  if (valor.length < 2) {
    return { valido: false, mensaje: 'Mínimo 2 caracteres.' };
  }

  if (valor.length > 100) {
    return { valido: false, mensaje: 'Máximo 100 caracteres.' };
  }

  if (/\d/.test(valor)) {
    return { valido: false, mensaje: 'No uses números.' };
  }

  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s'-]+$/.test(valor)) {
    return { valido: false, mensaje: 'Solo letras válidas.' };
  }

  if (/(.)\1{2,}/.test(valor)) {
    return { valido: false, mensaje: 'Muchas letras repetidas.' };
  }

  if (!tieneVocales(valor)) {
    return { valido: false, mensaje: 'Parece texto basura.' };
  }

  const min = valor.toLowerCase();
  if (BASURA.some((b) => min.includes(b))) {
    return { valido: false, mensaje: 'Texto no permitido.' };
  }

  const unicos = new Set(min.replace(/\s/g, '').split(''));
  if (valor.length >= 6 && unicos.size < 3) {
    return { valido: false, mensaje: `Escribí un ${etiqueta} real.` };
  }

  return { valido: true, mensaje: `${etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1)} válido.` };
}

// Acá valido que el nombre sea real y cumpla todas las reglas
export const validarNombre = (texto) => validarTextoReal(texto, 'nombre');

// Acá valido que el apellido sea real y cumpla todas las reglas
export const validarApellido = (texto) => validarTextoReal(texto, 'apellido');

// Acá valido que la edad sea un número entero dentro del rango permitido
export const validarEdad = (edad, min = 1, max = 120) => {
  const numero = Number(edad);

  if (edad === '' || edad === null || edad === undefined || Number.isNaN(numero)) {
    return { valido: false, mensaje: 'La edad es obligatoria.' };
  }

  if (!Number.isInteger(numero)) {
    return { valido: false, mensaje: 'Sin decimales.' };
  }

  if (numero < min || numero > max) {
    return { valido: false, mensaje: `Entre ${min} y ${max} años.` };
  }

  return { valido: true, mensaje: 'Edad correcta.' };
};

// Acá valido todos los campos del alumno y devuelvo un objeto con errores por campo
export const validarAlumno = ({ nombre, apellido, edad }) => {
  const errores = {};

  const resultadoNombre = validarNombre(nombre);
  if (!resultadoNombre.valido) errores.nombre = resultadoNombre.mensaje;

  const resultadoApellido = validarApellido(apellido);
  if (!resultadoApellido.valido) errores.apellido = resultadoApellido.mensaje;

  const resultadoEdad = validarEdad(edad);
  if (!resultadoEdad.valido) errores.edad = resultadoEdad.mensaje;

  return errores;
};
