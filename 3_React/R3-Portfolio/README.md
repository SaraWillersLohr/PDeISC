# portfolio de sara willers löhr

portfolio de una sola página, orientado a desarrollo web y fotografía. la landing pública usa anchors; `/admin` es el único acceso adicional y funciona como un cms pequeño para gestionar el contenido.

## tecnologías

- react + typescript + vite en el cliente
- node.js + express + typescript en la api
- mariadb para contenido relacional
- motion (framer motion) para entradas, gestos, carrusel y modales

## instalación

1. copiar `.env.example` a `.env` y completar las credenciales locales.
2. ejecutar `npm install` desde la raíz.
3. ejecutar `database/migrations/001_initial.sql` en mariadb.
4. iniciar en desarrollo con `npm run dev`.
5. abrir `http://localhost:5173`; el panel está en `http://localhost:5173/admin`.

la contraseña inicial del panel es `cambiar-esta-clave-2026`. el usuario creado por la migración debe cambiarla al primer acceso. no se almacena en texto plano: la migración inserta su hash bcrypt. antes de desplegar, reemplazar `jwt_secret` y `admin_secret` por valores largos y únicos.

## estructura

```text
frontend/               landing, admin, hooks y componentes react
backend/src/             api rest, middleware de auth y conexión mariadb
backend/uploads/         imágenes subidas en desarrollo (no versionadas)
backend/database/migrations/  esquema y seed ejecutable
frontend/public/              fotografías originales proporcionadas
```

## api y seguridad

las rutas `get /api/portfolio` y las rutas de lectura son públicas. las mutaciones y las lecturas del cms requieren un token jwt obtenido en `post /api/admin/login`. el backend valida el acceso, por lo que la protección no depende del frontend. las imágenes cargadas validan mime type y tamaño máximo de 5 mb; se renombran con uuid y la base guarda únicamente su ruta.

## datos y normalización

el esquema evita una tabla gigante. `projects`, `technologies` y `project_technologies` resuelven la relación muchos-a-muchos sin listas separadas por comas. `skills` referencia `skill_categories`; cada entidad tiene una sola responsabilidad y claves primarias/foráneas, lo que permite cumplir 1nf, 2nf y 3nf. el contenido editorial está separado en `site_settings`, `photography`, `education`, `timeline_events`, `learning_items`, `objectives` y `social_links`.

## decisiones de interfaz

la estética combina una superficie editorial clara, acentos amarillo, naranja y azul, y fotografías reales de sara. el carrusel acepta botones, flechas de teclado, arrastre y swipe; pausa al pasar el cursor y respeta `prefers-reduced-motion`. el modo claro/oscuro se conserva en `localstorage`. las eliminaciones usan un modal y las operaciones muestran estados en línea, sin `alert`, `confirm` ni `prompt`.

## verificación

ejecutar `npm run build` para comprobar tipos y generar los builds de cliente y api. para una prueba completa es necesario tener mariadb configurado y ejecutar la migración.
