# Guía para estudiar y defender el proyecto

## React Native y Expo

React Native permite crear aplicaciones móviles con React. `View`, `Text`, `Pressable` y `ScrollView` se representan con componentes nativos. No usamos HTML ni CSS de una página web.

Expo facilita la creación, las dependencias y el empaquetado del proyecto. Expo Go permite abrir una aplicación compatible en el teléfono durante el desarrollo. TypeScript agrega tipos para detectar errores antes de ejecutar.

## Las pantallas y los Tabs

`HomeScreen` muestra únicamente Hola Mundo, centrado. La fuente y el tamaño vienen de la apariencia aplicada.

`StylesScreen` presenta opciones de color, tipografía, tamaño y fondo. Permite revisar el aspecto de Hola Mundo y aplicar los cambios. Su contenido puede desplazarse.

`AppTabs` usa `createBottomTabNavigator` de React Navigation para declarar Inicio y Estilos. El navegador administra la pantalla activa y muestra los botones inferiores. `NavigationContainer` contiene el estado de navegación y recibe los colores del tema. Los tipos de las rutas indican que ninguna necesita parámetros.

## Los estilos

`StyleSheet.create` organiza objetos de estilos propios de React Native. `backgroundColor` cambia el fondo; `fontSize` y `fontWeight` cambian tamaño y peso de texto. `padding` es espacio interior y `margin` exterior. `borderWidth` y `borderColor` dibujan bordes; `borderRadius` redondea esquinas.

Flexbox distribuye elementos: `flexDirection: 'row'` coloca elementos en fila; `flexWrap: 'wrap'` permite pasar a otra fila; `alignItems` alinea y `justifyContent` distribuye en el eje principal. Usamos espacios consistentes, ancho disponible y un máximo de 760 puntos en Estilos para que las tarjetas no se estiren demasiado en tablets.

Los estilos pueden combinarse en un arreglo. Los valores posteriores reemplazan a los anteriores. La pantalla Inicio combina sus estilos de alineación con el color, fuente y tamaño elegidos.

## Selector de paleta y estado en tiempo real

`useState` conserva valores locales entre renderizados, como `showTop` para controlar la visibilidad del botón flotante para subir. Al seleccionar una opción (color, tipografía, tamaño de texto o fondo), se ejecuta directamente `applyAppearance` compartiendo las preferencias instantáneamente con el resto de la app mediante Context y guardándolas en AsyncStorage.

El flujo es reactivo e inmediato: al tocar cualquier opción en Estilos → Context actualiza la apariencia global y AsyncStorage la almacena → la vista previa en vivo y la pantalla de Inicio se actualizan en el acto.

La apariencia elegida queda guardada entre aperturas, igual que el modo claro/oscuro. Las opciones de color usan verdes, celestes y tonos tierra. El saludo de Inicio adopta la tipografía y el tamaño elegidos; el color y el fondo se comparten en todas las pantallas.

## Tema, Context y AsyncStorage

Context comparte datos con varios componentes sin tener que pasarlos manualmente por todas las capas. `ThemeProvider` envuelve la aplicación. `useTheme` permite obtener la paleta, saber si el tema es oscuro y ejecutar `toggleTheme`.

El botón del encabezado invierte el estado entre light y dark. React actualiza ambas pantallas, la navegación, los iconos y la barra de estado.

AsyncStorage guarda pequeños valores locales de manera asíncrona. La clave `@ej1/theme` contiene light o dark y `@ej1/appearance` guarda las opciones aplicadas. Al abrir, un `useEffect` lee esas preferencias. Si no hay tema guardado, se usa el tema del sistema detectado al iniciar. Se espera esa lectura antes de mostrar la app para evitar un destello con otro tema.

Otro efecto guarda los cambios de tema. Una referencia `writes` encadena las escrituras para que cambios rápidos se guarden en orden. Los errores se manejan mostrando texto en pantalla, sin alerts. AsyncStorage no es una base de datos remota ni se utiliza para datos sensibles.

## Scroll y volver arriba

`ScrollView` permite desplazarse si el contenido supera el espacio disponible. `onScroll` compara la altura del contenido, la altura visible y la posición vertical. `showTop` controla la flecha: solo aparece si existe desbordamiento y se bajó más de 80 puntos.

`useRef` guarda la referencia al ScrollView sin provocar renderizados. Al tocar la flecha, `scrollTo({ y: 0, animated: true })` vuelve al comienzo. Al llegar arriba, el evento de scroll oculta el botón.

## Organización y comprobación

`App.tsx` instala los proveedores. `navigation` define Tabs; `screens` contiene pantallas; `components` contiene piezas reutilizables; `constants` define paletas y variantes; `context` concentra el tema. No hay backend ni lógica de red.

`npm run typecheck` revisa tipos e identificadores sin usar. `npm run build` empaqueta Android e iOS; no produce una aplicación instalable. La interacción, el aspecto final, el tamaño de texto y la persistencia tras reabrir se comprueban en Expo Go siguiendo el README.
