/**
 * Un pequeño ayudante para mostrar mensajes en la pantalla
 * sin usar el alert() feo del navegador.
 */
export const Notificador = {
  // Crea el contenedor si no existe
  obtenerContenedor() {
    let contenedor = document.getElementById('notificaciones-web');
    if (!contenedor) {
      contenedor = document.createElement('div');
      contenedor.id = 'notificaciones-web';
      contenedor.className = 'toast-container';
      document.body.appendChild(contenedor);
    }
    return contenedor;
  },

  // Muestra un mensaje que desaparece solo
  mostrar(mensaje, tipo = 'info', duracion = 3000) {
    const contenedor = this.obtenerContenedor();
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;

    contenedor.appendChild(toast);

    // Se va solito después de unos segundos
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, duracion);
  },

  exito(msj) { this.mostrar(msj, 'success'); },
  error(msj) { this.mostrar(msj, 'error', 4000); }
};
