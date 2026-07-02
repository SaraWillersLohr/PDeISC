// Acá configuro el botón flotante para volver arriba con scroll suave
export function inicializarVolverArriba() {
  const boton = document.getElementById('btn-volver-arriba');
  if (!boton) return;

  // Acá muestro u oculto el botón según la posición del scroll
  function actualizarVisibilidad() {
    if (window.scrollY > 300) {
      boton.classList.add('visible');
    } else {
      boton.classList.remove('visible');
    }
  }

  // Acá hago scroll suave hacia arriba al hacer clic
  boton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', actualizarVisibilidad);
  actualizarVisibilidad();
}
