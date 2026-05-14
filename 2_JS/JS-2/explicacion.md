# NumberMaster Suite - Guía Completa para Principiantes 🚀

¡Hola! Si estás leyendo esto, es porque querés entender cómo funciona esta suite de herramientas de procesamiento numérico. No te preocupes, acá te lo explico todo paso a paso, de forma humana y sin complicaciones.

---

## 🏗 ¿Qué es NumberMaster Suite?
Es un ecosistema de dos aplicaciones independientes pero conectadas:
1.  **Generator**: Para crear listas de números (datasets) y guardarlos en archivos `.txt`.
2.  **Analyzer**: Para subir esos archivos, analizarlos, filtrar los que son "útiles" y ver estadísticas.

---

## 🛠 ¿Cómo funciona por dentro? (Tecnologías)
Usamos herramientas estándar de la industria, pero sin librerías pesadas:
*   **Node.js & Express**: El "motor" que corre en la computadora y maneja los servidores.
*   **JavaScript Vanilla**: El lenguaje puro, sin usar cosas como React o Vue, para que el código sea fácil de seguir.
*   **Multer**: Un módulo especial para que el servidor pueda recibir archivos subidos por el usuario.
*   **FS (File System)**: El encargado de crear, leer y borrar archivos reales en el disco rígido.
*   **ES Modules**: Usamos `import` y `export` para que el código sea modular y profesional.

---

## 📂 Estructura del Proyecto

### 1. El Generador (`1-generator`)
*   `server.js`: Acá arranca el servidor. Maneja las rutas (como `/api/generar-txt`) y guarda los archivos en una carpeta.
*   `modulos/numberProcessor.js`: Este es el "cerebro". Acá detectamos si escribiste un binario, un hexadecimal, un factorial (como `5!`) o hasta números complejos.
*   `scripts/main.js`: Controla lo que ves en la pantalla. Valida lo que escribís, muestra la previsualización y le pide al servidor que genere el archivo.
*   `estilos/`: Acá está toda la magia visual (colores, bordes, animaciones) y el soporte para modo oscuro.

### 2. El Analizador (`2-analyzer`)
*   `server.js`: Recibe los archivos que subís. Tiene una validación súper estricta para que no puedas subir fotos o PDFs disfrazados de texto.
*   `scripts/main.js`: Lee las líneas del archivo, te pregunta si hay dudas (ambigüedad) y calcula las estadísticas (útiles vs no útiles).
*   `archivos-subidos/`: Una carpeta temporal donde se guardan los archivos que subís para poder leerlos.

---

## 🧠 Lógica Inteligente

### Resolución de Ambigüedad
Si escribís `65`, ¿es un número decimal o hexadecimal? El sistema no adivina. Te muestra botones para que vos elijas. Esto asegura que los cálculos siempre sean exactos según tu intención.

### Números Útiles
Un número es **útil** si, una vez normalizado (convertido a su valor real), empieza y termina con el mismo dígito.
*   Ejemplo: `525` es útil (empieza y termina con 5).
*   Ejemplo: `0xFF` (que es 255) es útil (empieza y termina con 2).
*   Ejemplo: `123` **no** es útil.

### Factoriales
El sistema detecta cuando usás el símbolo `!`. Usamos un tipo de dato llamado `BigInt` para que el servidor pueda calcular números gigantescos (como el factorial de 170) sin que la computadora se trabe o pierda precisión.

---

## 🚀 Cómo usarlo

1.  **Abrí el Generador**: Entrá a `http://localhost:3000`.
2.  **Cargá tus números**: Escribí entre 10 y 20 números. Podés mezclar formatos (binarios, complejos, factoriales).
3.  **Descargá el TXT**: Hacé click en "Generar TXT".
4.  **Andá al Analizador**: Hacé click en el link del footer.
5.  **Subí tu archivo**: Arrastralo o buscalo. El sistema lo va a escanear línea por línea.
6.  **Resolvé las dudas**: Si hay números ambiguos, elegí el tipo correcto.
7.  **Mirá los resultados**: Vas a ver cuántos son útiles, el porcentaje de efectividad y vas a poder exportar una lista limpia y ordenada.

---

## 🎨 Detalles de UX Profesional
*   **Responsive Real**: Funciona en tu celular, tablet o computadora sin que nada se rompa.
*   **Scroll Moderno**: Diseñamos una barra de desplazamiento fina para que no moleste visualmente.
*   **Volver Arriba**: Un botón flotante que aparece cuando bajás mucho para que no tengas que scrollear a mano.
*   **Seguridad**: Si intentás subir un archivo que no es texto o que tiene contenido basura, el sistema lo rechaza y te explica por qué.

---
*Desarrollado con ❤️ para el aprendizaje de Desarrollo Web Profesional.*
