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

        {/* Aplica el fondo del catálogo desde el primer render para evitar un destello blanco. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// Usa el mismo fondo claro del catálogo antes de que cargue React Native Web.
const responsiveBackground = `
body {
  margin: 0;
  background-color: #F4F7F6;
}`;
