// ==========================================
// Módulo para el método shift()
// Creado por mí (Sara) para estudiar.
// shift() elimina el PRIMER elemento de un array (índice 0).
// ¡Ojo! Desplaza todos los índices siguientes un lugar hacia atrás.
// SÍ modifica el array original (es mutable) y nos devuelve el elemento removido.
// ==========================================

export const shiftMethod = {
  name: "shift()",
  description: "Elimina el primer elemento de un array y lo devuelve, desplazando los demás índices.",
  mutates: true,
  syntax: "array.shift()",
  
  exercises: [
    {
      id: "shift-1",
      title: "1. Quitando el primer número",
      description: "Quita el primer número de un array de enteros.",
      getInitialArray: () => [99, 10, 20, 30, 40],
      run: (array) => {
        const arr = [...array];
        
        // ¡La magia de shift! Saca el primer elemento (99) y lo retorna
        const numeroEliminado = arr.shift();
        
        return {
          initial: [...array],
          code: `const numeros = [99, 10, 20, 30, 40];\nconst quitado = numeros.shift();`,
          result: arr,
          log: `shift() eliminó el primer número: ${numeroEliminado}`
        };
      }
    },
    {
      id: "shift-2",
      title: "2. Limpiando chat antiguo",
      description: "Elimina el primer mensaje de un array de mensajes de chat (el más viejo).",
      getInitialArray: () => [
        "Enzo: ¡Hola a todos!",
        "Mati: ¿A qué hora arrancamos?",
        "Sofía: En cinco estoy libre"
      ],
      run: (array) => {
        const arr = [...array];
        
        // Eliminamos el mensaje del principio de la cola del chat
        const mensajeEliminado = arr.shift();
        
        return {
          initial: [...array],
          code: `const mensajes = [\n  "Enzo: ¡Hola!",\n  "Mati: ¿Hora?",\n  "Sofía: En cinco..."\n];\nconst viejo = mensajes.shift();`,
          result: arr,
          log: `shift() removió el chat antiguo: "${mensajeEliminado}"`
        };
      }
    },
    {
      id: "shift-3",
      title: "3. Cola de atención al cliente (FIFO)",
      description: "Simula una cola de atención al cliente (primero en llegar, primero en ser atendido).",
      getInitialArray: () => ["Cliente Juan", "Cliente Belén", "Cliente Tomás"],
      run: (array) => {
        const arr = [...array];
        
        // Si hay clientes, atendemos al primero
        let mensaje = "";
        // Si if (arr.length > 0), entonces se ejecuta este bloque.
        if (arr.length > 0) {
          const atendido = arr.shift();
          mensaje = `👩‍💻 Cola de atención: se atendió a "${atendido}". Siguientes en espera: [${arr.join(", ")}]`;
        } else {
          mensaje = "⚠️ La cola de atención está vacía. No quedan clientes por atender.";
        }
        
        return {
          initial: [...array],
          code: `const cola = ["Cliente Juan", "Cliente Belén", "Cliente Tomás"];\nif (cola.length > 0) {\n  const atendido = cola.shift();\n}`,
          result: arr,
          log: mensaje
        };
      }
    }
  ]
};
