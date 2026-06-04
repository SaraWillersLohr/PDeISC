/** Mobile-first canvas sizing — Snake + Pac-Man */

function isMobileGameViewport() {
  return window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches;
}

/** Altura del chrome (header + HUD + dock fijo) */
function measureGameChromeHeight(gameId) {
  let chrome = 0;
  const header = document.querySelector('.header-nav');
  if (header) chrome += header.offsetHeight;

  if (gameId === 'pacman') {
    const hud = document.querySelector('.pacman-hud');
    if (hud && getComputedStyle(hud).display !== 'none') chrome += hud.offsetHeight;
  } else {
    const hud = document.querySelector('.hud-bar');
    if (hud && getComputedStyle(hud).display !== 'none') chrome += hud.offsetHeight;
    const powerups = document.getElementById('powerupIndicators');
    if (powerups && powerups.offsetHeight > 0) chrome += powerups.offsetHeight;
    const banner = document.getElementById('connectionBanner');
    if (banner && banner.offsetHeight > 0 && banner.style.display !== 'none') {
      chrome += banner.offsetHeight;
    }
  }

  const mobileStack = document.querySelector('.mobile-controls-stack');
  const shell = document.querySelector('.game-shell');
  let hasShellPadding = false;
  if (shell) {
    const ss = getComputedStyle(shell);
    hasShellPadding = (parseFloat(ss.paddingBottom) || 0) > 0;
    chrome += (parseFloat(ss.paddingTop) || 0) + (parseFloat(ss.paddingBottom) || 0);
    chrome += (parseFloat(ss.gap) || 0);
  }

  if (mobileStack && isMobileGameViewport()) {
    const st = getComputedStyle(mobileStack);
    if (st.position === 'fixed' && st.display !== 'none' && !hasShellPadding) {
      chrome += mobileStack.offsetHeight;
    }
  }

  return chrome;
}

/**
 * Tamaño del canvas fullscreen.
 * Regla: min(anchoPantalla, altoPantalla * 0.85) — en mobile width = 100vw.
 */
function computeFullscreenCanvasSize(aspectRatio, gameId) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mobile = isMobileGameViewport();
  const chrome = measureGameChromeHeight(gameId);

  let maxW;
  let maxH;

  if (mobile) {
    maxW = vw * 0.98;
    maxH = Math.max(100, vh - chrome - 6);
  } else if (vw < 992) {
    maxW = vw * 0.94;
    maxH = Math.max(120, vh - chrome - 16);
  } else {
    // Desktop: sidebar de 200px + gaps (16px entre áreas + ~24px de padding shell)
    const sidebarWidth = 200 + 16 + 24;
    maxW = vw - sidebarWidth;
    // Limitar al 92% del ancho disponible para no pegarse a los bordes
    maxW = Math.min(maxW, (vw - sidebarWidth) * 0.96);
    maxH = Math.max(120, vh - chrome - 20);
  }

  if (!aspectRatio || aspectRatio <= 0) {
    return { w: Math.floor(maxW), h: Math.floor(maxH) };
  }
  return fitCanvasToAspect(aspectRatio, maxW, maxH);
}

/** Grid Snake: celdas reducidas para que el personaje se vea grande y claro */
function getSnakeGridDimensions(isOnline) {
  if (isOnline) return { width: 20, height: 13 };

  const vw     = window.innerWidth;
  const mobile = isMobileGameViewport();

  if (mobile) {
    // Mobile: muy pocas celdas para sprites grandes y táctiles
    const width  = Math.min(16, Math.max(12, Math.round(vw / 28)));
    const height = Math.min(11, Math.max(8,  Math.round(width * 0.65)));
    return { width, height };
  }

  // Desktop / tablet: grid reducido respecto al anterior (era 25-30 × 16-20)
  const width  = Math.min(22, Math.max(18, Math.round(vw / 52)));
  const height = Math.min(14, Math.max(11, Math.round(width * 0.65)));
  return { width, height };
}

/** Aplica tamaño interno + CSS al canvas */
function applyCanvasPixelSize(canvas, w, h) {
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvas.style.maxWidth = '100vw';
  canvas.style.display = 'block';
}

/** @deprecated — usar computeFullscreenCanvasSize */
function getAvailableCanvasBounds(maxContainerWidth) {
  const mobile = isMobileGameViewport();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const chrome = measureGameChromeHeight('game');
  return {
    maxW: mobile ? vw : Math.min(vw, maxContainerWidth || vw),
    maxH: Math.max(100, (mobile ? vh * 0.85 : vh) - chrome)
  };
}

function fitCanvasToAspect(aspect, maxW, maxH) {
  let w;
  let h;
  if (maxW / aspect <= maxH) {
    w = maxW;
    h = Math.round(maxW / aspect);
  } else {
    h = maxH;
    w = Math.round(maxH * aspect);
  }
  return { w: Math.floor(w), h: Math.floor(h) };
}

function observeGameLayoutResize(onResize) {
  const shell = document.querySelector('.game-shell');
  const mobileStack = document.querySelector('.mobile-controls-stack');
  if (typeof ResizeObserver === 'undefined') return;

  const ro = new ResizeObserver(() => onResize());

  if (shell) {
    ro.observe(shell);
    [...shell.children].forEach((child) => ro.observe(child));
  }
  if (mobileStack) ro.observe(mobileStack);
  window.addEventListener('orientationchange', onResize);
}
