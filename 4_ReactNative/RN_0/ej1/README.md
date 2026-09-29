# Hola Mundo · React Native

Ejercicio: crear una primera aplicación con Expo y TypeScript, mostrar **Hola Mundo**, agregar Tabs y una segunda pantalla con diferentes estilos.

## Tecnologías

- Expo SDK 57, React Native 0.86 y React 19.2.
- TypeScript con modo estricto y control de variables e imports sin usar.
- React Navigation (Bottom Tabs), componentes nativos e iconos Ionicons.
- Context para el tema y AsyncStorage para conservar la preferencia.

Creado directamente en `RN_0/ej1/` mediante `npx create-expo-app@latest . --template blank-typescript --yes`, siguiendo la [documentación oficial de Expo](https://docs.expo.dev/get-started/create-a-project/). Las dependencias nativas se instalaron mediante `npx expo install`.

## Instalación y ejecución

Requiere Node.js LTS y Expo Go compatible con el SDK del proyecto.

```sh
npm ci
npm start
```

Escaneá el QR con Expo Go. La ejecución y conexión al teléfono quedan a cargo de la usuaria. También están disponibles `npm run android` y `npm run ios` para entornos locales preparados (el simulador iOS requiere macOS).

```sh
npm run typecheck
npx expo install --check
npm run build
```

`build` genera los bundles de producción de Android e iOS en `dist/` para comprobar el empaquetado. No crea un APK/IPA ni inicia Expo Go. Para probar en Expo Go usá `npm start`.

## Funcionalidades

- **Inicio:** saludo centrado y diseño sencillo.
- **Estilos:** permite elegir seis colores, una tipografía, el tamaño de «Hola Mundo» y un fondo. Al aplicar, el color y el fondo cambian en toda la app; fuente y tamaño se aplican al saludo.
- Botón de luna/sol en el encabezado para cambiar el tema de toda la aplicación.
- Preferencias de apariencia y modo claro/oscuro guardados localmente. La primera apertura toma el tema del sistema.
- Contenido adaptable, opciones que se acomodan en varias filas y ancho máximo en pantallas grandes.
- Scroll en Estilos; la flecha para volver arriba aparece cuando hay contenido desbordado y se desplazó más de 80 puntos.
- Sin backend, HTML, CSS tradicional ni alerts.

## Estructura

```text
App.tsx                         Proveedores y barra de estado
src/
  components/ThemeButton.tsx    Botón de tema
  components/BackgroundDecoration.tsx  Fondo con ondas
  constants/appearance.ts     Opciones de apariencia
  constants/colors.ts         Colores base del tema
  context/ThemeContext.tsx     Estado global y persistencia
  navigation/AppTabs.tsx       Navegación inferior
  screens/HomeScreen.tsx       Inicio
  screens/StylesScreen.tsx     Selector y ejemplos
```

## Comprobación manual en Expo Go

1. Abrí Inicio y comprobá el saludo y los dos Tabs.
2. En Estilos, elegí color, fuente, tamaño y fondo; pulsá Aplicar cambios.
3. En Inicio, comprobá el saludo con las opciones elegidas. Color y fondo también se reflejan en Estilos y en los Tabs.
4. Cerrá y volvé a abrir la app: la apariencia elegida y el tema claro/oscuro deben conservarse.
5. Probá orientación horizontal, pantalla pequeña y texto ampliado: el contenido debe poder desplazarse sin recortes.
6. Desplazá Estilos: aparece la flecha; al pulsarla se vuelve arriba y desaparece. En una pantalla donde todo entra, no debe aparecer.

La prueba visual y de persistencia en un teléfono requiere ejecutar estos pasos en Expo Go.
