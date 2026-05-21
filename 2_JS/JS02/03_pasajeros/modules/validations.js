import { obtenerConfigPais, PAISES_PERMITIDOS } from "./paisConfig.js";

const LISTA_NEGRA = [
  "asdf", "qwerty", "ajajaj", "jajaja", "lalala", "hahaha", "xxxx",
  "test", "fake", "spam", "usuario", "nombre", "apellido", "abc",
];

const tieneVocales = (t) => /[aeiouáéíóú]/i.test(t);

/** Calculo edad real con Date (año, mes y día) */
export const calcularEdadDesdeFecha = (fechaNac) => {
  const hoy = new Date();
  const partes = fechaNac.split("-");
  const nac = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  let edad = hoy.getFullYear() - nac.getFullYear();
  const diffMes = hoy.getMonth() - nac.getMonth();
  if (diffMes < 0 || (diffMes === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }
  return edad;
};

export const validarNombreReal = (texto) => {
  const valor = texto.trim();
  if (valor.length < 3) return { valido: false, mensaje: "Mínimo 3 letras" };
  if (valor.length > 35) return { valido: false, mensaje: "Máximo 35 caracteres" };
  if (/\d/.test(valor)) return { valido: false, mensaje: "No uses números" };
  if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s'-]+$/.test(valor)) return { valido: false, mensaje: "Símbolos no permitidos" };
  if (/(.)\1{2,}/i.test(valor)) return { valido: false, mensaje: "Demasiadas letras repetidas" };
  if (!tieneVocales(valor)) return { valido: false, mensaje: "Debe tener vocales reales" };

  const min = valor.toLowerCase().replace(/\s/g, "");
  if (LISTA_NEGRA.some((b) => min.includes(b.replace(/\s/g, "")))) {
    return { valido: false, mensaje: "Texto no permitido (spam/troll)" };
  }

  const unicos = new Set(min.split(""));
  if (min.length >= 6 && unicos.size < 3) return { valido: false, mensaje: "Parece texto basura" };

  return { valido: true, mensaje: "Nombre válido" };
};

export const validarNacionalidad = (codigo) => {
  if (!codigo || !PAISES_PERMITIDOS[codigo]) {
    return { valido: false, mensaje: "Seleccioná una nacionalidad permitida" };
  }
  return { valido: true, mensaje: PAISES_PERMITIDOS[codigo].nombre };
};

export const validarDocumento = (documento, codigoPais) => {
  const pais = obtenerConfigPais(codigoPais);
  if (!pais) return { valido: false, mensaje: "Primero elegí la nacionalidad" };

  const limpio = documento.trim();
  if (!limpio) return { valido: false, mensaje: "Documento obligatorio" };
  if (/[^0-9]/.test(limpio)) return { valido: false, mensaje: "Solo números, sin letras ni símbolos" };

  const { min, max, minValor, mensaje } = pais.documento;
  if (limpio.length < min || limpio.length > max) {
    return { valido: false, mensaje };
  }

  const numero = Number(limpio);
  if (numero < minValor) return { valido: false, mensaje: "Número de documento muy bajo" };
  if (/^(\d)\1{5,}$/.test(limpio)) return { valido: false, mensaje: "Documento poco real" };

  return { valido: true, mensaje: "Documento válido" };
};

export const validarTelefono = (telefono, codigoPais) => {
  const pais = obtenerConfigPais(codigoPais);
  if (!pais) return { valido: false, mensaje: "Elegí nacionalidad para validar teléfono" };

  const limpio = telefono.replace(/\D/g, "");
  if (!limpio) return { valido: false, mensaje: "Teléfono obligatorio" };
  if (/[^0-9]/.test(telefono.trim()) && telefono.trim() !== limpio) {
    return { valido: false, mensaje: "Solo números en el teléfono" };
  }

  const { longitudes, mensaje } = pais.telefono;
  if (!longitudes.includes(limpio.length)) {
    return { valido: false, mensaje };
  }
  if (/^(\d)\1{6,}$/.test(limpio)) return { valido: false, mensaje: "Teléfono poco real" };

  return { valido: true, mensaje: "Teléfono válido" };
};

export const validarEdadYFecha = (edad, fechaNac) => {
  if (edad === "" || fechaNac === "") {
    return {
      valido: false,
      mensaje: edad === "" ? "Edad obligatoria" : "Fecha obligatoria",
      campo: edad === "" ? "edad" : "fechaNac",
    };
  }

  const numEdad = Number(edad);
  if (!Number.isInteger(numEdad) || numEdad < 0 || numEdad > 110) {
    return { valido: false, mensaje: "Edad entre 0 y 110", campo: "edad" };
  }

  const partes = fechaNac.split("-");
  if (partes.length !== 3) {
    return { valido: false, mensaje: "Fecha inválida", campo: "fechaNac" };
  }

  const nacimiento = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (Number.isNaN(nacimiento.getTime())) {
    return { valido: false, mensaje: "Fecha inválida", campo: "fechaNac" };
  }
  if (nacimiento > hoy) {
    return { valido: false, mensaje: "La fecha no puede ser futura", campo: "fechaNac" };
  }
  if (nacimiento.getFullYear() < 1915) {
    return { valido: false, mensaje: "Año de nacimiento muy antiguo", campo: "fechaNac" };
  }

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
  if (!valor) return { valido: false, mensaje: "Email obligatorio" };
  if (/\s/.test(valor)) return { valido: false, mensaje: "El email no puede tener espacios" };
  if (!valor.includes("@")) return { valido: false, mensaje: "Falta el @" };
  if (valor.startsWith("@") || valor.endsWith("@")) return { valido: false, mensaje: "Formato inválido" };

  const [local, dominio] = valor.split("@");
  if (!local || local.length < 2) return { valido: false, mensaje: "Usuario del mail muy corto" };
  if (!dominio || !dominio.includes(".")) return { valido: false, mensaje: "Dominio incompleto" };
  if (dominio.endsWith(".")) return { valido: false, mensaje: "Dominio incompleto (ej: @gmail.)" };

  const patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!patron.test(valor)) return { valido: false, mensaje: "Formato de email inválido" };

  const tld = dominio.split(".").pop();
  if (!tld || tld.length < 2) return { valido: false, mensaje: "Extensión del dominio inválida" };

  return { valido: true, mensaje: "Email válido" };
};

