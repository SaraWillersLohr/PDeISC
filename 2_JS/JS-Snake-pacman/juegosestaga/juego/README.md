# MSGames — Plataforma Arcade Multijugador

Plataforma de videojuegos arcade multijugador web adaptada con identidad propia y temática escolar/tecnológica. Este proyecto demuestra la integración de lógica de videojuegos autoritativa en tiempo real por sockets, modularización moderna, adaptabilidad móvil, diseño cyberpunk y persistencia local de clasificaciones.

---

## Juegos Incluidos

1. **Escape Escolar** (Inspirado en PacMan):
   - **Temática:** Recorrer las instalaciones escolares recolectando "tareas" (puntitos) mientras se elude a los directivos: *Lorena* (Vicedirectora), *Scaglione* (Director) y *Esteban* (Jefe de Área).
   - **Mecánica Especial:** Las "Horas Libres" (Power Pellets) vuelven vulnerables a los directivos para poder atraparlos con puntos progresivos (200 a 1600 pts).
   - **Personajes:** Selección entre *Sara* y *Male* con celebraciones personalizadas.
   - **Modo:** Cooperativo local (1PC) o Cooperativo online (Salas).

2. **Cable Rush** (Inspirado en Snake):
   - **Temática:** Controlar cables de red (*USB*, *HDMI*, *Ethernet*) para alimentarse de Datos, Energía y Nodos especiales, extendiendo su longitud.
   - **Mecánica Especial:** Powerups activos de Overclock (velocidad), Firewall (escudo/warp en muro), EMP (congelar rival) y Ghost Mode (atravesar cables).
   - **Modo:** Competitivo local (1PC) o Versus online (Salas).

---

## Tecnologías Utilizadas

### Frontend
- **HTML5 (Canvas y Semántica)**
- **CSS3 (Variables HSL, Efecto Neon Glow, Dark/Light Mode)**
- **Bootstrap 5** (Diseño y estructura modular responsive)
- **Vanilla JavaScript** (Manipulación del DOM, Web Audio API y física)

### Backend
- **Node.js**
- **Express** (Enrutamiento y servicio de activos)
- **Socket.IO** (Sincronización en tiempo real y arquitectura de salas)

### Persistencia
- **JSON** (Persistencia local en el servidor de las clasificaciones TOP 10 de manera aislada)

---

## Requisitos
- **Node.js** (versión 16 o superior recomendada)
- **npm** (incluido con Node.js)

---

## Instalación y Ejecución

1. **Clonar e Inicializar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor en el puerto 3000 (puerto obligatorio de la cátedra):**
   ```bash
   npm start
   ```
   *Si no tienes configurado el script de inicio, puedes lanzar:*
   ```bash
   node server.js
   ```

3. **Acceder a la aplicación:**
   Abre tu navegador e ingresa a: **`http://localhost:3000`**

4. **Probar Multijugador en Celulares / Multi-dispositivo:**
   - Asegúrate de estar conectado a la misma red WiFi que tu computadora.
   - Reemplaza `localhost` en el navegador del celular por la dirección IP local de tu computadora. Por ejemplo: `http://192.168.0.10:3000`.
   - Crea una sala en la PC (o celular) e introduce el código de 4 letras en la otra pantalla para iniciar la sincronización multijugador online realtime.
