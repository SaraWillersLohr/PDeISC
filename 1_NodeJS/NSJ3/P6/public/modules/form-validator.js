// Comentarios claros: este archivo explica la lógica paso a paso.

/**
 * Validador de Formulario
 * Realiza comprobaciones locales y consultas a APIs externas (Abstract API) 
 * para asegurar que los datos del formulario sean válidos.
 */
const API_KEY = 'ea4ce909ad82d0126f571fa852ae1a41a2c1eff83fd7d98d45799187ffe0ce8c';

export const formValidator = {
  async validate(formData) {
    const errors = {};

    // Fullname: Validación local estricta + API
    const fullname = formData.get('fullname').trim();
    const nameParts = fullname.split(/\s+/);
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const vowelRegex = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/;
    const repeatedCharRegex = /(.)\1\1/;

    // Si if (!fullname), entonces se ejecuta este bloque.
    if (!fullname) {
      errors.fullname = 'El nombre completo es requerido.';
    } else if (nameParts.length < 2) {
      errors.fullname = 'Ingresa al menos un nombre y un apellido.';
    } else if (!nameRegex.test(fullname)) {
      errors.fullname = 'El nombre solo debe contener letras.';
    } else if (repeatedCharRegex.test(fullname)) {
      errors.fullname = 'Demasiadas letras repetidas.';
    } else {
      // Validar vocales localmente primero para filtrar "sd dsd"
      let hasVowels = true;
      for (const part of nameParts) {
        // Si if (part.length < 2 || !vowelRegex.test(part)), entonces se ejecuta este bloque.
        if (part.length < 2 || !vowelRegex.test(part)) {
          hasVowels = false;
          break;
        }
      }

      // Si if (!hasVowels), entonces se ejecuta este bloque.
      if (!hasVowels) {
        errors.fullname = 'Ingresa un nombre y apellido que parezca real (debe contener vocales).';
      } else {
        // Si pasa el filtro de vocales, consultamos la API
        try {
          const firstName = nameParts[0];
          const response = await fetch(`https://gender-api.com/get?name=${firstName}&key=${API_KEY}`);
          const data = await response.json();
          // Si if (data.gender === 'unknown' || (data.accuracy && data.accuracy < 60)), entonces se ejecuta este bloque.
          if (data.gender === 'unknown' || (data.accuracy && data.accuracy < 60)) {
            errors.fullname = 'Ese nombre no parece ser un nombre real registrado.';
          }
        } catch (e) {
          console.warn('API Offline, usando validación local');
        }
      }
    }

    // Email
    const email = formData.get('email');
    // Si if (!email), entonces se ejecuta este bloque.
    if (!email) {
      errors.email = 'El correo es requerido.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'El formato de correo no es válido.';
    }

    // Age
    const age = formData.get('age');
    // Si if (!age), entonces se ejecuta este bloque.
    if (!age) {
      errors.age = 'La edad es requerida.';
    } else if (age < 18 || age > 100) {
      errors.age = 'La edad debe estar entre 18 y 100 años.';
    }

    // Otros campos
    if (!formData.get('workshop')) errors.workshop = 'Debes seleccionar un taller.';
    // Si if (!formData.get('level')), entonces se ejecuta este bloque.
    if (!formData.get('level')) errors.level = 'Debes seleccionar tu nivel.';
    // Si if (!formData.get('terms')), entonces se ejecuta este bloque.
    if (!formData.get('terms')) errors.terms = 'Debes aceptar los términos.';

    return errors;
  }
};
