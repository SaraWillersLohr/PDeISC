// ==========================================
// Módulo para el método reduce()
// Creado por mí (Sara) para las clases.
// reduce() ejecuta una función reductora sobre cada elemento, 
// devolviendo un ÚNICO valor acumulado final.
// ¡Es inmutable! El array original queda perfectamente intacto.
// ==========================================

export const reduceMethod = {
  name: "reduce()",
  description: "Ejecuta una función reductora sobre cada elemento de un array, devolviendo como resultado un único valor.",
  mutates: false,
  syntax: "const resultado = array.reduce((acumulador, actual) => { return acumulador + actual; }, valorInicial)",
  
  exercises: [
    {
      id: "reduce-1",
      title: "1. Sumatoria total de números",
      description: "Suma todos los elementos de un array de números para obtener el total absoluto.",
      getInitialArray: () => [10, 20, 30, 40, 50],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de reduce! Suma cada número al acumulador (inicia en 0)
        const sumaTotal = arr.reduce((acumulador, actual) => acumulador + actual, 0);
        
        return {
          initial: [...array],
          code: `const numeros = [10, 20, 30, 40, 50];\nconst total = numeros.reduce((acum, act) => acum + act, 0);`,
          result: sumaTotal, // Devolvemos el número resultante
          log: `reduce() acumuló la suma de [${arr.join(", ")}] dando como resultado: ${sumaTotal}`
        };
      }
    },
    {
      id: "reduce-2",
      title: "2. Productoria (multiplicar enteros)",
      description: "Multiplica todos los elementos de un array de enteros para obtener su producto final.",
      getInitialArray: () => [2, 3, 4, 5],
      run: (array) => {
        const arr = [...array];
        
        // Multiplicamos todos los números (el acumulador inicia en 1 para no anular el producto!)
        const productoTotal = arr.reduce((acumulador, actual) => acumulador * actual, 1);
        
        return {
          initial: [...array],
          code: `const enteros = [2, 3, 4, 5];\nconst producto = enteros.reduce((acum, act) => acum * act, 1);`,
          result: productoTotal,
          log: `reduce() multiplicó en cadena [${arr.join(" x ")}] dando como resultado: ${productoTotal}`
        };
      }
    },
    {
      id: "reduce-3",
      title: "3. Total de compras de objetos {precio}",
      description: "Dado un array de objetos compra con el atributo 'precio', calcula la suma total acumulada.",
      getInitialArray: () => [
        { producto: "Camiseta", precio: 1200 },
        { producto: "Zapatillas", precio: 4500 },
        { producto: "Gorra", precio: 800 }
      ],
      run: (array) => {
        const arr = [...array];
        
        // Sumamos el atributo .precio de cada objeto al acumulador
        const totalCarrito = arr.reduce((acumulador, actual) => acumulador + actual.precio, 0);
        
        return {
          initial: arr.map(item => `{${item.producto}: $${item.precio}}`),
          code: `const carrito = [\n  { producto: "Camiseta", precio: 1200 },\n  { producto: "Zapatillas", precio: 4500 }\n];\nconst total = carrito.reduce((acum, act) => acum + act.precio, 0);`,
          result: `$${totalCarrito}`,
          log: `reduce() totalizó la compra de los artículos. Monto total: $${totalCarrito}`
        };
      }
    }
  ]
};
