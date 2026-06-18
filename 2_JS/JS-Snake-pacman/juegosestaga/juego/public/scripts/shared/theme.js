// Manejo de Temas Claro/Oscuro y persistencia por localStorage
document.addEventListener('DOMContentLoaded', () => {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  setTheme(currentTheme);

  const themeToggle = document.getElementById('themeToggle');
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (themeToggle) {
    themeToggle.checked = (currentTheme === 'light');
    themeToggle.addEventListener('change', () => {
      const targetTheme = themeToggle.checked ? 'light' : 'dark';
      setTheme(targetTheme);
    });
  }
});

// Función setTheme(theme) que ayuda a entender la lógica.
function setTheme(theme) {
  // Buscar o crear la etiqueta link para el stylesheet específico de tema
  let themeLink = document.getElementById('theme-style');
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
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