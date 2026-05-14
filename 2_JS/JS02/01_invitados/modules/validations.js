/**
 * Validaciones para la lista de invitados VIP
 */

const LISTA_NEGRA = ["asdf", "qwerty", "jajaja", "xddd", "aaaa", "trash", "test"];

/**
 * Valida nombres y apellidos reales
 */
export const validarNombreReal = (texto) => {
    const valor = texto.trim();
    if (valor.length < 2) return { valido: false, mensaje: "Muy corto" };
    if (valor.length > 30) return { valido: false, mensaje: "Muy largo" };
    
    // Solo letras y espacios
    if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) return { valido: false, mensaje: "Solo letras" };
    
    // Evita spam de letras repetidas
    if (/(.)\1\1/.test(valor)) return { valido: false, mensaje: "Dato inválido" };
    
    const valorMinuscula = valor.toLowerCase();
    if (LISTA_NEGRA.some(palabra => valorMinuscula.includes(palabra))) return { valido: false, mensaje: "Nombre no permitido" };

    return { valido: true, mensaje: "¡Válido!" };
};

/**
 * Valida que la edad esté en un rango permitido
 */
export const validarEdad = (edad, min, max) => {
    const numero = Number(edad);
    if (edad === "" || isNaN(numero)) return { valido: false, mensaje: "Edad requerida" };
    if (numero < min || numero > max) return { valido: false, mensaje: `Rango: ${min}-${max}` };
    return { valido: true, mensaje: "Edad correcta" };
};
