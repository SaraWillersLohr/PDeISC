// Comentarios claros: este archivo explica la lógica paso a paso.

/* 
  Este pequeño módulo ayuda a crear y editar etiquetas 
  del tipo <a> (enlaces) de forma fácil.
*/
export const nodeManager = {
  // Crea un link nuevo desde cero
  createAnchor(texto, direccion) {
    const a = document.createElement("a");
    a.textContent = texto;
    a.href = direccion;
    a.target = "_blank"; // Por defecto, que abra en pestaña nueva
    a.className = "dynamic-link";
    return a;
  },

  // Cambia alguna característica (atributo) de un elemento que ya existe
  modifyAttribute(elemento, atributo, valorNuevo) {
    const valorViejo = elemento.getAttribute(atributo);
    elemento.setAttribute(atributo, valorNuevo);

    // Devolvemos lo que cambió por si queremos anotarlo en algún lado
    return { atributo, oldValue: valorViejo, newValue: valorNuevo };
  },
};
