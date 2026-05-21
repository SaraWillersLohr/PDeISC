// avisos visuales sin usar alert()
export const mostrarToast = (contenedorId, mensaje, tipo = "success") => {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const toast = document.createElement("div");
  toast.className = `toast-custom ${tipo}`;
  toast.setAttribute("role", "status");
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-out");
    setTimeout(() => toast.remove(), 400);
  }, 3200);
};
