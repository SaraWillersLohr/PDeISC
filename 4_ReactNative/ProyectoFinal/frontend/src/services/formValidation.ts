export function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Reutilizo la regla de nombres del envío, pero identifico el campo antes de llamar a la API.
export function personNameError(value: string, label: string, maxLength = 100): string {
  if (!value.trim()) return `Ingresá ${label}.`;
  if (value.trim().length > maxLength) return `${label} no puede superar los ${maxLength} caracteres.`;
  if (!/[aeiouáéíóúü]/i.test(value) || !/[a-záéíóúüñ]/i.test(value) || /(.)\1{4}/i.test(value)) return `Revisá ${label}: debe contener letras y vocales, sin repeticiones excesivas.`;
  return '';
}

// Distingo fechas de hechos ocurridos y vencimientos que sí admiten días futuros.
export function dateFieldError(value: string, allowFuture = false, optional = false): string {
  if (!value && optional) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Elegí una fecha en el calendario.';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return 'La fecha ingresada no existe.';
  if (!allowFuture && value > formatLocalDate(new Date())) return 'La fecha debe ser de hoy o anterior.';
  return '';
}

// Reglas de carga: no intentan determinar si un nombre real tiene significado.
export function validateFormBody(body: unknown): void {
 if (!body || typeof body !== 'object') return;
 for (const [key, value] of Object.entries(body)) {
  if (typeof value !== 'string' || !value.trim()) continue;
  if (/^(nombre|apellido|madre_texto|padre_texto)$/.test(key) && (!/[aeiouáéíóúü]/i.test(value) || !/[a-záéíóúüñ]/i.test(value) || /(.)\1{4}/i.test(value))) throw new Error('Revisá el nombre: debe contener letras y vocales, sin repeticiones excesivas.');
  if (/^fecha($|_)/.test(key)) {
   const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
   if (!match) throw new Error('Elegí una fecha válida con el calendario.');
   const [, y, m, d] = match.map(Number); const date = new Date(y, m - 1, d);
   if (date.getFullYear() !== y || date.getMonth() !== m-1 || date.getDate() !== d) throw new Error('La fecha ingresada no existe.');
   const today = new Date(); today.setHours(23,59,59,999);
   if (!/vencimiento|estimada/.test(key) && date > today) throw new Error('La fecha de un hecho registrado no puede ser futura.');
  }
 }
}
// Límites operativos conservadores por especie; se comparan años calendario completos.
export function animalBirthError(value: string, species: string): string {
 if (!value) return '';
 const tag = species.toLowerCase();
 const limit = /equin|caball/.test(tag) ? 40 : /bovin/.test(tag) ? 30 : /ovin/.test(tag) ? 25 : /porcin/.test(tag) ? 30 : null;
 if (!limit) return '';
 const earliest = new Date(); earliest.setFullYear(earliest.getFullYear()-limit);
 return new Date(`${value}T12:00:00`) < earliest ? `Revisá el nacimiento: el límite de carga para esta especie es ${limit} años.` : '';
}
