export const dibujarInvitados = (lista, contenedor, onBorrar, consola) => {
  contenedor.innerHTML = "";
  const contador = document.getElementById("guestCount");
  if (contador) contador.textContent = String(lista.length);

  if (!lista.length) {
    const vacio = document.createElement("div");
    vacio.className = "col-12 empty-state glass-panel";
    vacio.innerHTML = "<p>No hay invitados en el array todavía.</p>";
    contenedor.appendChild(vacio);
    return;
  }

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
    card.querySelector(".btn-borrar").addEventListener("click", () => {
      onBorrar(i);
      consola?.log(`Registro eliminado del array (índice ${i})`);
    });
    col.appendChild(card);
    contenedor.appendChild(col);
  });

  consola?.log(`Cards renderizadas: ${lista.length} invitado(s)`);
};
