// Yo renderizo la lista de invitados sin recargar la página
// Esto hace que la aplicación sea más rápida y fluida para el usuario
export const dibujarInvitados = (lista, contenedor, onBorrar, consola) => {
  // Yo limpio el contenedor antes de volver a dibujar
  contenedor.innerHTML = "";
  // Yo actualizo el contador de invitados en la interfaz
  const contador = document.getElementById("guestCount");
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (contador) contador.textContent = String(lista.length);

  // Si no hay invitados, muestro un mensaje de estado vacío
  if (!lista.length) {
    const vacio = document.createElement("div");
    vacio.className = "col-12 empty-state glass-panel";
    vacio.innerHTML = "<p>No hay invitados en el array todavía.</p>";
    contenedor.appendChild(vacio);
    return;
  }

  // Yo recorro cada invitado y creo una tarjeta visual para cada uno
  lista.forEach((inv, i) => {
    const col = document.createElement("div");
    col.className = "col-12 col-lg-6";
    const card = document.createElement("article");
    card.className = "result-card glass-panel h-100";
    card.innerHTML = `
      <header class="result-card__head">
        <h3>${inv.nombre} ${inv.apellido}</h3>
        <span class="badge-pill">${inv.metodoGuardado}</span>
      </header>
      <ul class="result-card__meta">
        <li><span>Email</span><strong>${inv.email}</strong></li>
        <li><span>Teléfono</span><strong>${inv.telefono}</strong></li>
        <li><span>Edad</span><strong>${inv.edad}</strong></li>
        <li><span>Mesa</span><strong>${inv.mesa}</strong></li>
        <li><span>Menú</span><strong>${inv.menu}</strong></li>
        <li><span>Entrada</span><strong>${inv.tipoEntrada}</strong></li>
        <li><span>Acompañantes</span><strong>${inv.acompanantes}</strong></li>
        <li><span>Notas</span><strong class="text-wrap">${inv.notas || "—"}</strong></li>
      </ul>
      <button type="button" class="btn btn-outline-danger btn-sm w-100 btn-borrar">Eliminar del array</button>
    `;
    // Yo agrego el evento click al botón de eliminar para poder borrar el invitado
    card.querySelector(".btn-borrar").addEventListener("click", () => {
      onBorrar(i);
      consola?.log(`Registro eliminado del array (índice ${i})`);
    });
    col.appendChild(card);
    contenedor.appendChild(col);
  });

  // Yo registro en la consola cuántos invitados hay actualmente
  consola?.log(`Cards renderizadas: ${lista.length} invitado(s)`);
};