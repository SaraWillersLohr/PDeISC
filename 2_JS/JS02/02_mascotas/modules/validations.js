/**
 * Validaciones específicas para la Expo Mascotas
 * Lógica profesional y coherente con el tipo de animal
 */

export const PET_LIMITS = {
    Perro: { maxAge: 20, minWeight: 1, maxWeight: 90 },
    Gato: { maxAge: 22, minWeight: 0.5, maxWeight: 15 },
    Hamster: { maxAge: 4, minWeight: 0.02, maxWeight: 0.8 },
    Tortuga: { maxAge: 150, minWeight: 0.1, maxWeight: 250 },
    Ave: { maxAge: 60, minWeight: 0.01, maxWeight: 10 },
    Otro: { maxAge: 30, minWeight: 0.1, maxWeight: 100 },
    Default: { maxAge: 30, minWeight: 0.1, maxWeight: 100 }
};

const BLACKLIST = ["asdf", "qwerty", "jajaja", "xddd", "aaaa", "trash", "test"];

/**
 * Valida nombres de mascotas, razas y dueños
 */
// Exporto esta función para poder usarla en el resto del proyecto
export const validatePetText = (text) => {
    const val = text.trim();
    if (val.length < 2) return { valid: false, msg: "Muy corto" };
    if (val.length > 35) return { valid: false, msg: "Muy largo" };
    
    // Esta función valida que el formato sea real
    if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) return { valid: false, msg: "Solo letras" };
    
    if (/(.)\1\1/.test(val)) return { valid: false, msg: "Letras repetidas" };
    
    const lowerVal = val.toLowerCase();
    if (BLACKLIST.some(b => lowerVal.includes(b))) return { valid: false, msg: "Dato no válido" };

    // Verificación de diversidad para evitar spam
    const distinctChars = new Set(lowerVal.replace(/\s/g, "").split("")).size;
    if (val.length >= 8 && distinctChars < 4) return { valid: false, msg: "Ingrese un dato real" };
    
    return { valid: true, msg: "¡Correcto!" };
};

/**
 * Valida edad y peso según la especie seleccionada
 */
// Dejo lista esta función para que otros archivos la puedan importar
export const validateAgeWeight = (especie, age, weight) => {
    const limits = PET_LIMITS[especie] || PET_LIMITS.Default;
    const numAge = Number(age);
    const numWeight = Number(weight);
    
    // Validar edad
    if (age === "" || isNaN(numAge)) return { valid: false, msg: "Edad requerida", field: "edad" };
    if (numAge < 0 || numAge > limits.maxAge) {
        return { valid: false, msg: `Máx ${limits.maxAge} años para ${especie}`, field: "edad" };
    }
    
    // Validar peso
    if (weight === "" || isNaN(numWeight)) return { valid: false, msg: "Peso requerido", field: "peso" };
    if (numWeight < limits.minWeight || numWeight > limits.maxWeight) {
        return { valid: false, msg: `Peso: ${limits.minWeight}-${limits.maxWeight}kg para ${especie}`, field: "peso" };
    }
    
    return { valid: true, msg: "Válido" };
};

/**
 * Valida email profesional
 */
export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return { valid: false, msg: "Email inválido" };
    return { valid: true, msg: "Email válido" };
};
