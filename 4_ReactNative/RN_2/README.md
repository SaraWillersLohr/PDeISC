# Catálogo de funciones del teléfono

Aplicación educativa hecha con Expo y React Native. Presenta un catálogo de funciones del dispositivo y permite abrir una demostración práctica de cada una. La aplicación funciona de forma independiente y no requiere backend.

## Funciones disponibles

- Cámara trasera con captura de foto y control del flash.
- Lector de códigos QR y códigos comerciales.
- Ubicación GPS con latitud, longitud y precisión.
- Acelerómetro y giroscopio con lecturas en tiempo real.
- Brújula digital mediante el magnetómetro.
- Podómetro para observar pasos durante la prueba.
- Biometría para consultar disponibilidad y probar la autenticación del sistema.

Las funciones dependen del hardware del teléfono y de los permisos autorizados. Las lecturas se muestran dentro de la app; no se envían a un servidor.

## Iniciar el proyecto

Requisitos: Node.js, npm y conexión a Internet para instalar dependencias.

```powershell
cd frontend
npm install
npx expo start
```

Expo Go debe ser compatible con la versión SDK del proyecto. Si muestra que el proyecto requiere una versión más nueva, actualizá Expo Go o instalá el APK de prueba generado con EAS. La cámara, los sensores físicos y la biometría se prueban mejor en un teléfono real.

## Generar el APK de prueba

El perfil `preview` en `frontend/eas.json` genera un APK de distribución interna. Iniciá sesión en Expo y ejecutá:

```powershell
cd frontend
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Al finalizar, EAS entrega un enlace para descargar e instalar el APK en Android. No hace falta configurar una API.

## Código principal

- `frontend/app/(tabs)/index.tsx`: catálogo responsive de funciones.
- `frontend/app/herramienta/[id].tsx`: demostraciones de hardware y manejo de permisos.
- `frontend/src/data/functions.ts`: textos e identificadores de las tarjetas del catálogo.
- `frontend/src/theme/colors.ts`: paleta visual compartida.
- `frontend/app.json`: nombre, identificador y permisos nativos.
- `frontend/eas.json`: perfiles de compilación EAS.

Las pantallas incluyen comentarios en español para explicar sus responsabilidades y las decisiones principales de implementación. Los errores y resultados se muestran en la interfaz sin ventanas `alert`.
