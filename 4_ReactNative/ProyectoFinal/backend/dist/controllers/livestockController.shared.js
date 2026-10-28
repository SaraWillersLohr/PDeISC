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
export function validBirthDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date <= new Date(new Date().toISOString().slice(0, 10));
}
