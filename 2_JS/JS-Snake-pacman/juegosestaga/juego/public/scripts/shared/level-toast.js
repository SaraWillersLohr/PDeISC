/** Toast de nivel — overlay no bloqueante, fade in/out */

function showLevelToast(message, durationMs) {
  const duration = durationMs || 2000;
  let el = document.getElementById('levelToast');
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

  if (el._toastTimer) clearTimeout(el._toastTimer);
  if (el._fadeTimer) clearTimeout(el._fadeTimer);

  el._fadeTimer = setTimeout(() => {
    el.classList.add('level-toast--out');
  }, Math.max(800, duration - 500));

  el._toastTimer = setTimeout(() => {
    el.classList.remove('level-toast--show', 'level-toast--out');
    el.classList.add('level-toast--hide');
  }, duration);
}

function showLevelUpToast(level, completed) {
  if (completed) {
    showLevelToast(`¡Nivel ${level} completado!`, 2200);
  } else {
    showLevelToast(`Nivel ${level}`, 1800);
  }
}
