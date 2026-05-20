// ==========================================
// Módulo para el método pop()
// Creado por mí (Sara) para repasar.
// pop() elimina el ÚLTIMO elemento de un array y nos lo devuelve.
// ¡Importante! Este método SÍ muta/modifica el array original.
// Si el array está vacío, devuelve 'undefined'.
// ==========================================

export const popMethod = {
  name: "pop()",
  description: "Elimina el último elemento de un array y lo devuelve. Muta el array original.",
  mutates: true,
  syntax: "array.pop()",
  
  exercises: [
    {
      id: "pop-1",
      title: "1. Chau último animal",
      description: "Elimina el último elemento de un array de animales.",
      getInitialArray: () => ["Perro", "Gato", "Loro", "Tigre"],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de pop! Saca al tigre (el último) y lo guarda en la variable
        const animalEliminado = arr.pop();
        
        return {
          initial: [...array],
          code: `const animales = ["Perro", "Gato", "Loro", "Tigre"];\nconst eliminado = animales.pop();`,
          result: arr,
          log: `pop() eliminó a "${animalEliminado}" del final del array.`
        };
      }
    },
    {
      id: "pop-2",
      title: "2. Quitando el último producto comprado",
      description: "Quita el último producto de una lista de compras y muestra en pantalla cuál fue eliminado.",
      getInitialArray: () => ["Leche", "Galletitas", "Fideos", "Detergente"],
      run: (array) => {
        const arr = [...array];
        
        // Sacamos el último elemento
        const productoEliminado = arr.pop();
        
        return {
          initial: [...array],
          code: `const compras = ["Leche", "Galletitas", "Fideos", "Detergente"];\nconst producto = compras.pop();`,
          result: arr,
          log: `pop() eliminó "${productoEliminado}" (Producto quitado del carro).`
        };
      }
    },
    {
      id: "pop-3",
      title: "3. Vaciar array con bucle while",
      description: "Usa un bucle while para vaciar completamente un array con pop() de forma consecutiva.",
      getInitialArray: () => [10, 20, 30, 40, 50],
      run: (array) => {
        const arr = [...array];
        const eliminados = [];
        
        // Hacemos un bucle while que se ejecute mientras el array no esté vacío
        // (es decir, mientras su longitud sea mayor a 0)
        while (arr.length > 0) {
          const item = arr.pop();
          eliminados.push(item);
        }
        
        return {
          initial: [...array],
          code: `const numeros = [10, 20, 30, 40, 50];\nwhile (numeros.length > 0) {\n  numeros.pop();\n}`,
          result: arr,
          log: `pop() vació el array entero en bucle. Elementos quitados en orden inverso: [${eliminados.join(", ")}]`
        };
      }
    }
  ]
};
