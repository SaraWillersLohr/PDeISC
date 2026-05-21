// Módulo de validaciones para el formulario
// Contiene la lógica "atómica" de validación de campos

// Valido el nombre para el formulario de contacto
// Si el nombre es demasiado corto, solo permito letras y espacios, no permito repeticiones de letras, no permito secuencias de teclado y no permito muchas consonantes
export function validarNombre(nombre) {
    const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const secuenciasTeclado = /asdf|sdfg|jkl|qwerty|zxcv|abcabc|123/i.test(nombre);
    const letrasRepetidas = /(.)\1{2,}/.test(nombre.toLowerCase());
    const muchasConsonantes = /[^aeiouáéíóúüñ\s]{5,}/i.test(nombre);

    if (nombre.length < 3) return "El nombre es demasiado corto.";
    if (!regexSoloLetras.test(nombre)) return "Solo se permiten letras y espacios.";
    if (letrasRepetidas || secuenciasTeclado) return "Ingresá un nombre coherente.";
    if (muchasConsonantes) return "El nombre parece contener texto aleatorio.";
    
    return null; // Sin errores
}

// Valido el email para el formulario de contacto
export function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "El email es obligatorio.";
    if (!regex.test(email)) return "Ingresá un email válido.";
    return null;
}

// Calculo la edad basándose en una fecha de nacimiento
export function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const cumple = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
        edad--;
    }
    return edad;
}

// Valido la edad según reglas de negocio (máximo 120 años)
export function validarEdad(edad) {
    if (edad < 0) return "La fecha no puede ser futura.";
    if (edad > 120) return "La edad no puede ser mayor a 120 años.";
    if (edad < 13) return "Debes ser mayor de 13 años para contactarnos.";
    return null;
}
