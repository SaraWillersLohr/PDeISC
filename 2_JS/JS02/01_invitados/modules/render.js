// Exporto estas funciones para usarlas en otros archivos
export const renderGuests = (guests, container) => {
// Dibujo los resultados en la pantalla
    container.innerHTML = "";
    
    if (guests.length === 0) {
// Dibujo los resultados en la pantalla
        container.innerHTML = "<p style='color: #666;'>No hay invitados registrados aún.</p>";
        return;
    }

// Voy pasando por cada item de la lista
    guests.forEach((guest, index) => {
        const card = document.createElement("div");
        card.className = "card";
// Limpio y dibujo el contenido nuevo en el HTML
        card.innerHTML = `
            <h3>${guest.nombre} ${guest.apellido}</h3>
            <p><strong>Edad:</strong> ${guest.edad} años</p>
            <p><strong>Entrada:</strong> ${guest.tipoEntrada}</p>
            <p><strong>Acompañantes:</strong> ${guest.acompanantes}</p>
            <button class="btn-delete" data-index="${index}">ELIMINAR ACCESO</button>
        `;
        container.appendChild(card);
    });
};
