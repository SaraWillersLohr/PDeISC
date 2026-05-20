// ==========================================
// Módulo para el método includes()
// Creado por mí (Sara) para las clases.
// includes() determina si un array contiene cierto elemento.
// ¡Súper útil! Devuelve un booleano (true o false) directamente.
// Es inmutable, no hace ningún cambio en el array original.
// ==========================================

export const includesMethod = {
  name: "includes()",
  description: "Determina si un array incluye un determinado elemento, devolviendo true o false según corresponda.",
  mutates: false,
  syntax: "array.includes(elementoBuscar, desdeIndice)",
  
  exercises: [
    {
      id: "includes-1",
      title: "1. ¿Contiene rol de admin?",
      description: "Comprueba si un array de roles contiene la palabra 'admin'.",
      getInitialArray: () => ["user", "moderator", "admin"],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de includes! Devuelve true si encuentra "admin"
        const tieneAdmin = arr.includes("admin");
        
        return {
          initial: [...array],
          code: `const roles = ["user", "moderator", "admin"];\nconst esAdmin = roles.includes("admin");`,
          result: tieneAdmin, // Devolvemos el booleano
          log: `includes("admin") devolvió: ${tieneAdmin}. ¡Acceso administrativo concedido!`
        };
      }
    },
    {
      id: "includes-2",
      title: "2. Verificando el color verde",
      description: "Dado un array de colores primarios/secundarios, indica si existe el color 'verde'.",
      getInitialArray: () => ["rojo", "azul", "amarillo", "verde"],
      run: (array) => {
        const arr = [...array];
        
        const tieneVerde = arr.includes("verde");
        
        return {
          initial: [...array],
          code: `const colores = ["rojo", "azul", "amarillo", "verde"];\nconst tieneVerde = colores.includes("verde");`,
          result: tieneVerde,
          log: `includes("verde") devolvió: ${tieneVerde}. ¡El color verde está en la paleta!`
        };
      }
    },
    {
      id: "includes-3",
      title: "3. Evitar duplicados antes de sumar",
      description: "Verifica si un número ingresado ya está presente en el array antes de decidir si agregarlo.",
      getInitialArray: () => [5, 10, 15, 20],
      run: (array, inputVal) => {
        const arr = [...array];
        
        let numero = 15; // default académico
        if (inputVal !== undefined && inputVal !== null && inputVal.trim() !== "") {
          numero = Number(inputVal);
        }
        
        // Verificamos si ya existe el número para evitar repetirlo
        const existe = arr.includes(numero);
        let mensaje = "";
        
        if (existe) {
          mensaje = `includes(${numero}) devolvió true. ⚠️ El número ya existe en el array. ¡No lo agregamos!`;
        } else {
          arr.push(numero); // Lo agregamos solo porque no existía
          mensaje = `includes(${numero}) devolvió false. ¡Excelente! El número no existía, así que lo agregamos con push.`;
        }
        
        return {
          initial: [...array],
          code: `const numeros = [5, 10, 15, 20];\nconst existe = numeros.includes(${numero});\nif (!existe) {\n  numeros.push(${numero});\n}`,
          result: arr,
          log: mensaje
        };
      }
    }
  ]
};
