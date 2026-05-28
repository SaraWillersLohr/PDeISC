// Yo importo las configuraciones de países para validar documentos y teléfonos
import { obtenerConfigPais, PAISES_PERMITIDOS } from "./paisConfig.js";

// Yo defino una lista negra de palabras comunes de spam o prueba
const LISTA_NEGRA = [
  "asdf",
  "qwerty",
  "ajajaj",
  "jajaja",
  "lalala",
  "hahaha",
  "xxxx",
  "test",
  "fake",
  "spam",
  "usuario",
  "nombre",
  "apellido",
  "abc",
];

const tieneVocales = (t) => /[aeiouáéíóú]/i.test(t);

// Yo calculo la edad real usando el objeto Date (año, mes y día)
export const calcularEdadDesdeFecha = (fechaNac) => {
  const hoy = new Date();
  const partes = fechaNac.split("-");
  const nac = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
  );
  let edad = hoy.getFullYear() - nac.getFullYear();
  const diffMes = hoy.getMonth() - nac.getMonth();
  // Yo ajusto la edad si aún no cumplió años este año
  if (diffMes < 0 || (diffMes === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }
  return edad;
};

export const validarNombreReal = (texto) => {
  const valor = texto.trim();
  // Yo verifico que el nombre tenga al menos 3 letras
  if (valor.length < 3) return { valido: false, mensaje: "Mínimo 3 letras" };
  // Yo limito el nombre a máximo 35 caracteres
  if (valor.length > 35)
    return { valido: false, mensaje: "Máximo 35 caracteres" };
  // Yo rechazo nombres que contengan números
  if (/\d/.test(valor)) return { valido: false, mensaje: "No uses números" };
  // Yo solo permito letras válidas incluyendo acentos y ñ
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s'-]+$/.test(valor))
    return { valido: false, mensaje: "Símbolos no permitidos" };
  // Yo detecto si hay muchas letras repetidas seguidas
  if (/(.)\1{2,}/i.test(valor))
    return { valido: false, mensaje: "Demasiadas letras repetidas" };
  // Yo verifico que el texto tenga vocales para evitar texto basura
  if (!tieneVocales(valor))
    return { valido: false, mensaje: "Debe tener vocales reales" };

  const min = valor.toLowerCase().replace(/\s/g, "");
  // Yo rechazo palabras comunes de spam o prueba
  if (LISTA_NEGRA.some((b) => min.includes(b.replace(/\s/g, "")))) {
    return { valido: false, mensaje: "Texto no permitido (spam/troll)" };
  }

  // Yo verifico que haya suficiente variedad de letras para que sea un nombre real
  const unicos = new Set(min.split(""));
  if (min.length >= 6 && unicos.size < 3)
    return { valido: false, mensaje: "Parece texto basura" };

  return { valido: true, mensaje: "Nombre válido" };
};

export const validarNacionalidad = (codigo) => {
  // Yo verifico que el código de país sea válido y esté en la lista de permitidos
  if (!codigo || !PAISES_PERMITIDOS[codigo]) {
    return { valido: false, mensaje: "Seleccioná una nacionalidad permitida" };
  }
  return { valido: true, mensaje: PAISES_PERMITIDOS[codigo].nombre };
};

export const validarDocumento = (documento, codigoPais) => {
  const pais = obtenerConfigPais(codigoPais);
  if (!pais) return { valido: false, mensaje: "Primero elegí la nacionalidad" };

  const limpio = documento.trim();
  // Yo verifico que el documento no esté vacío
  if (!limpio) return { valido: false, mensaje: "Documento obligatorio" };
  // Yo solo permito números en el documento
  if (/[^0-9]/.test(limpio))
    return { valido: false, mensaje: "Solo números, sin letras ni símbolos" };

  const { min, max, minValor, mensaje } = pais.documento;
  // Yo verifico que el documento tenga la longitud correcta según el país
  if (limpio.length < min || limpio.length > max) {
    return { valido: false, mensaje };
  }

  const numero = Number(limpio);
  // Yo verifico que el número no sea demasiado bajo
  if (numero < minValor)
    return { valido: false, mensaje: "Número de documento muy bajo" };
  // Yo rechazo documentos con muchos dígitos repetidos
  if (/^(\d)\1{5,}$/.test(limpio))
    return { valido: false, mensaje: "Documento poco real" };

  return { valido: true, mensaje: "Documento válido" };
};

export const validarTelefono = (telefono, codigoPais) => {
  const pais = obtenerConfigPais(codigoPais);
  if (!pais)
    return {
      valido: false,
      mensaje: "Elegí nacionalidad para validar teléfono",
    };

  const limpio = telefono.replace(/\D/g, "");
  // Yo verifico que el teléfono no esté vacío
  if (!limpio) return { valido: false, mensaje: "Teléfono obligatorio" };
  // Yo verifico que solo tenga números
  if (/[^0-9]/.test(telefono.trim()) && telefono.trim() !== limpio) {
    return { valido: false, mensaje: "Solo números en el teléfono" };
  }

  const { longitudes, mensaje } = pais.telefono;
  // Yo verifico que el teléfono tenga la longitud correcta según el país
  if (!longitudes.includes(limpio.length)) {
    return { valido: false, mensaje };
  }
  // Yo rechazo teléfonos con muchos dígitos repetidos
  if (/^(\d)\1{6,}$/.test(limpio))
    return { valido: false, mensaje: "Teléfono poco real" };

  return { valido: true, mensaje: "Teléfono válido" };
};

