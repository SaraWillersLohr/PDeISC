// ==========================================
// Módulo para el método indexOf()
// Creado por mí (Sara) para las clases.
// indexOf() busca un elemento en el array y devuelve el PRIMER índice
// donde lo encuentra. Si NO lo encuentra, devuelve -1.
// ¡Súper inmutable! NO toca el array original.
// ==========================================

export const indexOfMethod = {
  name: "indexOf()",
  description: "Devuelve el primer índice en el que se puede encontrar un elemento dado en el array, o -1 si el elemento no está presente.",
  mutates: false,
  syntax: "array.indexOf(elementoBuscar, desdeIndice)",
  
  exercises: [
    {
      id: "indexof-1",
      title: "1. ¿Dónde está el perro?",
      description: "Encuentra la posición de la palabra 'perro' en un array de mascotas.",
      getInitialArray: () => ["gato", "loro", "perro", "pez"],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de indexOf! Busca la palabra exacta
        const indice = arr.indexOf("perro");
        
        return {
          initial: [...array],
          code: `const mascotas = ["gato", "loro", "perro", "pez"];\nconst pos = mascotas.indexOf("perro");`,
          result: indice, // Renderizamos el número resultante
          log: `indexOf("perro") devolvió ${indice}. ¡El perro está en el índice ${indice}!`
        };
      }
    },
    {
      id: "indexof-2",
      title: "2. Verificando la posición del 50",
      description: "Verifica si el número 50 está presente en un array de múltiplos y en qué posición.",
      getInitialArray: () => [10, 30, 50, 70, 90],
      run: (array) => {
        const arr = [...array];
        
        const indice = arr.indexOf(50);
        
        return {
          initial: [...array],
          code: `const numeros = [10, 30, 50, 70, 90];\nconst pos = numeros.indexOf(50);`,
          result: indice,
          log: `indexOf(50) devolvió ${indice}. (El 50 está en la posición/índice ${indice} del array).`
        };
      }
    },
    {
      id: "indexof-3",
      title: "3. Buscando ciudades en el mapa",
      description: "Dado un array de ciudades, muestra el índice de 'Madrid' (u otra ciudad que escribas) o un mensaje explicativo si no está.",
      getInitialArray: () => ["Buenos Aires", "Madrid", "París", "Tokio"],
      run: (array, inputVal) => {
        const arr = [...array];
        
        let ciudadBuscada = "Madrid";
        if (inputVal && inputVal.trim() !== "") {
          ciudadBuscada = inputVal.trim();
        }
        
        // Buscamos el índice
        const indice = arr.indexOf(ciudadBuscada);
        
        let mensaje = "";
        if (indice !== -1) {
          mensaje = `indexOf("${ciudadBuscada}") devolvió ${indice}. ¡La ciudad está registrada en el índice ${indice}!`;
        } else {
          mensaje = `indexOf("${ciudadBuscada}") devolvió -1. ⚠️ La ciudad "${ciudadBuscada}" NO está en el array.`;
        }
        
        return {
          initial: [...array],
          code: `const ciudades = ["Buenos Aires", "Madrid", "París", "Tokio"];\nconst pos = ciudades.indexOf("${ciudadBuscada}");`,
          result: indice,
          log: mensaje
        };
      }
    }
  ]
};
