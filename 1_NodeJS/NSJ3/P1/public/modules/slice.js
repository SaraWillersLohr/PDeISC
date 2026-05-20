// ==========================================
// Módulo para el método slice()
// Creado por mí (Sara) para las clases.
// slice() sirve para "cortar" y copiar un pedazo de un array.
// ¡Súper importante! NO modifica el array original (es inmutable).
// Devuelve un nuevo array con la copia de los elementos recortados.
// ==========================================

export const sliceMethod = {
  name: "slice()",
  description: "Devuelve una copia de una parte del array dentro de un nuevo array, empezando por inicio hasta fin (no incluido). El array original no se modificará.",
  mutates: false,
  syntax: "array.slice(inicio, fin)",
  
  exercises: [
    {
      id: "slice-1",
      title: "1. Copiar los primeros 3 números",
      description: "Copia los primeros 3 elementos de un array de números [10, 20, 30, 40, 50, 60].",
      getInitialArray: () => [10, 20, 30, 40, 50, 60],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de slice! Cortamos desde el índice 0 hasta el 3 (no incluido, saca 0, 1 y 2)
        const copia = arr.slice(0, 3);
        
        return {
          initial: [...array],
          code: `const numeros = [10, 20, 30, 40, 50, 60];\nconst copia = numeros.slice(0, 3);`,
          result: copia,
          log: `slice(0, 3) copió los elementos del inicio: [${copia.join(", ")}]. (El array original sigue intacto!).`
        };
      }
    },
    {
      id: "slice-2",
      title: "2. Recorte parcial de películas",
      description: "Crea una copia parcial de un array de películas desde la posición 2 hasta la 4 (excluyendo la 4).",
      getInitialArray: () => ["Batman", "Spiderman", "Avatar", "Inception", "Titanic"],
      run: (array) => {
        const arr = [...array];
        
        // Cortamos desde el índice 2 ("Avatar") hasta el 4 ("Titanic" no entra, entra index 2 y 3)
        const recorte = arr.slice(2, 4);
        
        return {
          initial: [...array],
          code: `const pelis = ["Batman", "Spiderman", "Avatar", "Inception", "Titanic"];\nconst recorte = pelis.slice(2, 4);`,
          result: recorte,
          log: `slice(2, 4) extrajo las películas: [${recorte.join(", ")}]`
        };
      }
    },
    {
      id: "slice-3",
      title: "3. Obtener los últimos 3 elementos",
      description: "Crea un array nuevo con los últimos 3 elementos de un array de letras sin modificar el original.",
      getInitialArray: () => ["A", "B", "C", "D", "E", "F"],
      run: (array) => {
        const arr = [...array];
        
        // Usar índices negativos con slice es genial: -3 significa 'empezar a contar a 3 elementos del final'
        const ultimosTres = arr.slice(-3);
        
        return {
          initial: [...array],
          code: `const letras = ["A", "B", "C", "D", "E", "F"];\nconst ultimos = letras.slice(-3);`,
          result: ultimosTres,
          log: `slice(-3) extrajo los últimos 3 elementos: [${ultimosTres.join(", ")}]`
        };
      }
    }
  ]
};
