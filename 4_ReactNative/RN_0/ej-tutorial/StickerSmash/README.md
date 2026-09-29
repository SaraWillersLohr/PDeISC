# StickerSmash

Aplicación universal construida con React Native, Expo SDK 57, TypeScript y Expo Router. Permite elegir una imagen o usar la imagen de ejemplo, colocar stickers emoji, moverlos, cambiar su tamaño con doble toque y guardar el resultado.

## Requisitos

- Node.js LTS
- npm
- Expo Go o un emulador para Android/iOS

## Inicio

```bash
npm install
npx expo start
```

Usa Expo Go para abrir el QR en un dispositivo, o pulsa `w` en la terminal para iniciar la versión web.

## Comandos

```bash
npm run lint
npx tsc --noEmit
```

## Estructura

```text
assets/images/       Imágenes del tutorial, emojis, icono y splash
src/app/             Rutas Expo Router, navegación y pestañas
src/components/      Botones, visor, selector de stickers y sticker gestual
types.d.ts           Declaración de tipos de dom-to-image
```

La pantalla principal se encuentra en `src/app/(tabs)/index.tsx`; cada componente reutilizable vive fuera de `src/app` para que Expo Router no lo registre como una ruta.

## Plataformas

- Android e iOS: Expo Image Picker selecciona una imagen; View Shot captura la composición y Expo Media Library la guarda.
- Web: dom-to-image genera un JPEG descargable, ya que los navegadores no usan la biblioteca nativa de captura.

El detalle de cada capítulo y los cambios realizados se documentan en [explicación.md](./explicación.md).
