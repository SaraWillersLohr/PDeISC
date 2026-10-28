# Backend de EstanciaApp

Configurá `.env` con una base que ya tenga el esquema base. `../bd_final.sql` es un volcado con datos además de estructura: solo debe importarse en una base vacía cuando también se quieran cargar esas filas de ejemplo; no lo importes sobre una estancia con datos. La instalación de una base vacía sin registros de ejemplo todavía requiere preparar un volcado solo de estructura. Hacé una copia de seguridad antes de actualizar una base existente. Después ejecutá:

```sh
npm run db:migrate
npm run dev
```

`db:migrate` aplica y registra las migraciones aditivas para registro, movimientos, enfermería, módulos productivos, recuperación de contraseña, perfil, bajas, avisos, evolución veterinaria y sincronización offline idempotente. Se puede repetir sin duplicar cambios. No ejecuta scripts de limpieza ni cambia usuarios, contraseñas o roles. El cambio de `copropietario` a `administrador` sigue siendo una migración manual y requiere respaldo previo.

Si el inventario responde con un error, revisá la salida del backend: registra el código del error de base sin mostrar credenciales. Después de aplicar las migraciones, reintentá la carga del inventario.

La referencia de rutas y roles está en `../DOCUMENTACION_API.md`. El manual está en `../MANUAL_USUARIO.md`; la guía de APK está en `../GUIA_INSTALACION_APK.md`.
