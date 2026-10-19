import { ScrollViewStyleReset } from "expo-router/html";
import type { ReactNode } from "react";

// Define la página HTML que Expo Router genera al publicar la versión web.
// Expo solo usa este archivo en el servidor durante la exportación web; Android e iOS lo ignoran.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* Ajusta el desplazamiento web para que las pantallas ScrollView se comporten como en móvil. */}
        <ScrollViewStyleReset />

        {/* Aplica un fondo desde el primer render para reducir el destello al cambiar el tema del dispositivo. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Se pueden agregar aquí elementos globales del encabezado web, como metadatos adicionales. */}
      </head>
      <body>{children}</body>
    </html>
  );
}

// Mantiene el fondo de la página web acorde al tema del sistema antes de que cargue React Native Web.
const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
