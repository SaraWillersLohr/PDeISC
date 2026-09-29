# Explicación de implementación

Se siguieron, en orden, los nueve capítulos del [tutorial oficial de Expo](https://docs.expo.dev/tutorial/introduction/). El repositorio ya contenía una app Expo SDK 57 y los recursos oficiales, por eso se conservaron y completaron en lugar de crear un proyecto nuevo.

## Progreso por capítulo

1. **Create your first app:** se conserva el template TypeScript de Expo y la imagen suministrada. La pantalla introductoria original se convirtió en la pantalla inicial StickerSmash.
2. **Add navigation:** Expo Router organiza las pantallas en una pila raíz con pestañas Home y About, más una ruta de fallback para páginas inexistentes. Se añadió `@expo/vector-icons` para los iconos.
3. **Build a screen:** la pantalla principal usa `expo-image`, `Pressable` y los componentes `Button` e `ImageViewer`.
4. **Use an image picker:** el botón primario abre la biblioteca mediante `expo-image-picker`; la selección actualiza la vista y habilita las opciones.
5. **Create a modal:** el botón circular abre el selector modal; `FlatList` muestra los seis stickers incluidos y seleccionar uno lo coloca sobre la imagen.
6. **Add gestures:** React Native Gesture Handler y Reanimated permiten arrastrar el sticker y cambiar su tamaño con doble toque.
7. **Take a screenshot:** View Shot captura imagen y sticker; Expo Media Library guarda la captura en dispositivos nativos.
8. **Handle platform differences:** en web, `dom-to-image` crea un JPEG y un enlace de descarga, dado que View Shot y Media Library son APIs nativas.
9. **Configure status bar, splash screen and app icon:** el layout usa una barra de estado clara. Se conservan la ruta del icono y el plugin de splash ya configurados en `app.json` junto con los assets del proyecto.

## Archivos principales

- `src/app/_layout.tsx`: pila raíz y barra de estado.
- `src/app/(tabs)/_layout.tsx`: pestañas e iconos.
- `src/app/(tabs)/index.tsx`: flujo de selección, edición, modal y guardado.
- `src/app/(tabs)/about.tsx`: segunda pestaña.
- `src/app/+not-found.tsx`: ruta de recuperación.
- `src/components/`: componentes visuales separados por responsabilidad.
- `app.json`: configuración Expo existente de nombre, icono, splash y plataformas.
- `package.json` y `package-lock.json`: dependencias compatibles instaladas con Expo.

## Decisiones y comprobaciones

- Se preservaron assets, configuración, Expo Router, TypeScript y la estructura existente.
- Se reemplazó el `alert()` del ejemplo de la documentación por mensajes accesibles en pantalla y manejo de errores. Cancelar una selección no interrumpe el flujo.
- El visor limita su tamaño al espacio disponible para adaptarse a móviles y tabletas.
- No se incorporaron tema persistente ni botón flotante de scroll, porque no forman parte del resultado StickerSmash de este tutorial.
- El splash nativo requiere un preview o production build para probarse como indica Expo; Expo Go no permite verificarlo.
