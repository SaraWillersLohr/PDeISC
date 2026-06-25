// acá muestro el botón flotante cuando el usuario hace scroll
export function initScrollTop() {
  const boton = document.getElementById("btn-scroll-top");
  if (!boton) return;

  window.addEventListener("scroll", () => {
    boton.classList.toggle("visible", window.scrollY > 300);
  });

  boton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
