// obtengo el css activo
const hojaTema = document.getElementById("themeStylesheet");

// aplico el tema guardado
export function cargarTema() {
  const temaGuardado = localStorage.getItem("tema") || "light";

  hojaTema.href = `/styles/${temaGuardado}.css`;
}

// cambio entre claro y oscuro
export function cambiarTema() {
  const temaActual = localStorage.getItem("tema") || "light";

  const nuevoTema = temaActual === "light" ? "dark" : "light";

  hojaTema.href = `/styles/${nuevoTema}.css`;

  localStorage.setItem("tema", nuevoTema);
}
