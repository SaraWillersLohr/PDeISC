# Ej-tutorial2 — CI/CD con Expo Application Services

Proyecto Expo SDK 57 configurado siguiendo el [tutorial oficial de CI/CD de Expo](https://docs.expo.dev/tutorial/cicd/introduction/). EAS Workflows automatiza validaciones, builds Android/iOS, pruebas E2E, actualizaciones OTA y despliegues web.

## Requisitos y primer inicio

1. Instalar dependencias con `npm install`.
2. Iniciar Expo con `npx expo start`.
3. Iniciar sesión con una cuenta Expo: `eas login`.
4. El proyecto ya está vinculado a EAS como [`@agusbanegas/Ej-tutorial2`](https://expo.dev/accounts/agusbanegas/projects/Ej-tutorial2), con ID y URL reales. Si se copia a otra cuenta, repetir `eas build:configure` y `eas update:configure`.
5. En el dashboard de EAS, conectar la aplicación con el repositorio GitHub que contiene este directorio. Está dentro de un repositorio mayor; si la interfaz lo solicita, indicar `4_ReactNative/RN_0/Ej-tutorial2` como raíz de app. Los workflows están en `.eas/workflows/` junto a `eas.json`.

Para que funcionen los eventos de GitHub, el archivo de workflow debe estar primero en la rama predeterminada. Los triggers del tutorial usan `main`; ajustar la rama en YAML si el repositorio tiene otra rama predeterminada.

## Builds Android e iOS

Los perfiles `development`, `preview` y `production` compilan ambas plataformas. Ejecutar desde la raíz del proyecto:

```bash
eas build --profile development --platform all
eas build --profile preview --platform all
eas build --profile production --platform all
```

`preview` usa distribución interna. `production` genera artefactos listos para distribución. EAS puede solicitar credenciales de firma la primera vez que se compila cada perfil/plataforma. El perfil `e2e-test` genera un APK Android sin credenciales y una app iOS para simulador.

## CI/CD del tutorial

| Workflow | Activación | Trabajo |
|---|---|---|
| `.eas/workflows/build.yml` | Push a `main` | Jest, fingerprint y builds de desarrollo si hace falta |
| `.eas/workflows/preview.yml` | Push a `main` o manual | Builds internos con fingerprint y deploy web de preview |
| `.eas/workflows/pr-preview.yml` | Pull request | EAS Update para el canal preview y comentario en el PR |
| `.eas/workflows/e2e-tests.yml` | Pull request | Builds de prueba y Maestro en Android/iOS |
| `.eas/workflows/production.yml` | Tag `vX.Y.Z` | Build nativo o actualización OTA según fingerprint y deploy web de producción |

El capítulo inicial `hello.yml` se creó y retiró en la limpieza indicada por la guía. Slack era opcional y no se agregó. El tutorial también describe un trigger temporal por `release/*`; el workflow final usa tags semánticos como indica el capítulo siguiente, excluyendo `-rc`.

### Ejecutar workflows manualmente

```bash
eas workflow:run .eas/workflows/build.yml
eas workflow:run .eas/workflows/preview.yml
eas workflow:run .eas/workflows/e2e-tests.yml
eas workflow:run .eas/workflows/production.yml
```

## Actualizaciones OTA y deploy web

Una vez completado `eas update:configure` y creado un build preview compatible:

```bash
eas workflow:run .eas/workflows/pr-preview.yml
eas update --branch production --message "Actualización de producción"
```

El primer comando se ejecuta automáticamente en pull requests; el segundo publica una OTA directamente al branch production. Normalmente la publicación de producción la realiza el workflow de tags.

El deploy web de preview se realiza con `eas workflow:run .eas/workflows/preview.yml`. Para desplegar a producción, publicar un tag semántico en el repositorio:

```bash
git tag v1.0.0
git push origin v1.0.0
```

El workflow etiqueta `v*.*.*` y excluye tags `v*.*.*-rc.*`. El paso final usa EAS Hosting con `web.output: static` en `app.json`.

## Pruebas

```bash
npx jest --runInBand --ci
npx tsc --noEmit
npx expo export --platform web
```

Maestro verifica que la pantalla inicial muestra Welcome y que se puede abrir Settings. La conexión GitHub se habilita desde los ajustes del proyecto en EAS y activa los triggers por push, PR y tags. No se guardan credenciales en el repositorio. La ejecución manual de `hello.yml` se intentó durante el tutorial, pero Windows no pudo empaquetar el repositorio padre debido a un symlink de otro proyecto; los archivos quedan preparados para correr con la integración GitHub o después de corregir el empaquetado del monorepo.

## Estructura

```text
Ej-tutorial2/
├── .eas/workflows/    # Flujos CI/CD del tutorial
├── .maestro/          # Flujos de pruebas E2E
├── __tests__/         # Prueba unitaria Jest de IDs nativos
├── assets/            # Iconos e imágenes de Expo
├── src/app/           # Rutas Expo Router
├── src/components/    # Componentes de interfaz
├── src/constants/     # Tema y constantes
├── app.json           # Configuración Expo y plataformas
├── eas.json           # Perfiles EAS Build / Update
└── package.json       # Dependencias y comandos
```
