// ==========================================
// Módulo para el método sort()
// Creado por mí (Sara) para los apuntes.
// sort() ordena los elementos de un array IN SITU (en su lugar).
// ¡Cuidado! Por defecto, ordena como strings (por orden alfabético Unicode),
// lo que genera errores al ordenar números (ej. "10" queda antes que "2").
// SÍ modifica el array original (es mutable).
// ==========================================

export const sortMethod = {
  name: "sort()",
  description: "Ordena los elementos de un arreglo localmente y devuelve el arreglo ordenado.",
  mutates: true,
  syntax: "array.sort((a, b) => { return criterioDeOrden; })",
  
  exercises: [
    {
      id: "sort-1",
      title: "1. Ordenar números de menor a mayor",
      description: "Ordena un array de números numéricamente (ascendente) usando una función de comparación.",
      getInitialArray: () => [40, 100, 1, 5, 25, 10],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de sort! Usamos (a, b) => a - b para orden numérico ascendente
        arr.sort((a, b) => a - b);
        
        return {
          initial: [...array],
          code: `const numeros = [40, 100, 1, 5, 25, 10];\nnumeros.sort((a, b) => a - b);`,
          result: arr,
          log: `sort((a, b) => a - b) ordenó el array numéricamente: [${arr.join(", ")}]`
        };
      }
    },
    {
      id: "sort-2",
      title: "2. Ordenar palabras alfabéticamente",
      description: "Ordena un array de palabras alfabéticamente de la A a la Z.",
      getInitialArray: () => ["Zanahoria", "Manzana", "Banana", "Pera"],
      run: (array) => {
        const arr = [...array];
        
        // Ordenamos alfabéticamente usando localeCompare para dar soporte a acentos e eñes si hiciera falta
        arr.sort((a, b) => a.localeCompare(b));
        
        return {
          initial: [...array],
          code: `const frutas = ["Zanahoria", "Manzana", "Banana", "Pera"];\nfrutas.sort((a, b) => a.localeCompare(b));`,
          result: arr,
          log: `sort() ordenó las palabras alfabéticamente: [${arr.join(", ")}]`
        };
      }
    },
    {
      id: "sort-3",
      title: "3. Ordenar objetos por edad",
      description: "Dado un array de objetos {nombre, edad}, ordénalos de menor a mayor según la edad.",
      getInitialArray: () => [
        { nombre: "Ana", edad: 25 },
        { nombre: "Juan", edad: 18 },
        { nombre: "Marta", edad: 32 }
      ],
      run: (array) => {
        const arr = [...array];
        
        // Comparamos el atributo edad de cada objeto: a.edad - b.edad
        arr.sort((a, b) => a.edad - b.edad);
        
        return {
          initial: array.map(o => `{${o.nombre}, ${o.edad} años}`),
          code: `const personas = [\n  { nombre: "Ana", edad: 25 },\n  { nombre: "Juan", edad: 18 }\n];\npersonas.sort((a, b) => a.edad - b.edad);`,
          result: arr.map(o => `${o.nombre} (${o.edad})`), // Renderizamos nombres ordenados con su edad
          log: `sort() ordenó las personas por edad ascendente: [${arr.map(o => `${o.nombre}: ${o.edad} años`).join(" | ")}]`
        };
      }
    }
  ]
};
