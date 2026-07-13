// obtener palabra según especialidad, excluyendo las ya jugadas
export async function obtenerPalabra(especialidad, excluidas = []) {
  const query = excluidas.length > 0 ? `?excluidas=${encodeURIComponent(excluidas.join(","))}` : "";
  const respuesta = await fetch(`/api/palabra/${especialidad}${query}`);

  if (!respuesta.ok) {
    throw new Error("No se pudo obtener la palabra");
  }

  return await respuesta.json();
}

// obtener ranking
export async function obtenerRanking() {
  const respuesta = await fetch("/api/scores");
  if (!respuesta.ok) {
    throw new Error("No se pudo obtener el ranking");
  }
  return await respuesta.json();
}

// guardar score (usando PUT)
export async function guardarScore(datos) {
  const respuesta = await fetch("/api/score", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    const errorData = await respuesta.json();
    throw new Error(errorData.error || "No se pudo guardar el score");
  }

  return await respuesta.json();
}