export const validarHijos = (tieneHijos, cantidad) => {
  if (tieneHijos === "no") return { valido: true, mensaje: "Sin hijos" };
  const n = Number(cantidad);
  if (!Number.isInteger(n) || n < 1 || n > 12) {
    return { valido: false, mensaje: "Entre 1 y 12 hijos" };
  }
  return { valido: true, mensaje: "Cantidad válida" };
};

export const validarSexo = (valor) => {
  if (valor === "male" || valor === "female") return { valido: true, mensaje: "OK" };
  return { valido: false, mensaje: "Seleccioná sexo" };
};

export const validarEstadoCivil = (valor) => {
  const ok = ["soltero", "casado", "divorciado", "viudo"].includes(valor);
  return ok ? { valido: true, mensaje: "OK" } : { valido: false, mensaje: "Estado civil inválido" };
};

export const validarFormularioCompleto = (formulario, checkTerminos) => {
  const pais = formulario.nacionalidad.value;
  return (
    validarNombreReal(formulario.nombre.value).valido &&
    validarNombreReal(formulario.apellido.value).valido &&
    validarNacionalidad(pais).valido &&
    validarDocumento(formulario.documento.value, pais).valido &&
    validarTelefono(formulario.telefono.value, pais).valido &&
    validarEdadYFecha(formulario.edad.value, formulario.fechaNac.value).valido &&
    validarEmail(formulario.email.value).valido &&
    validarSexo(formulario.sexo.value).valido &&
    validarEstadoCivil(formulario.estadoCivil.value).valido &&
    validarHijos(formulario.tieneHijos.value, formulario.cantidadHijos.value).valido &&
    checkTerminos.checked
  );
};
