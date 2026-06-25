// acá muestro el perfil del usuario o empleado seleccionado
export function renderPerfil(datos, contenedor) {
  if (!contenedor) return;

  if (!datos) {
    contenedor.innerHTML =
      '<p class="userhub-perfil-placeholder">Aquí aparecerá la información seleccionada</p>';
    return;
  }

  const campos = [
    ["Nombre", datos.nombre],
    ["Apodo", datos.apodo],
    ["Email", datos.email],
    ["Teléfono", datos.telefono],
    ["Empresa", datos.empresa],
    ["Dirección", datos.direccion],
    ["Ciudad", datos.ciudad],
    ["Sitio web", datos.sitioWeb],
  ];

  const filas = campos
    .filter(([, valor]) => valor !== undefined)
    .map(([label, valor]) => ({ label, value: valor || "—" }));

  if (datos.extras?.length) {
    datos.extras.forEach((extra) => filas.push({ label: extra.label, value: extra.value }));
  }

  contenedor.innerHTML = `
    <div class="userhub-profile-detail userhub-fade-in">
      ${filas
        .map(
          (fila) => `
        <div class="detail-row">
          <span class="detail-label">${fila.label}</span>
          <span class="detail-value">${fila.value}</span>
        </div>`
        )
        .join("")}
    </div>`;
}

// acá adapto un usuario de jsonplaceholder al formato del panel perfil
export function usuarioApiAPerfil(usuario) {
  const direccion = usuario.address?.street
    ? `${usuario.address.street}${usuario.address.suite ? `, ${usuario.address.suite}` : ""}`
    : "—";

  return {
    nombre: usuario.name,
    apodo: usuario.username,
    email: usuario.email,
    telefono: usuario.phone || "—",
    empresa: usuario.company?.name || "—",
    direccion,
    ciudad: usuario.address?.city || "—",
    sitioWeb: usuario.website || "—",
  };
}

// acá adapto un empleado de la api propia al formato del panel perfil
export function empleadoAPerfil(empleado) {
  return {
    nombre: empleado.nombre,
    email: empleado.email,
    telefono: "—",
    empresa: "UserHub Enterprise",
    direccion: empleado.sede || "—",
    extras: [
      { label: "Cargo", value: empleado.cargo },
      { label: "Departamento", value: empleado.departamento },
    ],
  };
}
