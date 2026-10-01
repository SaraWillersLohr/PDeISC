# StickerSmash

Ejercicio basado en el [tutorial oficial de Expo](https://docs.expo.dev/tutorial/introduction/), capítulos 1–9. Mantiene el alcance del tutorial: navegación con pestañas, elección de foto, stickers, gestos, captura/guardado y soporte web.

- `src/app/`: rutas y navegación Expo Router.
- `src/components/`: botones, visor, selector modal y sticker gestual.
- `assets/images/`: imagen de ejemplo, stickers y recursos gráficos.

La única adaptación funcional relevante es el guardado web del capítulo 8: se genera un JPEG con `dom-to-image` y se descarga desde el navegador; en Android/iOS se captura la vista y se guarda con `expo-media-library`. La pantalla About y la ruta de página inexistente provienen de la navegación del template.
