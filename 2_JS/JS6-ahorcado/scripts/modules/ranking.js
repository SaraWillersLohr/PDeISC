import { obtenerRanking } from "./api.js";

export async function cargarRanking() {
  const tabla = document.getElementById("tablaRanking");

  const ranking = await obtenerRanking();

  tabla.innerHTML = "";

  ranking.forEach((jugador) => {
    tabla.innerHTML += `
                <tr>
                    <td>${jugador.nombre}</td>
                    <td>${jugador.especialidad}</td>
                    <td>${jugador.puntos}</td>
                    <td>${jugador.tiempo}</td>
                    <td>${new Date(jugador.fecha).toLocaleDateString()}
                    </td>
                </tr>
            `;
  });
}
