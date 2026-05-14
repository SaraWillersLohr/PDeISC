/**
 * Módulo para dibujar la lista de invitados en el HTML
 */
export const dibujarInvitados = (invitados, contenedor, callbackBorrar) => {
  contenedor.innerHTML = "";

  if (invitados.length === 0) {
    contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No hay invitados registrados aún.</p>
            </div>
        `;
    return;
  }

  // Recorremos la lista de invitados para crear las tarjetas
  invitados.forEach((invitado, indice) => {
    const columna = document.createElement("div");
    columna.className = "col-md-6 mb-4";

    columna.innerHTML = `
            <div class="card h-100 border-0 shadow-sm p-4">
                <h3 class="h4 mb-3">${invitado.nombre} ${invitado.apellido}</h3>
                <div class="mb-3">
                    <p class="mb-1"><strong>Edad:</strong> ${invitado.edad} años</p>
                    <p class="mb-1"><strong>Entrada:</strong> ${invitado.tipoEntrada}</p>
                    <p class="mb-0"><strong>Acompañantes:</strong> ${invitado.acompanantes}</p>
                </div>
                <button class="btn btn-outline-danger btn-sm mt-auto w-100 py-2 fw-bold btn-borrar" 
                        style="border-radius: 12px; border-width: 2px; letter-spacing: 0.05em;">
                    ELIMINAR ACCESO
                </button>
            </div>
        `;

    // Botón para eliminar (sin usar confirm por la regla de PROHIBIDO ALERTS)
    const botonBorrar = columna.querySelector(".btn-borrar");
    botonBorrar.addEventListener("click", () => {
        callbackBorrar(indice);
    });

    contenedor.appendChild(columna);
  });
};
