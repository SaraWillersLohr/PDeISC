// Comentarios claros: este archivo explica la lógica paso a paso.

/**
 * Yo creo este motor que procesa todos los números de la suite.
 * Acá detecto qué tipo de número es, si es complejo, fracción o factorial.
 * También manejo la ambigüedad para que no se asuma decimal automáticamente.
 */

// Yo calculo el factorial usando BigInt para no perder precisión con números gigantes
export function calcularFactorial(numeroEntrada) {
  // Yo rechazo números negativos porque el factorial no está definido para ellos
  if (numeroEntrada < 0) return NaN;
  // El factorial de 0 y 1 es 1 por definición
  if (numeroEntrada === 0 || numeroEntrada === 1) return 1n;
  // Yo calculo el factorial multiplicando todos los números hasta el valor de entrada
  let resultadoCalculado = 1n;
  // Repite este bloque con un bucle for.
  for (let i = 2n; i <= BigInt(numeroEntrada); i++) {
    resultadoCalculado *= i;
  }
  return resultadoCalculado;
}

// Yo busco todas las interpretaciones posibles para un mismo texto
export function obtenerTiposPosibles(textoOriginal) {
  const listaDeTipos = [];

  // Si ya viene con el prefijo, no hay duda de qué tipo es
  if (/^0x[0-9a-fA-F]+$/.test(textoOriginal)) return ["hexadecimal"];
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (/^0b[01]+$/.test(textoOriginal)) return ["binario"];
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (/^0o[0-7]+$/.test(textoOriginal)) return ["octal"];

  // Yo detecto si es un número complejo o imaginario
  if (/^([-+]?[0-9]*\.?[0-9]+)([-+][0-9]*\.?[0-9]+)i$/.test(textoOriginal))
    return ["complejo"];
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (/^([-+]?[0-9]*\.?[0-9]+)i$/.test(textoOriginal)) return ["imaginario"];

  // Yo detecto fracciones simples
  if (/^([-+]?[0-9]+)\/([0-9]+)$/.test(textoOriginal)) return ["fracción"];

  // Yo detecto si es un factorial (ej: 5!)
  if (/^[0-9]+!$/.test(textoOriginal)) return ["factorial"];

  // Yo detecto números con punto o notación científica
  if (
    /^-?[0-9]*\.[0-9]+([eE][-+]?[0-9]+)?$/.test(textoOriginal) ||
    /^-?[0-9]+[eE][-+]?[0-9]+$/.test(textoOriginal)
  ) {
    return ["decimal (coma/punto)"];
  }

  // Si son solo caracteres alfanuméricos, yo pruebo las bases comunes
  if (/^[0-9a-fA-F]+$/.test(textoOriginal)) {
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (/^[01]+$/.test(textoOriginal)) listaDeTipos.push("binario");
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (/^[0-7]+$/.test(textoOriginal)) listaDeTipos.push("octal");
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (/^[0-9]+$/.test(textoOriginal)) listaDeTipos.push("entero (base 10)");
    listaDeTipos.push("hexadecimal");
  } else if (/^-[0-9]+$/.test(textoOriginal)) {
    // Es un entero negativo
    listaDeTipos.push("negativo");
  }

  return listaDeTipos;
}

// Yo convierto el texto al valor numérico real según el tipo seleccionado
export function normalizarValor(textoLimpio, tipoElegido) {
  // try: prueba este bloque y permite capturar errores con catch.
try {
    // switch: elige una rama según el valor y ejecuta la acción correcta.
switch (tipoElegido) {
      case "hexadecimal":
        // Yo convierto de base 16 a decimal
        return parseInt(
          textoLimpio.startsWith("0x") ? textoLimpio.substring(2) : textoLimpio,
          16,
        );
      case "binario":
        // Yo convierto de base 2 a decimal
        return parseInt(
          textoLimpio.startsWith("0b") ? textoLimpio.substring(2) : textoLimpio,
          2,
        );
      case "octal":
        // Yo convierto de base 8 a decimal
        return parseInt(
          textoLimpio.startsWith("0o") ? textoLimpio.substring(2) : textoLimpio,
          8,
        );
      case "entero (base 10)":
      case "entero":
      case "negativo":
        // Yo convierto de base 10 a número
        return parseInt(textoLimpio, 10);
      case "decimal (coma/punto)":
      case "notación científica":
        // Yo convierto a número decimal
        return parseFloat(textoLimpio);
      case "fracción": {
        // Yo calculo el valor de la fracción dividiendo numerador por denominador
        const partes = textoLimpio.split("/");
        const numerador = Number(partes[0]);
        const denominador = Number(partes[1]);
        return denominador !== 0 ? numerador / denominador : null;
      }
      case "factorial": {
        // Yo calculo el factorial del número
        const numeroParaFactorial = parseInt(textoLimpio.replace("!", ""));
        const resultadoFactorial = calcularFactorial(numeroParaFactorial);
        return typeof resultadoFactorial === "bigint"
          ? resultadoFactorial.toString()
          : resultadoFactorial;
      }
      default:
        return null;
    }
  } catch (error) {
    return null;
  }
}

// Esta es mi función principal que procesa un dato y devuelve toda su información
export function procesarDato(entradaUsuario, tipoForzado = null) {
  // Yo limpio el texto eliminando espacios
  const textoProcesado = entradaUsuario.trim().replace(/\s+/g, "");
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!textoProcesado) return { valido: false };

  // Yo obtengo todos los tipos posibles para este texto
  const tiposEncontrados = obtenerTiposPosibles(textoProcesado);
  const tipoFinal =
    tipoForzado || (tiposEncontrados.length === 1 ? tiposEncontrados[0] : null);

  let valorNormalizado = null;
  let datosExtra = {};

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (tipoFinal) {
    // Yo normalizo el valor según el tipo detectado
    valorNormalizado = normalizarValor(textoProcesado, tipoFinal);

    // Yo separo las partes si es un número complejo
    if (tipoFinal === "complejo") {
      const coincidencias = textoProcesado.match(
        /^([-+]?[0-9]*\.?[0-9]+)([-+][0-9]*\.?[0-9]+)i$/,
      );
      datosExtra.parteReal = parseFloat(coincidencias[1]);
      datosExtra.parteImaginaria = parseFloat(coincidencias[2]);
    } else if (tipoFinal === "imaginario") {
      const coincidenciasImaginarias = textoProcesado.match(
        /^([-+]?[0-9]*\.?[0-9]+)i$/,
      );
      datosExtra.parteReal = 0;
      datosExtra.parteImaginaria = parseFloat(coincidenciasImaginarias[1]);
    }
  }

  // Yo decido si el número es útil: debe empezar y terminar con el mismo dígito
  let esUtil = false;
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (valorNormalizado !== null && !isNaN(Number(valorNormalizado))) {
    const textoValor = Math.abs(Number(valorNormalizado)).toString();
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (textoValor.length >= 1) {
      esUtil = textoValor[0] === textoValor[textoValor.length - 1];
    }
  }

  // Yo devuelvo toda la información procesada del dato
  return {
    original: textoProcesado,
    valor: valorNormalizado,
    tipo: tipoFinal,
    posiblesTipos: tiposEncontrados,
    esAmbiguo: tiposEncontrados.length > 1 && !tipoForzado,
    valido: tiposEncontrados.length > 0,
    esFactorial: tipoFinal === "factorial",
    esUtil,
    ...datosExtra,
  };
}