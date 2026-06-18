// Yo renderizo la lista de invitados sin recargar la página
// Esto hace que la aplicación sea más rápida y fluida para el usuario
export const dibujarInvitados = (
  invitados,
  contenedor,
  callbackBorrar,
  consola,
) => {
  // Yo limpio el contenedor antes de volver a dibujar
  contenedor.innerHTML = "";

  // Yo actualizo el contador de invitados en la interfaz
  const contador = document.getElementById("guestCount");
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (contador) contador.textContent = String(invitados.length);

  // Si no hay invitados, muestro un mensaje de estado vacío
  if (invitados.length === 0) {
    const vacio = document.createElement("div");
    vacio.className = "col-12 empty-state glass-panel";
    vacio.innerHTML = `<p>Todavía no hay invitados confirmados.</p>`;
    contenedor.appendChild(vacio);
    consola?.log("Listado renderizado: sin registros");
    return;
  }

  // Yo recorro cada invitado y creo una tarjeta visual para cada uno
  invitados.forEach((invitado, indice) => {
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-xl-4";

    const tarjeta = document.createElement("article");
    tarjeta.className = "result-card glass-panel h-100";
    tarjeta.innerHTML = `
      <header class="result-card__head">
        <h3>${invitado.nombre} ${invitado.apellido}</h3>
        <span class="badge-pill">${invitado.tipoEntrada}</span>
      </header>
      <ul class="result-card__meta">
        <li><span>Edad</span><strong>${invitado.edad} años</strong></li>
        <li><span>Email</span><strong>${invitado.email}</strong></li>
        <li><span>Acompañantes</span><strong>${invitado.acompanantes}</strong></li>
        <li><span>Lectura</span><strong class="text-wrap">${invitado.metodosUsados}</strong></li>
      </ul>
      <button type="button" class="btn btn-outline-danger btn-sm w-100 btn-borrar">Eliminar acceso</button>
    `;

    // Yo agrego el evento click al botón de eliminar para poder borrar el invitado
    tarjeta.querySelector(".btn-borrar").addEventListener("click", () => {
      callbackBorrar(indice);
      consola?.log(
        `Invitado eliminado: ${invitado.nombre} ${invitado.apellido}`,
      );
    });

    columna.appendChild(tarjeta);
    contenedor.appendChild(columna);
  });

  // Yo registro en la consola cuántos invitados hay actualmente
  consola?.log(`Listado actualizado: ${invitados.length} invitado(s)`);
};