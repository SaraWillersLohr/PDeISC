// ==========================================
// Módulo para el método filter()
// Creado por mí (Sara) para las clases.
// filter() crea un NUEVO array con todos los elementos que CUMPLAN 
// la condición implementada por la función callback.
// ¡Inmutable! El array de origen no se toca para nada.
// ==========================================

export const filterMethod = {
  name: "filter()",
  description: "Crea un nuevo array con todos los elementos que cumplan la condición implementada por la función dada.",
  mutates: false,
  syntax: "const filtrados = array.filter(elemento => { return condicion; })",
  
  exercises: [
    {
      id: "filter-1",
      title: "1. Números mayores a 10",
      description: "Filtra los números mayores a 10 de un array de enteros.",
      getInitialArray: () => [5, 12, 8, 130, 44, 3],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de filter! Solo quedan los que devuelven true en la condición (> 10)
        const mayoresDiez = arr.filter((num) => num > 10);
        
        return {
          initial: [...array],
          code: `const numeros = [5, 12, 8, 130, 44, 3];\nconst filtrados = numeros.filter(num => num > 10);`,
          result: mayoresDiez,
          log: `filter() extrajo números > 10: [${mayoresDiez.join(", ")}] (Antes: [${arr.join(", ")}])`
        };
      }
    },
    {
      id: "filter-2",
      title: "2. Palabras largas (> 5 letras)",
      description: "Dado un array de palabras, filtra únicamente las que tengan más de 5 letras.",
      getInitialArray: () => ["sol", "estrella", "luna", "galaxia", "universo", "mar"],
      run: (array) => {
        const arr = [...array];
        
        // Filtramos por longitud de caracteres (.length)
        const palabrasLargas = arr.filter((palabra) => palabra.length > 5);
        
        return {
          initial: [...array],
          code: `const palabras = ["sol", "estrella", "luna", "galaxia", "universo", "mar"];\nconst largas = palabras.filter(p => p.length > 5);`,
          result: palabrasLargas,
          log: `filter() dejó las palabras largas: [${palabrasLargas.join(", ")}]`
        };
      }
    },
    {
      id: "filter-3",
      title: "3. Filtrar usuarios activos",
      description: "Filtra los usuarios activos de un array de objetos con formato {nombre, activo}.",
      getInitialArray: () => [
        { nombre: "Clara", activo: true },
        { nombre: "Javier", activo: false },
        { nombre: "Mateo", activo: true },
        { nombre: "Camila", activo: false }
      ],
      run: (array) => {
        const arr = [...array];
        
        // Filtramos las personas cuyo atributo 'activo' sea true
        const activos = arr.filter((usuario) => usuario.activo === true);
        
        return {
          initial: arr.map(u => `{${u.nombre}, ${u.activo ? 'activo' : 'inactivo'}}`),
          code: `const usuarios = [\n  { nombre: "Clara", activo: true },\n  { nombre: "Javier", activo: false }\n];\nconst activos = usuarios.filter(u => u.activo);`,
          result: activos.map(u => u.nombre), // Renderizamos en DOM solo los nombres activos por comodidad visual
          log: `filter() devolvió los usuarios activos: [${activos.map(u => u.nombre).join(", ")}]`
        };
      }
    }
  ]
};
