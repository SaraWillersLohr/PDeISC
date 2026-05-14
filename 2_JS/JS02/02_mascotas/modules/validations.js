/**
 * Validaciones Inteligentes y Robustas (Sin Alerts)
 */

export const LIMITES_MASCOTAS = {
    // Normalizamos nombres para evitar errores de acentos o mayúsculas
    "perro": { maxEdad: 20, minPeso: 1, maxPeso: 90 },
    "gato": { maxEdad: 22, minPeso: 0.5, maxPeso: 15 },
    "hamster": { maxEdad: 4, minPeso: 0.02, maxPeso: 0.8 },
    "tortuga": { maxEdad: 150, minPeso: 0.1, maxPeso: 250 },
    "ave": { maxEdad: 60, minPeso: 0.01, maxPeso: 10 },
    "cane corso": { maxEdad: 12, minPeso: 40, maxPeso: 110 },
    "border collie": { maxEdad: 17, minPeso: 12, maxPeso: 25 },
    "default": { maxEdad: 30, minPeso: 0.1, maxPeso: 100 }
};

export const validarTextoMascota = (texto) => {
    const valor = texto.trim();
    if (valor === "") return { valido: false, mensaje: "Este campo es obligatorio" };
    if (valor.length < 3) return { valido: false, mensaje: "Mínimo 3 letras" };
    if (!/[aeiouAEIOU]/.test(valor)) return { valido: false, mensaje: "El nombre debe tener vocales" };
    if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) return { valido: false, mensaje: "Solo letras permitidas" };
    if (/(.)\1\1/.test(valor)) return { valido: false, mensaje: "Letras repetidas detectadas" };
    return { valido: true, mensaje: "¡Correcto!" };
};

/**
 * Validación de peso y edad ultra-segura
 */
export const validarEdadPeso = (especie, raza, edad, peso) => {
    // Normalizamos a minúsculas para que coincida siempre
    const especieLimpia = especie.toLowerCase();
    const razaLimpia = raza ? raza.toLowerCase() : "";

    // Buscamos límites: prioridad Raza > Especie > Default
    const limites = LIMITES_MASCOTAS[razaLimpia] || LIMITES_MASCOTAS[especieLimpia] || LIMITES_MASCOTAS.default;
    
    const numEdad = Number(edad);
    const numPeso = Number(peso);
    
    // Validación de Edad
    if (edad === "" || isNaN(numEdad)) return { valido: false, mensaje: "Edad requerida", campo: "edad" };
    if (numEdad < 0 || numEdad > limites.maxEdad) {
        return { valido: false, mensaje: `Un ${especie} vive máximo ${limites.maxEdad} años`, campo: "edad" };
    }
    
    // VALIDACIÓN DE PESO (Aquí estaba el fallo del hámster)
    if (peso === "" || isNaN(numPeso)) return { valido: false, mensaje: "Peso requerido", campo: "peso" };
    
    if (numPeso < limites.minPeso || numPeso > limites.maxPeso) {
        return { 
            valido: false, 
            mensaje: `Peso no válido para ${raza || especie} (${limites.minPeso}-${limites.maxPeso}kg)`, 
            campo: "peso" 
        };
    }
    
    return { valido: true, mensaje: "¡Datos correctos!" };
};

export const validarEmail = (email) => {
    const valor = email.trim();
    if (valor === "") return { valido: false, mensaje: "Email obligatorio" };
    if (!valor.includes("@")) return { valido: false, mensaje: "Te falta el '@'" };
    
    const partes = valor.split("@");
    if (partes.length < 2 || !partes[1].includes(".")) {
        return { valido: false, mensaje: "Falta el dominio (.com, .net, etc)" };
    }

    const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patron.test(valor)) return { valido: false, mensaje: "Formato de email inválido" };
    
    return { valido: true, mensaje: "Email válido" };
};
