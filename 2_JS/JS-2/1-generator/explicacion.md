# NumberMaster Generator - Documentación Técnica

## Estructura del Proyecto
El proyecto sigue una arquitectura modular y profesional, dividiendo responsabilidades entre el servidor (Node.js/Express) y el cliente (JavaScript Vanilla).

- `server.js`: Punto de entrada del backend. Gestiona rutas, persistencia de archivos y descargas reales.
- `/modulos/numberProcessor.js`: Núcleo lógico que detecta tipos numéricos avanzados (Complejos, Fracciones, Factoriales, etc.).
- `/paginas/index.html`: Interfaz de dashboard construida con Bootstrap 5.
- `scripts/main.js`: Lee las líneas del archivo, te pregunta si hay dudas (ambigüedad) y calcula las estadísticas (útiles vs no útiles).
- **Vista Previa**: Ahora podés inspeccionar el contenido bruto del archivo antes del análisis en una sección dedicada con tipografía profesional.
- **Selector del Servidor**: Se añadió una opción para elegir archivos que ya están guardados en el servidor, evitando tener que subirlos de nuevo desde tu computadora.
- `archivos-subidos/`: Una carpeta temporal donde se guardan los archivos que subís para poder leerlos.
- `/estilos/`: Contiene el sistema de diseño (main, dark, light) con soporte para scroll horizontal en resultados largos.

## Soporte Numérico Expandido
El sistema detecta y clasifica los siguientes tipos:
1.  **Enteros y Negativos**: `25`, `-15`.
2.  **Decimales**: `2.5`, `-7.82`.
3.  **Notación Científica**: `2e3`, `1.5e-2`.
4.  **Hexadecimal, Binario, Octal**: `0xFF`, `0b1010`, `0o77`.
5.  **Factoriales**: `5!`, `42!` (Soportados mediante BigInt para evitar pérdida de precisión).
6.  **Fracciones**: `1/2`, `3/4` (Normalizados a valor decimal).
7.  **Imaginarios y Complejos**: `5i`, `3+2i` (Desglosados en componentes Real e Imaginario).

## Mejoras de UX/UI (Correcciones)
- **Desbordamiento**: Los números grandes (como factoriales de alto valor) se muestran en contenedores con `overflow-x: auto` y `word-break: break-all`, asegurando que la interfaz no se rompa.
- **Responsabilidad Arquitectónica**: Se eliminó toda lógica de clasificación "Útil/No Útil" del Generador, ya que dicha funcionalidad corresponde exclusivamente al Analizador.
- **Panel Técnico**: El panel de transformación ahora muestra etiquetas claras (`tech-label`) y valores destacados, proporcionando una experiencia de "consola moderna".

## Objetos de Datos
Se utiliza un objeto enriquecido para representar cada entrada:
```javascript
{
  original: "3+2i",
  tipo: "complejo",
  valido: true,
  real: 3,
  imaginario: 2
}
```

## Validaciones
- **Rechazo**: Se validan expresiones inválidas como `hola`, `2++3`, o constantes no numéricas como `pi`.
- **Backend**: Verificación de integridad antes de la generación del TXT físico con saltos de línea Windows (`\r\n`).
