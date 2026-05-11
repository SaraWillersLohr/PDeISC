# Documentación Técnica: Refactorización World Wide News

Este documento explica de manera detallada todos los cambios, mejoras y lógicas aplicadas al proyecto "World Wide News" para llevarlo a un nivel profesional y académico.

---

## 1. Estructura HTML y Diseño Responsive

Se trabajó sobre la base de **Bootstrap 5**, pero refinando la estructura para que sea más estable y semántica.

*   **Header Triple Barra**: 
    *   Barra Superior: Manejo de fecha, clima/indicadores y redes sociales usando `d-flex` y utilidades de alineación.
    *   Barra Media: El logo centrado (`text-center`) y el botón hamburguesa (`navbar-toggler`) alineado a la izquierda en móviles.
    *   Barra Inferior: Navegación de categorías usando el componente `navbar` de Bootstrap con `navbar-expand-md` para que se comporte como un menú horizontal en escritorio y un menú vertical desplegable en móviles.
*   **Secciones de Noticias**: Se utilizó el sistema de grillas (`row` y `col`) para crear una jerarquía visual:
    *   Noticia Principal: `col-lg-8` para destacar el contenido más importante.
    *   Noticias Secundarias: `col-lg-4` para el lateral.
*   **Formulario de Contacto**: Estructurado con `form-group` y etiquetas de error (`.error-msg`) preparadas para la validación dinámica.

---

## 2. Estilos CSS (Modernos y Limpios)

Se creó un sistema de diseño basado en **variables CSS** para facilitar el mantenimiento.

*   **Variables de Diseño**: Se definieron colores (`--primary`, `--accent`), sombras (`--shadow-card`) y tiempos de transición (`--transition`).
*   **Scroll de Precisión**: Se aplicó `scroll-padding-top` en el elemento `html` para compensar la altura del header sticky.
*   **Componentes Custom**:
    *   **Cards**: Efectos de `hover` con escala en las imágenes y cambios suaves de color en los títulos.
    *   **Ticker (Ahora)**: Una barra con una animación de pulsación roja (`pulse-red`) para simular una transmisión en vivo.
*   **Responsive Prolijo**: Se ajustaron las tipografías y paddings mediante Media Queries para que el sitio se vea bien desde un iPhone SE hasta un monitor 4K.

---

## 3. Lógica JavaScript (Funcionalidades Avanzadas)

El archivo `main.js` centraliza toda la inteligencia del sitio sin depender de librerías pesadas.

### A. Integración con Bootstrap
En lugar de crear un menú paralelo, se utilizaron los eventos nativos de Bootstrap (`show.bs.collapse`, `hide.bs.collapse`) para sincronizar el cambio de iconos y el bloqueo del scroll cuando el menú está abierto.

### B. Scroll Inteligente y Dinámico
La función `handleSmoothScroll` calcula la posición del destino en tiempo real:
1.  Obtiene la altura actual del header (que puede variar entre móvil y escritorio).
2.  Resta esa altura a la posición del elemento.
3.  Añade un pequeño "buffer" para que el título respire debajo del header.
4.  Maneja el hash de la URL para que los links funcionen incluso viniendo desde otras páginas.

### C. Validación de "Nombre Humano"
Se implementó un algoritmo de detección de texto basura (`esTextoInvalido`):
*   Bloquea repeticiones triples (ej: "aaaa").
*   Bloquea secuencias de teclado (ej: "asdfg", "qwerty").
*   Verifica la existencia de vocales y ratios lógicos de caracteres para evitar nombres falsos o spam.

### D. Indicadores en Vivo
Se utilizó la **Fetch API** para conectarse a `dolarapi.com` y mostrar las cotizaciones del Dólar Oficial, Blue y Bolsa de manera automática al cargar la página.

### E. Ticker de Noticias
Un sistema de rotación automática que cambia el texto cada 6 segundos con efectos de desvanecimiento (`fade-in` / `fade-out`) sincronizados con el CSS.

---

## 4. Resumen de Métodos Clave

*   **`IntersectionObserver`**: Utilizado para detectar qué sección está viendo el usuario y marcar automáticamente el link activo en el menú de navegación.
*   **`setTimeout` y `setInterval`**: Para manejar los tiempos de las animaciones y la rotación del ticker.
*   **`async/await`**: Para la carga asíncrona de datos financieros sin bloquear la interfaz.
*   **`e.preventDefault()`**: Para interceptar clicks en links y aplicar el scroll suave personalizado.

---
*Documentación generada para el proyecto académico World Wide News.*
