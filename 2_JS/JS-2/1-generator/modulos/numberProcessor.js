/**
 * este es el motor que procesa todos los números de la suite.
 * acá detecto qué tipo de número es, si es complejo, fracción o factorial.
 * también manejo la ambigüedad para que no se asuma decimal automáticamente.
 */

// calculo el factorial usando BigInt para no perder precisión con números gigantes
export function calcularFactorial(numeroEntrada) {
    if (numeroEntrada < 0) return NaN;
    if (numeroEntrada === 0 || numeroEntrada === 1) return 1n;
    let resultadoCalculado = 1n;
    for (let i = 2n; i <= BigInt(numeroEntrada); i++) {
        resultadoCalculado *= i;
    }
    return resultadoCalculado;
}

// acá busco todas las interpretaciones posibles para un mismo texto
export function obtenerTiposPosibles(textoOriginal) {
    const listaDeTipos = [];
    
    // si ya viene con el prefijo, no hay duda de qué es
    if (/^0x[0-9a-fA-F]+$/.test(textoOriginal)) return ["hexadecimal"];
    if (/^0b[01]+$/.test(textoOriginal)) return ["binario"];
    if (/^0o[0-7]+$/.test(textoOriginal)) return ["octal"];
    
    // detecto si es un número complejo o imaginario
    if (/^([-+]?[0-9]*\.?[0-9]+)([-+][0-9]*\.?[0-9]+)i$/.test(textoOriginal)) return ["complejo"];
    if (/^([-+]?[0-9]*\.?[0-9]+)i$/.test(textoOriginal)) return ["imaginario"];
    
    // detecto fracciones simples
    if (/^([-+]?[0-9]+)\/([0-9]+)$/.test(textoOriginal)) return ["fracción"];
    
    // detecto si es un factorial (ej: 5!)
    if (/^[0-9]+!$/.test(textoOriginal)) return ["factorial"];
    
    // detecto números con punto o notación científica
    if (/^-?[0-9]*\.[0-9]+([eE][-+]?[0-9]+)?$/.test(textoOriginal) || /^-?[0-9]+[eE][-+]?[0-9]+$/.test(textoOriginal)) {
        return ["decimal (coma/punto)"];
    }

    // si son solo caracteres alfanuméricos, pruebo las bases comunes
    if (/^[0-9a-fA-F]+$/.test(textoOriginal)) {
        if (/^[01]+$/.test(textoOriginal)) listaDeTipos.push("binario");
        if (/^[0-7]+$/.test(textoOriginal)) listaDeTipos.push("octal");
        if (/^[0-9]+$/.test(textoOriginal)) listaDeTipos.push("entero (base 10)");
        listaDeTipos.push("hexadecimal");
    } else if (/^-[0-9]+$/.test(textoOriginal)) {
        // es un entero negativo
        listaDeTipos.push("negativo");
    }

    return listaDeTipos;
}

// convierto el texto al valor numérico real según el tipo seleccionado
export function normalizarValor(textoLimpio, tipoElegido) {
    try {
        switch (tipoElegido) {
            case "hexadecimal": 
                return parseInt(textoLimpio.startsWith('0x') ? textoLimpio.substring(2) : textoLimpio, 16);
            case "binario":
                return parseInt(textoLimpio.startsWith('0b') ? textoLimpio.substring(2) : textoLimpio, 2);
            case "octal":
                return parseInt(textoLimpio.startsWith('0o') ? textoLimpio.substring(2) : textoLimpio, 8);
            case "entero (base 10)":
            case "entero":
            case "negativo":
                return parseInt(textoLimpio, 10);
            case "decimal (coma/punto)":
            case "notación científica":
                return parseFloat(textoLimpio);
            case "fracción": {
                const partes = textoLimpio.split('/');
                const numerador = Number(partes[0]);
                const denominador = Number(partes[1]);
                return denominador !== 0 ? numerador / denominador : null;
            }
            case "factorial": {
                const numeroParaFactorial = parseInt(textoLimpio.replace('!', ''));
                const resultadoFactorial = calcularFactorial(numeroParaFactorial);
                return typeof resultadoFactorial === 'bigint' ? resultadoFactorial.toString() : resultadoFactorial;
            }
            default: return null;
        }
    } catch (error) { return null; }
}

// esta es la función principal que procesa un dato y devuelve toda su info
export function procesarDato(entradaUsuario, tipoForzado = null) {
    const textoProcesado = entradaUsuario.trim().replace(/\s+/g, '');
    if (!textoProcesado) return { valido: false };

    const tiposEncontrados = obtenerTiposPosibles(textoProcesado);
    const tipoFinal = tipoForzado || (tiposEncontrados.length === 1 ? tiposEncontrados[0] : null);
    
    let valorNormalizado = null;
    let datosExtra = {};

    if (tipoFinal) {
        valorNormalizado = normalizarValor(textoProcesado, tipoFinal);
        
        // separo las partes si es complejo
        if (tipoFinal === "complejo") {
            const coincidencias = textoProcesado.match(/^([-+]?[0-9]*\.?[0-9]+)([-+][0-9]*\.?[0-9]+)i$/);
            datosExtra.parteReal = parseFloat(coincidencias[1]);
            datosExtra.parteImaginaria = parseFloat(coincidencias[2]);
        } else if (tipoFinal === "imaginario") {
            const coincidenciasImaginarias = textoProcesado.match(/^([-+]?[0-9]*\.?[0-9]+)i$/);
            datosExtra.parteReal = 0;
            datosExtra.parteImaginaria = parseFloat(coincidenciasImaginarias[1]);
        }
    }

    // acá decido si el número es útil: debe empezar y terminar con el mismo dígito
    let esUtil = false;
    if (valorNormalizado !== null && !isNaN(Number(valorNormalizado))) {
        const textoValor = Math.abs(Number(valorNormalizado)).toString();
        if (textoValor.length >= 1) {
            esUtil = textoValor[0] === textoValor[textoValor.length - 1];
        }
    }

    return {
        original: textoProcesado,
        valor: valorNormalizado,
        tipo: tipoFinal,
        posiblesTipos: tiposEncontrados,
        esAmbiguo: tiposEncontrados.length > 1 && !tipoForzado,
        valido: tiposEncontrados.length > 0,
        esFactorial: tipoFinal === 'factorial',
        esUtil,
        ...datosExtra
    };
}
