# NumberMaster Analyzer - Documentación Técnica

## Estructura del Proyecto
Diseñado para el análisis masivo de datos numéricos provenientes de archivos TXT.

- `server.js`: Implementa `multer` para la gestión segura de subidas de archivos.
- `/modulos/numberProcessor.js`: Lógica compartida para normalización y detección de "números útiles".
- `/archivos-subidos/`: Almacén temporal de los archivos procesados.
- `/archivos-generados/`: Reportes finales generados por el sistema.

## Análisis y Filtrado
### Definición de Número Útil
Un número es considerado útil si su valor decimal normalizado (convertido a string) empieza y termina con el mismo dígito. 
Ejemplo: `0b1001` -> `9` -> Útil.

### Flujo de Análisis
1. Subida del TXT vía AJAX.
2. Lectura línea por línea en el backend.
3. Procesamiento en el frontend:
   - Detección de tipos (entero, negativo, decimal, científica, hex, bin, oct, factorial).
   - Cálculo de factoriales (ej: 5! = 120).
   - Filtrado de útiles y ordenamiento ascendente (`sort((a,b)=>a-b)`).
4. Generación de estadísticas (porcentaje de utilidad, conteo de factoriales, etc.).

## Exportación
El sistema permite exportar únicamente los números útiles detectados y ordenados a un nuevo archivo TXT, guardándolo en el servidor y descargándolo localmente en una sola operación.
