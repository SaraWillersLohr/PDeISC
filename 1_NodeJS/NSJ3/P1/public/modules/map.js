// ==========================================
// Módulo para el método map()
// Creado por mí (Sara) para las entregas.
// map() crea un NUEVO array con los resultados de la función callback 
// que le aplicamos a cada uno de los elementos.
// ¡Es inmutable! El array original queda perfectamente intacto.
// ==========================================

export const mapMethod = {
  name: "map()",
  description: "Crea un nuevo array con los resultados de la llamada a la función indicada aplicados a cada uno de sus elementos.",
  mutates: false,
  syntax: "const nuevoArray = array.map((elemento, indice) => { return elementoTransformado; })",
  
  exercises: [
    {
      id: "map-1",
      title: "1. Números multiplicados por 3",
      description: "Crea un nuevo array donde cada número del array original esté multiplicado por 3.",
      getInitialArray: () => [1, 2, 3, 4, 5],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de map! Multiplicamos cada elemento por 3
        const triplicados = arr.map((num) => num * 3);
        
        return {
          initial: [...array],
          code: `const numeros = [1, 2, 3, 4, 5];\nconst triplicados = numeros.map(num => num * 3);`,
          result: triplicados,
          log: `map() triplicó el array. Resultado: [${triplicados.join(", ")}]`
        };
      }
    },
    {
      id: "map-2",
      title: "2. Nombres a MAYÚSCULAS",
      description: "Convierte un array de nombres en minúscula a mayúsculas usando map().",
      getInitialArray: () => ["sofia", "marcos", "valentina"],
      run: (array) => {
        const arr = [...array];
        
        // Convertimos a mayúsculas cada string
        const mayusculas = arr.map((nombre) => nombre.toUpperCase());
        
        return {
          initial: [...array],
          code: `const nombres = ["sofia", "marcos", "valentina"];\nconst mayus = nombres.map(n => n.toUpperCase());`,
          result: mayusculas,
          log: `map() convirtió nombres a mayúsculas: [${mayusculas.join(", ")}]`
        };
      }
    },
    {
      id: "map-3",
      title: "3. Calculando el IVA (21%)",
      description: "Toma un array de precios netos y agrégale el 21% de IVA a cada uno, generando un array de precios finales.",
      getInitialArray: () => [100, 250, 500],
      run: (array) => {
        const arr = [...array];
        
        // Calculamos el precio final con IVA
        const preciosFinales = arr.map((precio) => {
          const precioConIva = precio * 1.21;
          return Number(precioConIva.toFixed(2)); // Redondeamos a dos decimales prolijos
        });
        
        return {
          initial: [...array],
          code: `const precios = [100, 250, 500];\nconst conIVA = precios.map(p => Number((p * 1.21).toFixed(2)));`,
          result: preciosFinales,
          log: `map() calculó precios con IVA: [${preciosFinales.join(", ")}] (Originales sin IVA: [${arr.join(", ")}])`
        };
      }
    }
  ]
};
