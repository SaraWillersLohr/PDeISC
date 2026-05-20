// ==========================================
// Módulo para el método unshift()
// Creado por mí (Sara) para repasar.
// unshift() agrega uno o más elementos AL PRINCIPIO de un array.
// ¡Atención! También desplaza los índices existentes hacia arriba.
// SÍ modifica el array original (es mutable) y devuelve la nueva longitud.
// ==========================================

export const unshiftMethod = {
  name: "unshift()",
  description: "Agrega uno o más elementos al inicio de un array y devuelve la nueva longitud.",
  mutates: true,
  syntax: "array.unshift(elemento1, elemento2, ..., elementoN)",
  
  exercises: [
    {
      id: "unshift-1",
      title: "1. Agregando colores al inicio",
      description: "Agrega tres colores al principio de un array vacío usando unshift().",
      getInitialArray: () => [],
      run: (array) => {
        const arr = [...array];
        const colores = ["Rojo", "Verde", "Azul"];
        
        // ¡La magia de unshift! Los mete al inicio del array vacío
        const nuevaLongitud = arr.unshift(...colores);
        
        return {
          initial: [...array],
          code: `const colores = [];\ncolores.unshift("Rojo", "Verde", "Azul");`,
          result: arr,
          log: `unshift() insertó al inicio: [${colores.join(", ")}] (Nueva longitud: ${nuevaLongitud})`
        };
      }
    },
    {
      id: "unshift-2",
      title: "2. Tarea urgente prioritaria",
      description: "Dado un array de tareas, agrega una nueva tarea urgente al principio.",
      getInitialArray: () => ["Bañar al perro", "Hacer la cama", "Estudiar Node.js"],
      run: (array, inputVal) => {
        const arr = [...array];
        
        // Tarea por defecto o la que ingrese el usuario
        let tareaUrgente = "⚠️ COMPRAR COMIDA (URGENTE)";
        if (inputVal && inputVal.trim() !== "") {
          tareaUrgente = "⚠️ " + inputVal.trim();
        }
        
        // Metemos la tarea al principio para que quede primera en la lista de prioridades
        const nuevaLongitud = arr.unshift(tareaUrgente);
        
        return {
          initial: [...array],
          code: `const tareas = ["Bañar al perro", "Hacer la cama", "Estudiar Node.js"];\ntareas.unshift("${tareaUrgente}");`,
          result: arr,
          log: `unshift() antepuso la tarea: "${tareaUrgente}" (Total tareas: ${nuevaLongitud})`
        };
      }
    },
    {
      id: "unshift-3",
      title: "3. Nuevo usuario en el chat",
      description: "Inserta el nombre de un usuario al principio de un array de usuarios conectados.",
      getInitialArray: () => ["lucia_cyber", "santi_99", "gisela_dev"],
      run: (array, inputVal) => {
        const arr = [...array];
        
        let nuevoUsuario = "admin_antigravity";
        if (inputVal && inputVal.trim() !== "") {
          nuevoUsuario = inputVal.trim();
        }
        
        // Ponemos al nuevo usuario que se acaba de conectar al inicio de la lista visual
        const nuevaLongitud = arr.unshift(nuevoUsuario);
        
        return {
          initial: [...array],
          code: `const conectados = ["lucia_cyber", "santi_99", "gisela_dev"];\nconectados.unshift("${nuevoUsuario}");`,
          result: arr,
          log: `unshift() agregó al inicio al usuario: "${nuevoUsuario}" (Conectados: ${nuevaLongitud})`
        };
      }
    }
  ]
};