export const validarEdadYFecha = (edad, fechaNac) => {
  // Yo verifico que ambos campos estén completos
  if (edad === "" || fechaNac === "") {
    return {
      valido: false,
      mensaje: edad === "" ? "Edad obligatoria" : "Fecha obligatoria",
      campo: edad === "" ? "edad" : "fechaNac",
    };
  }

  const numEdad = Number(edad);
  // Yo verifico que la edad sea un número válido entre 0 y 110
  if (!Number.isInteger(numEdad) || numEdad < 0 || numEdad > 110) {
    return { valido: false, mensaje: "Edad entre 0 y 110", campo: "edad" };
  }

  const partes = fechaNac.split("-");
  // Yo verifico que la fecha tenga el formato correcto
  if (partes.length !== 3) {
    return { valido: false, mensaje: "Fecha inválida", campo: "fechaNac" };
  }

  const nacimiento = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
  );
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Yo verifico que la fecha sea válida
  if (Number.isNaN(nacimiento.getTime())) {
    return { valido: false, mensaje: "Fecha inválida", campo: "fechaNac" };
  }
  // Yo rechazo fechas futuras
  if (nacimiento > hoy) {
    return {
      valido: false,
      mensaje: "La fecha no puede ser futura",
      campo: "fechaNac",
    };
  }
  // Yo rechazo fechas muy antiguas (antes de 1915)
  if (nacimiento.getFullYear() < 1915) {
    return {
      valido: false,
      mensaje: "Año de nacimiento muy antiguo",
      campo: "fechaNac",
    };
  }

  // Yo verifico que la edad coincida con la fecha de nacimiento
  const edadReal = calcularEdadDesdeFecha(fechaNac);
  if (edadReal !== numEdad) {
    return {
      valido: false,
      mensaje: "La edad no coincide con la fecha de nacimiento",
      campo: "edad",
    };
  }

  return { valido: true, mensaje: `Coherente (${edadReal} años)` };
};

export const validarEmail = (email) => {
  const valor = email.trim();
  // Yo verifico que el email no esté vacío
  if (!valor) return { valido: false, mensaje: "Email obligatorio" };
  // Yo rechazo emails con espacios
  if (/\s/.test(valor))
    return { valido: false, mensaje: "El email no puede tener espacios" };
  // Yo verifico que tenga el símbolo @
  if (!valor.includes("@")) return { valido: false, mensaje: "Falta el @" };
  // Yo rechazo emails que empiezan o terminan con @
  if (valor.startsWith("@") || valor.endsWith("@"))
    return { valido: false, mensaje: "Formato inválido" };

  const [local, dominio] = valor.split("@");
  // Yo verifico que la parte local del email tenga al menos 2 caracteres
  if (!local || local.length < 2)
    return { valido: false, mensaje: "Usuario del mail muy corto" };
  // Yo verifico que el dominio sea válido
  if (!dominio || !dominio.includes("."))
    return { valido: false, mensaje: "Dominio incompleto" };
  if (dominio.endsWith("."))
    return { valido: false, mensaje: "Dominio incompleto (ej: @gmail.)" };

  // Yo uso un regex para validar el formato estándar de email
  const patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!patron.test(valor))
    return { valido: false, mensaje: "Formato de email inválido" };

  // Yo verifico que la extensión del dominio sea válida
  const tld = dominio.split(".").pop();
  if (!tld || tld.length < 2)
    return { valido: false, mensaje: "Extensión del dominio inválida" };

  return { valido: true, mensaje: "Email válido" };
};

export const validarHijos = (tieneHijos, cantidad) => {
  // Si no tiene hijos, la validación pasa automáticamente
  if (tieneHijos === "no") return { valido: true, mensaje: "Sin hijos" };
  const n = Number(cantidad);
  // Yo verifico que la cantidad de hijos esté entre 1 y 12
  if (!Number.isInteger(n) || n < 1 || n > 12) {
    return { valido: false, mensaje: "Entre 1 y 12 hijos" };
  }
  return { valido: true, mensaje: "Cantidad válida" };
};

export const validarSexo = (valor) => {
  // Yo verifico que el sexo sea male o female
  if (valor === "male" || valor === "female")
    return { valido: true, mensaje: "OK" };
  return { valido: false, mensaje: "Seleccioná sexo" };
};

export const validarEstadoCivil = (valor) => {
  // Yo verifico que el estado civil sea uno de los permitidos
  const ok = ["soltero", "casado", "divorciado", "viudo"].includes(valor);
  return ok
    ? { valido: true, mensaje: "OK" }
    : { valido: false, mensaje: "Estado civil inválido" };
};

// Yo valido todo el formulario completo verificando cada campo
export const validarFormularioCompleto = (formulario, checkTerminos) => {
  const pais = formulario.nacionalidad.value;
  return (
    validarNombreReal(formulario.nombre.value).valido &&
    validarNombreReal(formulario.apellido.value).valido &&
    validarNacionalidad(pais).valido &&
    validarDocumento(formulario.documento.value, pais).valido &&
    validarTelefono(formulario.telefono.value, pais).valido &&
    validarEdadYFecha(formulario.edad.value, formulario.fechaNac.value)
      .valido &&
    validarEmail(formulario.email.value).valido &&
    validarSexo(formulario.sexo.value).valido &&
    validarEstadoCivil(formulario.estadoCivil.value).valido &&
    validarHijos(formulario.tieneHijos.value, formulario.cantidadHijos.value)
      .valido &&
    checkTerminos.checked
  );
};
