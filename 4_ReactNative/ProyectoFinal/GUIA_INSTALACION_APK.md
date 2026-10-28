# Guía para preparar e instalar el APK de Android

## Requisitos previos

- Una cuenta de Expo/EAS y acceso a este proyecto.
- Un backend desplegado con HTTPS y las variables de entorno productivas configuradas.
- Definir el identificador Android único de la app (`android.package`) antes del primer build. Ese valor debe pertenecer al dueño del producto y mantenerse para las actualizaciones; no se inventa en esta guía.
- Definir las URLs de retorno OAuth para la app instalada y registrar los IDs públicos de cada proveedor.

## Configuración del proyecto

1. En `frontend/app.json`, agregá el `android.package` aprobado por el equipo. No uses un identificador de ejemplo.
2. En el panel de Expo, vinculá el proyecto EAS desde `frontend` con `npx eas-cli@latest project:init` si todavía no tiene proyecto asociado.
3. Configurá las variables públicas necesarias para el build: `EXPO_PUBLIC_API_URL` debe apuntar a la API HTTPS productiva; agregá los IDs OAuth públicos correspondientes. Los secretos SMTP, JWT y de proveedores sociales permanecen únicamente en el backend.
4. Verificá la configuración y dependencias desde `frontend`:

   ```sh
   npx expo-doctor
   npx expo lint
   npx tsc --noEmit
   ```

## Crear un APK de distribución interna

Desde la carpeta `frontend`, ejecutá:

```sh
npx eas-cli@latest build --platform android --profile preview
```

El perfil `preview` de `frontend/eas.json` solicita un APK para instalar directamente en dispositivos Android. EAS muestra el progreso y el enlace de descarga al terminar.

## Instalar en un dispositivo

1. Abrí el enlace del artefacto en el teléfono Android.
2. Descargá el APK e instalalo. Android puede pedir que autorices temporalmente la instalación desde esa fuente.
3. Abrí EstanciaApp y verificá el acceso, la conexión al backend y las funciones que correspondan al rol de prueba.

## Build para Google Play

El perfil `production` crea un Android App Bundle (`.aab`), el formato habitual para publicar en Google Play:

```sh
npx eas-cli@latest build --platform android --profile production
```

No compartas el APK interno como versión pública. Para una publicación hacen falta la cuenta de Google Play, la firma de Android y una revisión del backend y la privacidad de los datos.
