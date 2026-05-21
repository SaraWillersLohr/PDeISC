# Proyecto 1 — VIP Guest List

Hice este proyecto para practicar **páginas dinámicas** sin recargar el navegador y para dejar bien claras las **3 formas de leer un formulario** con JavaScript.

## Qué cumple de la consigna

- La página **no se recarga** cuando agrego un invitado (`preventDefault` + render con DOM).
- Muestro en pantalla las lecturas con:
  - `getElementById` → nombre
  - `querySelector` → apellido
  - `FormData` → edad, email, tipo de entrada y acompañantes
- Validación en tiempo real (sin `alert` y sin `required` en HTML).

## Cómo está organizado

| Archivo | Para qué lo uso |
|---------|-----------------|
| `scripts/main.js` | Eventos del formulario y flujo general |
| `modules/formReaders.js` | Las 3 lecturas + panel visual |
| `modules/render.js` | Creo las cards con `createElement` |
| `modules/validations.js` | Reglas de nombre, edad, email |
| `modules/eventConsole.js` | Consola visual con historial en `sessionStorage` |
| `modules/theme.js` | Dark/light con persistencia en `localStorage` |

## Qué aprendí acá

- **DOM dinámico:** cada invitado se pinta con nodos nuevos y el listado se actualiza al instante.
- **Eventos:** escucho `input` para validar mientras escribo y `submit` para confirmar sin refresh.
- **FormData:** me simplifica leer varios campos de una, pero para un solo campo prefiero `getElementById` o `querySelector` cuando quiero ser explícita.

## Errores que me cuidé

- Olvidar `preventDefault()` → la página se recarga y perdés todo el estado.
- Mezclar validación HTML (`required`) con JS → en este TP valido **solo con JS** (`novalidate`).
- No limpiar clases `is-valid` / `is-invalid` después del reset.

## Cómo ejecutarlo

```bash
cd 01_invitados
node server.js
```

Abrí `http://localhost:3026`

## Responsive

Usé CSS con variables, `clamp()`, grid de dos columnas en desktop y una en mobile. La consola y el panel de métodos bajan debajo del formulario en pantallas chicas para evitar overflow horizontal.

## Explicación académica completa

En la raíz del TP: **`../EXPLICACION.md`** (Punto 1, 2, 3, validaciones, errores comunes y conclusión).
