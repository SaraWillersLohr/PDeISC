// Manejo de Temas Claro/Oscuro y persistencia por localStorage
document.addEventListener('DOMContentLoaded', () => {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  setTheme(currentTheme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.checked = (currentTheme === 'light');
    themeToggle.addEventListener('change', () => {
      const targetTheme = themeToggle.checked ? 'light' : 'dark';
      setTheme(targetTheme);
    });
  }
});

function setTheme(theme) {
  // Buscar o crear la etiqueta link para el stylesheet específico de tema
  let themeLink = document.getElementById('theme-style');
  if (!themeLink) {
    themeLink = document.createElement('link');
    themeLink.id = 'theme-style';
    themeLink.rel = 'stylesheet';
    // Insertar antes del shared.css para que shared pueda sobreescribir si fuera necesario
    document.head.appendChild(themeLink);
  }
  
  themeLink.href = `/styles/${theme}/${theme}.css`;
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}
