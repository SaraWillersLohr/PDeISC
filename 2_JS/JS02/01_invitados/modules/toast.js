// Yo muestro avisos visuales sin usar alert() que son intrusivos
// Los toasts son más elegantes y no interrumpen la experiencia del usuario
export const mostrarToast = (contenedorId, mensaje, tipo = "success") => {
  // Yo busco el contenedor donde voy a mostrar el toast
  const contenedor = document.getElementById(contenedorId);
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!contenedor) return;

  // Yo creo el elemento toast con el mensaje y el tipo (success/error)
  const toast = document.createElement("div");
  toast.className = `toast-custom ${tipo}`;
  toast.setAttribute("role", "status");
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  // Yo programo la animación de salida y luego elimino el elemento del DOM
  setTimeout(() => {
    toast.classList.add("toast-out");
    setTimeout(() => toast.remove(), 400);
  }, 3200);
};