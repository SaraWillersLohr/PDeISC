// valida el nombre del jugador antes de guardarlo en el ranking.
// devuelve true si el nombre es válido y false si no lo es.
export function validarNombre(nombre) {
  if (!nombre) return false;
  const nombreTrim = nombre.trim();
  if (nombreTrim.length < 3 || nombreTrim.length > 20) {
    return false;
  }
  // Permitir solo letras (incluidas tildes y eñes), números y espacios
  const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ ]+$/;
  return regex.test(nombreTrim);
}
