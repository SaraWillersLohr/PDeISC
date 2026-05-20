
// Módulo para el método splice()
// splice() es súper potente: puede eliminar, insertar o reemplazar 
// elementos en CUALQUIER posición de un array.
// ¡Atención! SÍ modifica el array original y devuelve un array con los eliminados.


export const spliceMethod = {
  name: "splice()",
  description: "Cambia el contenido de un array eliminando, reemplazando o agregando elementos.",
  mutates: true,
  syntax: "array.splice(inicio, cantidadEliminar, item1, ..., itemN)",
  
  exercises: [
    {
      id: "splice-1",
      title: "1. Eliminar letras desde posición 1",
      description: "Elimina dos elementos a partir de la posición 1 (índice 1) de un array de letras.",
      getInitialArray: () => ["A", "B", "C", "D", "E"],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de splice! Desde el índice 1, borra 2 elementos ("B" y "C")
        const eliminados = arr.splice(1, 2);
        
        return {
          initial: [...array],
          code: `const letras = ["A", "B", "C", "D", "E"];\nconst eliminados = letras.splice(1, 2);`,
          result: arr,
          log: `splice(1, 2) eliminó los elementos: [${eliminados.join(", ")}]`
        };
      }
    },
    {
      id: "splice-2",
      title: "2. Insertar sin borrar a nadie",
      description: "Inserta un nuevo nombre en la segunda posición (índice 1) sin borrar ningún elemento existente.",
      getInitialArray: () => ["Carlos", "Marta", "Sofía"],
      run: (array, inputVal) => {
        const arr = [...array];
        
        let nuevoNombre = "Leticia";
        if (inputVal && inputVal.trim() !== "") {
          nuevoNombre = inputVal.trim();
        }
        
        // En el índice 1, eliminamos 0 elementos e insertamos nuevoNombre
        arr.splice(1, 0, nuevoNombre);
        
        return {
          initial: [...array],
          code: `const nombres = ["Carlos", "Marta", "Sofía"];\nnombres.splice(1, 0, "${nuevoNombre}");`,
          result: arr,
          log: `splice(1, 0, "${nuevoNombre}") insertó "${nuevoNombre}" en la posición 1 sin borrar a nadie.`
        };
      }
    },
    {
      id: "splice-3",
      title: "3. Reemplazar elementos",
      description: "Reemplaza dos elementos por otros nuevos desde una posición determinada.",
      getInitialArray: () => ["Taza", "Plato", "Vaso", "Tenedor"],
      run: (array, inputVal) => {
        const arr = [...array];
        
        // Vamos a reemplazar desde el índice 1 (donde está "Plato"), quitamos 2 items y metemos nuevos
        let nuevosItems = ["Cuchara", "Cuchillo"];
        if (inputVal && inputVal.trim() !== "") {
          nuevosItems = inputVal.split(",").map(i => i.trim()).filter(i => i !== "");
        }
        
        // Hacemos el reemplazo: inicia en index 1, borra 2, agrega los nuevos
        const eliminados = arr.splice(1, 2, ...nuevosItems);
        
        return {
          initial: [...array],
          code: `const vajilla = ["Taza", "Plato", "Vaso", "Tenedor"];\nconst eliminados = vajilla.splice(1, 2, ${nuevosItems.map(i => `"${i}"`).join(", ")});`,
          result: arr,
          log: `splice(1, 2, ...) eliminó [${eliminados.join(", ")}] y agregó [${nuevosItems.join(", ")}] en su lugar.`
        };
      }
    }
  ]
};
