# Explicación del proyecto

## React Native y Expo

React Native permite crear aplicaciones para Android y iOS usando React y componentes escritos en JavaScript o TypeScript. Sus componentes principales se conectan con vistas nativas del dispositivo. Expo ofrece herramientas para iniciar y ejecutar un proyecto React Native con menos configuración, y Expo Go permite probarlo en el teléfono.

## Componentes que aparecen

- **View:** agrupa elementos y organiza su disposición.
- **Text:** muestra texto.
- **Image:** presenta imágenes.
- **ScrollView:** permite desplazarse por contenido.
- **TextInput:** recibe texto escrito.
- **Button:** ejecuta una acción sencilla al tocarlo.
- **Pressable:** detecta pulsaciones y permite personalizar un control.
- **Switch:** cambia un valor entre activo e inactivo.
- **FlatList:** presenta una lista de elementos.
- **SectionList:** presenta listas agrupadas por secciones.
- **ActivityIndicator:** indica que hay una carga en curso.
- **Modal:** muestra una ventana sobre la pantalla.
- **StatusBar:** configura la barra de estado del dispositivo.

## Cómo funciona la aplicación

La pantalla principal recorre un arreglo de componentes y crea una tarjeta por cada elemento. Al tocar «Ver ejemplo», se abre una ventana con la explicación, una demostración y un fragmento de código. Algunas muestras usan `useState` para actualizar el texto, contar toques o cambiar interruptores. El control de la cabecera cambia entre tema claro y oscuro. El ancho de las tarjetas depende del tamaño de pantalla.

## Organización

- `App.tsx` coordina la pantalla y conserva los estados compartidos.
- `src/AppHeader.tsx` muestra la cabecera y el control de tema.
- `src/ComponentCard.tsx` presenta cada componente del catálogo.
- `src/ComponentDetailsModal.tsx` muestra la descripción, la demo y el código.
- `src/ComponentDemo.tsx` contiene las demostraciones interactivas.
- `components.ts` contiene los datos de cada componente.
- `app.json`, `package.json` y `tsconfig.json` configuran Expo y TypeScript.

Los comentarios del código están en minúscula y describen en primera persona las partes principales.

## Ejecutar

Desde la carpeta del proyecto, ejecutar `npm install` y después `npx expo start`. Se puede escanear el QR con Expo Go o presionar `w` para abrir Expo Web.
