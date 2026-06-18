// Comentarios claros: este archivo explica la lógica paso a paso.

/** Toast de nivel — overlay no bloqueante, fade in/out */

// Función showLevelToast(message, que ayuda a entender la lógica.
function showLevelToast(message, durationMs) {
  const duration = durationMs || 2000;
  let el = document.getElementById('levelToast');
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!el) {
    el = document.createElement('div');
    el.id = 'levelToast';
    el.className = 'level-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }

  el.textContent = message;
  el.classList.remove('level-toast--hide', 'level-toast--out');
  el.classList.add('level-toast--show');

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (el._toastTimer) clearTimeout(el._toastTimer);
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (el._fadeTimer) clearTimeout(el._fadeTimer);

  el._fadeTimer = setTimeout(() => {
    el.classList.add('level-toast--out');
  }, Math.max(800, duration - 500));

  el._toastTimer = setTimeout(() => {
    el.classList.remove('level-toast--show', 'level-toast--out');
    el.classList.add('level-toast--hide');
  }, duration);
}

// Función showLevelUpToast(level, que ayuda a entender la lógica.
function showLevelUpToast(level, completed) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (completed) {
    showLevelToast(`¡Nivel ${level} completado!`, 2200);
  } else {
    showLevelToast(`Nivel ${level}`, 1800);
  }
}