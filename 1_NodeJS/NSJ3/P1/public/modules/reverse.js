// ==========================================
// Módulo para el método reverse()
// Creado por mí (Sara) para repasar.
// reverse() invierte el orden de los elementos del array.
// ¡Importante! SÍ modifica el array original (es mutable).
// El primer elemento pasa a ser el último y el último pasa a ser el primero.
// ==========================================

export const reverseMethod = {
  name: "reverse()",
  description: "Invierte el orden de los elementos de un array in situ. El primer elemento pasa a ser el último y el último pasa a ser el primero.",
  mutates: true,
  syntax: "array.reverse()",
  
  exercises: [
    {
      id: "reverse-1",
      title: "1. Letras al revés",
      description: "Invierte un array de letras ['A', 'B', 'C', 'D'] para obtener ['D', 'C', 'B', 'A'].",
      getInitialArray: () => ["A", "B", "C", "D"],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de reverse! Invierte en el lugar
        arr.reverse();
        
        return {
          initial: [...array],
          code: `const letras = ["A", "B", "C", "D"];\nletras.reverse();`,
          result: arr,
          log: `reverse() invirtió las letras. Resultado: [${arr.join(", ")}]`
        };
      }
    },
    {
      id: "reverse-2",
      title: "2. Serie numérica invertida",
      description: "Invierte el orden de un array de números secuenciales.",
      getInitialArray: () => [1, 2, 3, 4, 5],
      run: (array) => {
        const arr = [...array];
        
        arr.reverse();
        
        return {
          initial: [...array],
          code: `const numeros = [1, 2, 3, 4, 5];\nnumeros.reverse();`,
          result: arr,
          log: `reverse() invirtió la secuencia numérica: [${arr.join(", ")}]`
        };
      }
    },
    {
      id: "reverse-3",
      title: "3. Invertir una cadena de texto (String)",
      description: "Dado un string, conviértelo en array de letras, invierte su orden con reverse() y vuelve a unirlo para crear el texto invertido.",
      getInitialArray: () => ["neuquen"], // palindromo por defecto, o podemos usar una frase divertida
      run: (array, inputVal) => {
        // En este ejercicio el array inicial no importa tanto, usamos el string del input o default
        let texto = "antigravity";
        // Si if (inputVal && inputVal.trim() !== ""), entonces se ejecuta este bloque.
        if (inputVal && inputVal.trim() !== "") {
          texto = inputVal.trim();
        }
        
        // Pasos:
        // 1. split("") convierte el string a un array de caracteres
        // 2. reverse() invierte ese array
        // 3. join("") vuelve a juntar los caracteres en un string
        const letras = texto.split("");
        const letrasInvertidas = [...letras].reverse();
        const textoInvertido = letrasInvertidas.join("");
        
        return {
          initial: letras, // Pintamos el array de caracteres inicial
          code: `const texto = "${texto}";\nconst invertido = texto.split("").reverse().join("");`,
          result: letrasInvertidas, // Pintamos el array de caracteres final
          log: `reverse() se aplicó sobre el array de letras: "${texto}" se transformó en "${textoInvertido}".`
        };
      }
    }
  ]
};
