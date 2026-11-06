# Mejoras móviles

- Calendario: siete columnas con ancho que evita desbordes por redondeo.
- Sanidad del administrador: encabezado sin una segunda página flexible vacía.
- Alta de animales: separación entre especie y raza y acciones que envuelven.
- Fechas: componente compartido con selector del sistema en Android/iOS y calendario HTML en web. Conserva AAAA-MM-DD.
- Validación común de solicitudes JSON: fechas reales, hechos no futuros y nombres con vocales sin cinco caracteres idénticos consecutivos. No determina significado de nombres.
- Alta y edición de animales: límites de carga (equinos 40, bovinos 30, ovinos 25, porcinos 30 años). Son reglas operativas, no máximos biológicos absolutos; otras especies no reciben un límite inventado.
- Servicios y nacimientos: fecha posterior o igual al nacimiento de la madre registrada.
- No se cambiaron rutas, permisos, endpoints ni operaciones de registro.

Referencias de longevidad: https://www.merckvetmanual.com/horse-owners/introduction-to-horses/description-and-physical-characteristics-of-horses y https://pmc.ncbi.nlm.nih.gov/articles/PMC7286991/

Validación: TypeScript sin errores. Lint detecta un error previo en PasswordRecoveryModal.tsx:26 (setState dentro de un efecto), ajeno a estas mejoras. Falta comprobación visual en dispositivo y APK. Build APK autorizado y enviado a Expo: https://expo.dev/accounts/sarawillers2306/projects/estanciaapp/builds/a1b815b1-cbb8-48c6-be28-125431fbcb00 .

