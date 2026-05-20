// ==========================================
// Módulo para el método forEach()
// Creado por mí (Sara) para las clases.
// forEach() ejecuta una función callback por cada elemento del array.
// ¡Importante! Devuelve 'undefined' (no retorna un nuevo array).
// Es inmutable por defecto (no altera el array original).
// ==========================================

export const forEachMethod = {
  name: "forEach()",
  description: "Ejecuta la función indicada una vez por cada elemento del array. Retorna undefined.",
  mutates: false,
  syntax: "array.forEach((elemento, indice, array) => { ... })",
  
  exercises: [
    {
      id: "foreach-1",
      title: "1. Saludos en lote",
      description: "Muestra todos los nombres de un array dándoles un saludo cordial en el DOM.",
      getInitialArray: () => ["Carlos", "María", "Lucas"],
      run: (array) => {
        const arr = [...array];
        const saludos = [];
        
        // ¡La magia de forEach! Recorremos cada elemento
        arr.forEach((nombre) => {
          saludos.push(`¡Hola, ${nombre}! 👋`);
        });
        
        return {
          initial: [...array],
          code: `const nombres = ["Carlos", "María", "Lucas"];\nnombres.forEach(nombre => {\n  saludos.push(\`¡Hola, \${nombre}! 👋\`);\n});`,
          result: saludos, // Mostramos los saludos resultantes en pantalla
          log: `forEach() procesó los saludos para: [${arr.join(", ")}]`
        };
      }
    },
    {
      id: "foreach-2",
      title: "2. Duplicar números en tiempo de ejecución",
      description: "Imprime el doble de cada número del array original usando forEach().",
      getInitialArray: () => [2, 4, 6],
      run: (array) => {
        const arr = [...array];
        const calculos = [];
        
        // Hacemos el doble de cada número con un callback de forEach
        arr.forEach((num) => {
          calculos.push(`${num} x 2 = ${num * 2}`);
        });
        
        return {
          initial: [...array],
          code: `const numeros = [2, 4, 6];\nnumeros.forEach(num => {\n  dobles.push(num * 2);\n});`,
          result: calculos,
          log: `forEach() calculó los dobles: [${calculos.join(" | ")}]`
        };
      }
    },
    {
      id: "foreach-3",
      title: "3. Recorrer objetos persona {nombre, edad}",
      description: "Dado un array de objetos {nombre, edad}, muestra cada nombre con su respectiva edad.",
      getInitialArray: () => [
        { nombre: "Sofía", edad: 22 },
        { nombre: "Andrés", edad: 35 },
        { nombre: "Julieta", edad: 19 }
      ],
      run: (array) => {
        const arr = [...array];
        const perfiles = [];
        
        // Iteramos los objetos y los transformamos a un formato legible
        arr.forEach((persona) => {
          perfiles.push(`${persona.nombre} tiene ${persona.edad} años`);
        });
        
        return {
          initial: arr.map(p => `{${p.nombre}, ${p.edad}}`),
          code: `const personas = [\n  { nombre: "Sofía", edad: 22 },\n  { nombre: "Andrés", edad: 35 }\n];\npersonas.forEach(p => {\n  perfiles.push(\`\${p.nombre} (\${p.edad} años)\`);\n});`,
          result: perfiles,
          log: `forEach() listó ${arr.length} perfiles: [${perfiles.join(" | ")}]`
        };
      }
    }
  ]
};
