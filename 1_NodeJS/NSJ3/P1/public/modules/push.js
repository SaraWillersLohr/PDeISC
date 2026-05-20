
// Módulo para el método push()
// push() sirve para agregar elementos AL FINAL de un array.



export const pushMethod = {
  name: "push()",
  description: "Agrega uno o más elementos al final de un array y devuelve la nueva longitud.",
  mutates: true,
  syntax: "array.push(elemento1, elemento2, ..., elementoN)",
  
  exercises: [
    {
      id: "push-1",
      title: "1. Agregando frutas al carrito vacío",
      description: "Crea un array vacío y le agrega tres frutas usando push().",
      getInitialArray: () => [],
      // Este es el flujo principal del ejercicio
      run: (array) => {
        // Hacemos una copia para trabajar limpios sin romper el estado del DOM
        const arr = [...array];
        
        // Acá están las tres frutas que voy a meter
        const frutas = ["Frutilla", "Arándano", "Mango"];
        
        //Agrega las tres frutas al final del array vacío
        const nuevaLongitud = arr.push(...frutas);
        
        // Devolvemos todo masticado para que ui.js lo dibuje hermoso
        return {
          initial: [...array],
          code: `const carrito = [];\ncarrito.push("Frutilla", "Arándano", "Mango");`,
          result: arr,
          log: `push() agregó: "Frutilla", "Arándano", "Mango" (Nueva longitud: ${nuevaLongitud})`
        };
      }
    },
    {
      id: "push-2",
      title: "2. Sumando amigos a la lista",
      description: "Agrega los nombres de 3 nuevos amigos a un array existente llamado 'amigos'.",
      getInitialArray: () => ["Carlos", "Sofía", "Martín"],
      run: (array, inputVal) => {
        const arr = [...array];
        
        // Si el usuario escribió amigos en el input, los usamos, sino ponemos los default
        let amigosNuevos = ["Lucía", "Esteban", "Valeria"];
        if (inputVal && inputVal.trim() !== "") {
          amigosNuevos = inputVal.split(",").map(n => n.trim()).filter(n => n !== "");
        }
        
        // Agregamos a los amigos al final de la lista existente
        const nuevaLongitud = arr.push(...amigosNuevos);
        
        return {
          initial: [...array],
          code: `const amigos = ["Carlos", "Sofía", "Martín"];\namigos.push(${amigosNuevos.map(n => `"${n}"`).join(", ")});`,
          result: arr,
          log: `push() agregó a amigos: [${amigosNuevos.join(", ")}] (Total: ${nuevaLongitud})`
        };
      }
    },
    {
      id: "push-3",
      title: "3. Agregar solo si es mayor que el último",
      description: "Dado un array de números [10, 25, 42], agrega un nuevo número ingresado SOLO si es mayor que el último número (42).",
      getInitialArray: () => [10, 25, 42],
      run: (array, inputVal) => {
        const arr = [...array];
        
        // Convertimos el input a número. Si no ingresó nada, usamos 50 como default académico
        let numero = 50;
        if (inputVal !== undefined && inputVal !== null && inputVal.trim() !== "") {
          numero = Number(inputVal);
        }
        
        // Agarramos el último número del array usando su índice
        const ultimo = arr[arr.length - 1];
        
        let seAgrego = false;
        let mensajeLog = "";
        
        // Esta es la condición que pide la consigna
        if (numero > ultimo) {
          arr.push(numero);
          seAgrego = true;
          mensajeLog = `push() agregó el número ${numero} porque es mayor que el último (${ultimo}).`;
        } else {
          mensajeLog = `No se agregó ${numero} porque NO es mayor que el último (${ultimo}).`;
        }
        
        return {
          initial: [...array],
          code: `const numeros = [10, 25, 42];\nconst ultimo = numeros[numeros.length - 1];\nif (${numero} > ultimo) {\n  numeros.push(${numero});\n}`,
          result: arr,
          log: mensajeLog,
          success: seAgrego
        };
      }
    }
  ]
};
