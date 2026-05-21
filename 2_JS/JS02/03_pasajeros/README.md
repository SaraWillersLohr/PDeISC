# Proyecto 3 — Registro de Personas (localStorage)

Sistema de personas con validaciones **por país**, prefijo telefónico automático y persistencia en `localStorage`.

## Ejecutar

```bash
cd 03_pasajeros
node server.js
```

Abrí **http://localhost:3028**

## Nacionalidades permitidas (solo 5)

Argentina · Chile · Uruguay · Brasil · Paraguay

El campo es un `<select>` obligatorio. No se aceptan otros países.

## Documento según país

| País | Formato |
|------|---------|
| Argentina | 7 u 8 números |
| Chile | 7 u 8 números |
| Uruguay | 7 u 8 números |
| Brasil | 11 números |
| Paraguay | 6 a 8 números |

Acá aprendí cómo adaptar validaciones según el país en lugar de usar una regla genérica para todos.

La lógica está en `modules/paisConfig.js` y `validarDocumento()` en `modules/validations.js`.

## Teléfono y prefijo

Cuando cambio la nacionalidad, `modules/uiPais.js` actualiza el prefijo automáticamente:

- Argentina → +54 (10 dígitos)
- Chile → +56 (9)
- Uruguay → +598 (8 o 9)
- Brasil → +55 (10 u 11)
- Paraguay → +595 (9)

En esta parte conecto el prefijo con el país y bloqueo caracteres que no sean números.

## Edad y fecha

Uso `Date` para calcular la edad real según día, mes y año. Si la edad escrita no coincide **exactamente**, aparece:

> La edad no coincide con la fecha de nacimiento

## Archivos clave

| Archivo | Rol |
|---------|------|
| `modules/paisConfig.js` | Reglas por país |
| `modules/uiPais.js` | Prefijo, hints, contador de teléfono |
| `modules/validations.js` | Todas las validaciones |
| `modules/feedback.js` | Bordes + íconos ✓ / ✕ |
| `modules/render.js` | Cards + lista de nombres |

## Explicación completa del TP

Leé **`../EXPLICACION.md`** en la raíz de `JS02` para la defensa oral y el repaso de los 3 puntos.
