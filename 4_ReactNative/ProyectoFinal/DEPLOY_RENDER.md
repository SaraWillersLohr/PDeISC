# Despliegue del backend en Render

El archivo `render.yaml` define la API Express como un Web Service gratuito, compila TypeScript, ejecuta las migraciones aditivas y comprueba `/api/health`. Está dentro de la carpeta de la app; al crear el Blueprint en Render hay que elegir el repositorio `SaraWillersLohr/PDeISC`, la rama `main` y como **Blueprint Path** `4_ReactNative/ProyectoFinal/render.yaml`. El servicio usa como **Root Directory** `4_ReactNative/ProyectoFinal/backend`, así Render toma solo el backend de este proyecto del monorepo.

## Antes de crear el servicio

1. Subir esta versión del proyecto a `SaraWillersLohr/PDeISC`, conservando las carpetas `4_ReactNative/ProyectoFinal/backend/`, `4_ReactNative/ProyectoFinal/frontend/` y el Blueprint dentro de `4_ReactNative/ProyectoFinal/`.
2. Crear una base de datos MySQL compatible externa. Render no ofrece MySQL administrado gratuito. Para mantener el costo en cero se puede usar un proveedor MySQL compatible con plan gratuito, por ejemplo TiDB Cloud Starter, y habilitar TLS.
3. Crear el Blueprint en Render desde ese repositorio. En el alta, completar `FRONTEND_ORIGIN`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`. Render generará los secretos JWT y de verificación automáticamente.

## Después de publicar la API

1. Comprobar `https://<servicio>.onrender.com/api/health`; debe responder `{"status":"ok"}`.
2. Configurar `EXPO_PUBLIC_API_URL=https://<servicio>.onrender.com/api` en el entorno de EAS y volver a generar el APK. La URL debe ser HTTPS y no debe terminar en otra ruta.
3. Configurar SMTP si se usarán registro/verificación de correo y recuperación de contraseña. El plan gratuito de Render bloquea las salidas SMTP por 25, 465 y 587; el proveedor de correo debe ofrecer un puerto permitido, como 2525.

## Límites del plan gratuito

Render pausa el Web Service después de 15 minutos sin tráfico y el primer pedido posterior puede tardar alrededor de un minuto. La API queda pública, pero no está disponible de forma inmediata permanente. El filesystem del servicio también es temporal; las imágenes y datos deben guardarse en la base o en almacenamiento externo.
