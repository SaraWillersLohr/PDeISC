/** Metadatos de cada método — lo uso en el banner y en la consola */
export const METHOD_META = {
  push: {
    id: "push",
    title: "push()",
    mutates: true,
    summary: "Agrega uno o más elementos al final del array.",
    hint: "Devuelve la nueva longitud. Modifica el array original.",
  },
  pop: {
    id: "pop",
    title: "pop()",
    mutates: true,
    summary: "Quita y devuelve el último elemento.",
    hint: "Si el array está vacío devuelve undefined. Modifica el original.",
  },
  unshift: {
    id: "unshift",
    title: "unshift()",
    mutates: true,
    summary: "Agrega elementos al inicio del array.",
    hint: "Modifica el array original y devuelve la nueva longitud.",
  },
  shift: {
    id: "shift",
    title: "shift()",
    mutates: true,
    summary: "Quita y devuelve el primer elemento.",
    hint: "Modifica el original. En arrays grandes puede ser más lento que pop.",
  },
  splice: {
    id: "splice",
    title: "splice()",
    mutates: true,
    summary: "Agrega, quita o reemplaza elementos en cualquier posición.",
    hint: "Muy versátil. Siempre modifica el array original.",
  },
  slice: {
    id: "slice",
    title: "slice()",
    mutates: false,
    summary: "Copia una porción del array sin tocar el original.",
    hint: "Devuelve un array nuevo. El original queda igual.",
  },
  indexOf: {
    id: "indexOf",
    title: "indexOf()",
    mutates: false,
    summary: "Busca la primera posición de un valor.",
    hint: "Devuelve -1 si no lo encuentra. No modifica el array.",
  },
  includes: {
    id: "includes",
    title: "includes()",
    mutates: false,
    summary: "Pregunta si el array contiene un valor (true/false).",
    hint: "Similar a indexOf pero más legible para condiciones.",
  },
  forEach: {
    id: "forEach",
    title: "forEach()",
    mutates: false,
    summary: "Recorre cada elemento y ejecuta una función.",
    hint: "No devuelve un array nuevo; solo recorre. No uses return para salir.",
  },
  map: {
    id: "map",
    title: "map()",
    mutates: false,
    summary: "Crea un array nuevo transformando cada elemento.",
    hint: "El original no cambia. Ideal cuando necesitás otro array.",
  },
  filter: {
    id: "filter",
    title: "filter()",
    mutates: false,
    summary: "Crea un array nuevo con los elementos que cumplen una condición.",
    hint: "El original queda intacto. Devuelve solo los que pasan el test.",
  },
  reduce: {
    id: "reduce",
    title: "reduce()",
    mutates: false,
    summary: "Reduce el array a un solo valor (suma, producto, total, etc.).",
    hint: "Necesitás valor inicial (acumulador). No modifica el array.",
  },
  sort: {
    id: "sort",
    title: "sort()",
    mutates: true,
    summary: "Ordena los elementos in-place.",
    hint: "¡Cuidado! Sin comparador ordena como strings. Modifica el original.",
  },
  reverse: {
    id: "reverse",
    title: "reverse()",
    mutates: true,
    summary: "Invierte el orden de los elementos in-place.",
    hint: "Modifica el array original. No crea una copia.",
  },
};

export function getMethodMeta(methodId) {
  return METHOD_META[methodId] ?? METHOD_META.push;
}
