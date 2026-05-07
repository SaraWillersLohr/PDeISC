const GENDER_API_KEY = '76bb25fefeabd49be5c92deb911c222f4b953ae1e1c99dbf14e88687c3abd8fc';

// Muestra mensaje debajo del campo
export function setMsg(fieldId, msg, type) {
  const el = document.querySelector(`#${fieldId} + .field-msg`) ||
             document.querySelector(`.field-msg[data-for="${fieldId}"]`);
  if (!el) return;
  el.textContent = msg;
  el.className = `field-msg ${type}`;
}

export function setFieldState(id, state) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('error', 'valid');
  if (state) el.classList.add(state);
}

// Valida nombre con Gender API (que exista como nombre real)
export async function validateName(name) {
  if (!name || name.trim().length < 2) return { ok: false, msg: 'Ingresá un nombre válido.' };
  
  // Limpieza básica
  const cleanName = name.trim();
  if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/.test(cleanName)) {
    return { ok: false, msg: 'Solo se permiten letras en el nombre.' };
  }

  const firstName = cleanName.split(' ')[0];
  
  try {
    const res = await fetch(`https://gender-api.com/get?name=${encodeURIComponent(firstName)}&key=${GENDER_API_KEY}`);
    if (!res.ok) throw new Error('API Error');
    
    const data = await res.json();
    
    // Si samples es 0, el nombre no existe en la base de datos de la API
    if (data.samples === 0) {
      return { ok: false, msg: 'Ese nombre no parece real. Verificá cómo lo escribiste.' };
    }
    
    // Si la precisión es muy baja, también lo rechazamos
    if (data.accuracy < 50) {
      return { ok: false, msg: 'Nombre no reconocido. Por favor, usá un nombre real.' };
    }

    return { ok: true, msg: `Nombre reconocido ✓` };
  } catch (error) {
    console.error('Error validando nombre:', error);
    // Si falla la API (por red o límite), permitimos pasar con validación básica de formato
    // para no bloquear al usuario si el servicio externo cae
    return { ok: true, msg: 'Nombre aceptado (validación básica) ✓' };
  }
}

// Valida email con formato y dominio
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email)) return { ok: false, msg: 'El formato del email no es válido.' };
  const domain = email.split('@')[1].toLowerCase();
  const fakeDomains = ['test.com', 'fake.com', 'example.com', 'mailinator.com', 'tempmail.com', 'guerrillamail.com'];
  if (fakeDomains.includes(domain)) return { ok: false, msg: 'Usá un email real.' };
  return { ok: true, msg: 'Email válido ✓' };
}

// Valida edad
export function validateAge(age, min = 1, max = 120) {
  const n = parseInt(age);
  if (isNaN(n) || age === '') return { ok: false, msg: 'Ingresá una edad.' };
  if (n < min) return { ok: false, msg: `La edad mínima es ${min} años.` };
  if (n > max) return { ok: false, msg: `La edad máxima es ${max} años.` };
  return { ok: true, msg: 'Edad válida ✓' };
}

// Valida campo no vacío
export function validateRequired(value, label = 'Este campo') {
  if (!value || value.trim() === '' || value === '0') {
    return { ok: false, msg: `${label} es obligatorio.` };
  }
  return { ok: true, msg: '' };
}

// Envía el formulario al server Node
export async function submitForm(endpoint, data) {
  const res = await fetch(`http://localhost:3001${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
