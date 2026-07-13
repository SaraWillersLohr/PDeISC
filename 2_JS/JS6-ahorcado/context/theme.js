const hojaTema = document.getElementById("themeStylesheet");

export function cargarTema() {
  const temaGuardado = localStorage.getItem("tema") || "light";
  hojaTema.href = `/styles/${temaGuardado}.css`;
}

export function cambiarTema() {
  const temaActual = localStorage.getItem("tema") || "light";
  const nuevoTema  = temaActual === "light" ? "dark" : "light";
  hojaTema.href    = `/styles/${nuevoTema}.css`;
  localStorage.setItem("tema", nuevoTema);
  return nuevoTema;
}
