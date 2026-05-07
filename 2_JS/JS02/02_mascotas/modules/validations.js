/**
 * Validaciones específicas para la Expo Mascotas
 * Lógica profesional y coherente con el tipo de animal
 */

export const PET_LIMITS = {
    Perro: { maxAge: 25, minWeight: 1, maxWeight: 90 },
    Gato: { maxAge: 25, minWeight: 0.5, maxWeight: 20 },
    Hamster: { maxAge: 4, minWeight: 0.05, maxWeight: 0.5 },
    Tortuga: { maxAge: 150, minWeight: 0.1, maxWeight: 200 },
    Ave: { maxAge: 60, minWeight: 0.02, maxWeight: 5 },
    Default: { maxAge: 30, minWeight: 0.1, maxWeight: 100 }
};

const BLACKLIST = ["asdf", "qwerty", "jajaja", "xddd", "aaaa", "trash", "test"];

/**
 * Valida nombres de mascotas y razas
 */
// Exporto esta función para poder usarla en el resto del proyecto
export const validatePetText = (text) => {
    const val = text.trim();
    if (val.length < 2) return { valid: false, msg: "Muy corto" };
    if (val.length > 25) return { valid: false, msg: "Muy largo" };
    
    // Esta función valida que el formato sea real
    if (!/^[a-zA-ZÁéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) return { valid: false, msg: "Solo letras" };
    
    if (/(.)\1\1/.test(val)) return { valid: false, msg: "Letras repetidas" };
    
    if (BLACKLIST.some(b => val.toLowerCase().includes(b))) return { valid: false, msg: "Nombre no válido" };
    
    return { valid: true, msg: "Correcto" };
};

/**
 * Valida edad y peso según la especie seleccionada
 */
// Dejo lista esta función para que otros archivos la puedan importar
export const validateAgeWeight = (especie, age, weight) => {
    const limits = PET_LIMITS[especie] || PET_LIMITS.Default;
    const numAge = Number(age);
    const numWeight = Number(weight);
    
    if (age === "" || isNaN(numAge)) return { valid: false, msg: "Edad requerida", field: "edad" };
    if (weight === "" || isNaN(numWeight)) return { valid: false, msg: "Peso requerido", field: "peso" };

    if (numAge < 0 || numAge > limits.maxAge) {
        return { valid: false, msg: `Edad máx: ${limits.maxAge}`, field: "edad" };
    }
    
    if (numWeight < limits.minWeight || numWeight > limits.maxWeight) {
        return { valid: false, msg: `Peso: ${limits.minWeight}-${limits.maxWeight}kg`, field: "peso" };
    }
    
    return { valid: true, msg: "Válido" };
};
