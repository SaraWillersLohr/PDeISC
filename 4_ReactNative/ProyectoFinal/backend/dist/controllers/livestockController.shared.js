import { validDateOnly } from '../utils/dateOnly.js';
export const animalGenders = ['hembra', 'macho', 'no_especificado'];
export function isAnimalGender(value) { return animalGenders.includes(value); }
export function readPhoto(value) {
    if (value == null || value === '')
        return null;
    if (typeof value !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) || Buffer.byteLength(value, 'utf8') > 1_500_000)
        return false;
    return value;
}
// valido fechas reales y evito nacimientos posteriores al día actual.
const estanciaCalendar = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
});
export function validBirthDate(value) {
    return validDateOnly(value) !== null && value <= estanciaCalendar.format(new Date());
}
