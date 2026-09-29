# Explicación técnica

## Alcance y secuencia

Este directorio es una app nueva independiente, creada con `create-expo-app` dentro de `RN_0`; no reemplaza el proyecto anterior. La configuración sigue los capítulos del tutorial oficial en orden: primer workflow manual, builds de desarrollo, previews y PR updates, Maestro, despliegues de producción, releases por tag y web en EAS Hosting.

## Decisiones

- Se conserva Expo Router y la estructura `src/app` de la plantilla oficial actual.
- Android e iOS tienen identificadores explícitos para builds y flujos Maestro.
- Los perfiles `development`, `preview` y `production` usan canales EAS Update diferenciados. `e2e-test` agrega las opciones que especifica el capítulo Maestro.
- Fingerprinting y `get-build` evitan reconstrucciones cuando el código nativo no cambia. Production publica OTA cuando ya existe un build compatible.
- `app.json` exporta web estática para EAS Hosting.
- La ruta existente `explore` se presenta como Settings para cubrir el flujo de navegación de ejemplo del tutorial E2E sin agregar otro sistema de navegación.
- No se agregó Slack: la guía marca esa integración como opcional y requiere un webhook externo.
- No se agregaron jobs de envío a tiendas: la guía los trata como una ampliación opcional que requiere credenciales de Apple y Google.

## Archivos principales

- `eas.json`: configuración CLI, perfiles nativos, canales y perfil E2E.
- `app.json`: nombre y slug, identificadores de Android/iOS, runtime/updates y exportación web.
- `.eas/workflows/*.yml`: jobs EAS del tutorial, triggers, builds condicionales, updates y deploys.
- `.maestro/*.yml`: prueba inicial y prueba de navegación a Settings.
- `__tests__/app-config.test.ts`: valida que ambos identificadores nativos estén definidos.
- `README.md`: instrucciones de instalación, build, CI/CD, actualización y despliegue.

## Vinculación EAS y límites de ejecución

La app quedó vinculada al proyecto Expo `@agusbanegas/Ej-tutorial2` (`4f36dd62-50d5-468f-98da-0b7e3317cef0`). `eas build:configure` configuró Android/iOS y `eas update:configure` guardó el runtime, el URL real de Updates y los canales de cada perfil. El repositorio debe conectarse en el panel EAS a GitHub para habilitar los triggers remotos; esto requiere instalar la app GitHub de Expo desde el dashboard.

La ejecución manual de `hello.yml` se intentó siguiendo la guía, pero Windows no pudo empaquetar el repositorio padre por un symlink perteneciente a otro proyecto. El validador de la CLI EAS disponible (20.1) devolvió un error interno al consultar el esquema. Las pruebas Jest y el export web sí finalizaron correctamente. No se iniciaron builds nativos para evitar consumir créditos ni crear credenciales sin necesidad.
