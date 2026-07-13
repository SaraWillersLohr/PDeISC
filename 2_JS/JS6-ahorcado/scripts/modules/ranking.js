import { obtenerRanking } from "./api.js";

export async function cargarRanking() {
  const tabla = document.getElementById("tablaRanking");
  if (!tabla) return;

  try {
    const ranking = await obtenerRanking();
    tabla.innerHTML = "";

    ranking.forEach((jugador) => {
      // Formatear tiempo en MM:SS
      const mins = Math.floor(jugador.tiempo / 60);
      const secs = jugador.tiempo % 60;
      const tiempoFormateado = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

      // Formatear especialidad
      const esp = jugador.especialidad.toLowerCase();
      const espText = esp === "mmo" ? "MMO" : (esp.charAt(0).toUpperCase() + esp.slice(1));

      tabla.innerHTML += `
        <tr>
            <td>${jugador.nombre}</td>
            <td>${espText}</td>
            <td>${jugador.puntos}</td>
            <td>${tiempoFormateado}</td>
            <td>${new Date(jugador.fecha).toLocaleDateString()}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error al cargar ranking:", error);
  }
}
