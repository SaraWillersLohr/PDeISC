// Exporto estas funciones para usarlas en otros archivos
export const renderGuests = (guests, container, deleteCallback) => {
  // Dibujo los resultados en la pantalla
  container.innerHTML = "";

  if (guests.length === 0) {
    // Dibujo los resultados en la pantalla
    container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No hay invitados registrados aún.</p>
            </div>
        `;
    return;
  }

  // Voy pasando por cada item de la lista
  guests.forEach((guest, index) => {
    const col = document.createElement("div");
    col.className = "col-md-6 mb-4";

    // Limpio y dibujo el contenido nuevo en el HTML
    col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm p-4">
                <h3 class="h4 mb-3">${guest.nombre} ${guest.apellido}</h3>
                <div class="mb-3">
                    <p class="mb-1"><strong>Edad:</strong> ${guest.edad} años</p>
                    <p class="mb-1"><strong>Entrada:</strong> ${guest.tipoEntrada}</p>
                    <p class="mb-0"><strong>Acompañantes:</strong> ${guest.acompanantes}</p>
                </div>
                <button class="btn btn-outline-danger btn-sm mt-auto w-100 py-2 fw-bold btn-delete" 
                        style="border-radius: 12px; border-width: 2px; letter-spacing: 0.05em;">
                    ELIMINAR ACCESO
                </button>
            </div>
        `;

    // Asigno el evento al botón de eliminar (Consigna 1)
    const deleteBtn = col.querySelector(".btn-delete");
    deleteBtn.addEventListener("click", () => {
      if (confirm("¿Estás seguro de que quieres eliminar este acceso?")) {
        deleteCallback(index);
      }
    });

    container.appendChild(col);
  });
};
