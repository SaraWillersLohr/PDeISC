export const dibujarListaPersonas = (lista, contenedor, onBorrar, consola) => {
  contenedor.innerHTML = "";

  const contador = document.getElementById("peopleCount");
  if (contador) contador.textContent = String(lista.length);

  const nombresLista = document.getElementById("namesList");
  if (nombresLista) {
    nombresLista.innerHTML = "";
    if (!lista.length) {
      nombresLista.innerHTML = "<li class=\"names-empty\">Sin nombres guardados todavía</li>";
    } else {
      lista.forEach((p) => {
        const li = document.createElement("li");
        li.textContent = `${p.nombre} ${p.apellido}`;
        nombresLista.appendChild(li);
      });
    }
  }

  if (!lista.length) {
    const vacio = document.createElement("div");
    vacio.className = "col-12 empty-state glass-panel";
    vacio.innerHTML = "<p>No hay personas en localStorage.</p>";
    contenedor.appendChild(vacio);
    return;
  }

  lista.forEach((p, indice) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-xl-4";
    const card = document.createElement("article");
    card.className = "result-card glass-panel h-100";
    card.innerHTML = `
      <header class="result-card__head">
        <h3>${p.nombre} ${p.apellido}</h3>
        <span class="badge-pill">${p.edad} años</span>
      </header>
      <ul class="result-card__meta">
        <li><span>DNI</span><strong>${p.documento}</strong></li>
        <li><span>Nacimiento</span><strong>${p.fechaNac}</strong></li>
        <li><span>Sexo</span><strong>${p.sexo === "male" ? "Masculino" : "Femenino"}</strong></li>
        <li><span>Estado civil</span><strong>${p.estadoCivil}</strong></li>
        <li><span>Nacionalidad</span><strong>${p.nacionalidad}</strong></li>
        <li><span>Teléfono</span><strong>${p.telefono}</strong></li>
        <li><span>Email</span><strong class="text-wrap">${p.email}</strong></li>
        <li><span>Hijos</span><strong>${p.hijos}</strong></li>
      </ul>
      <button type="button" class="btn btn-outline-danger btn-sm w-100 btn-borrar">Eliminar registro</button>
    `;
    card.querySelector(".btn-borrar").addEventListener("click", () => onBorrar(indice));
    col.appendChild(card);
    contenedor.appendChild(col);
  });

  consola?.log(`Listado renderizado (${lista.length} persona(s))`);
};
