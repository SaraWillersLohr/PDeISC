import { obtenerRanking } from "./api.js";

export async function cargarRanking() {
  const tabla = document.getElementById("tablaRanking");
  if (!tabla) return;

  try {
    const ranking = await obtenerRanking();
    tabla.innerHTML = "";

    if (ranking.length === 0) {
      tabla.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted); font-style: italic;">
            Todavía no hay partidas registradas. ¡Sé el primero!
          </td>
        </tr>
      `;
      return;
    }

    ranking.forEach((jugador, idx) => {
      const mins = Math.floor(jugador.tiempo / 60);
      const secs = jugador.tiempo % 60;
      const tiempoFormateado = `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;

      const esp = jugador.especialidad.toLowerCase();
      const espText = esp === "mmo" ? "MMO" : (esp.charAt(0).toUpperCase() + esp.slice(1));

      const pos = idx + 1;
      let rowClass = "";
      if (pos === 1) rowClass = "rank-1";
      else if (pos === 2) rowClass = "rank-2";
      else if (pos === 3) rowClass = "rank-3";

      const fecha = new Date(jugador.fecha).toLocaleDateString("es-AR");

      tabla.innerHTML += `
        <tr class="${rowClass}">
          <td style="font-family: var(--font-title); font-weight: 700;">${pos}</td>
          <td style="font-weight: 600;">${jugador.nombre}</td>
          <td>${espText}</td>
          <td style="font-family: var(--font-title); font-weight: 700; color: var(--green);">${jugador.puntos}</td>
          <td>${tiempoFormateado}</td>
          <td style="color: var(--text-muted); font-size: 0.85rem;">${fecha}</td>
        </tr>
      `;
    });

  } catch (error) {
    console.error("Error al cargar ranking:", error);
    tabla.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 24px; color: var(--red); font-style: italic;">
          Error al cargar el ranking. Verificá la conexión con el servidor.
        </td>
      </tr>
    `;
  }
}
