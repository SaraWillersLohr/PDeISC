export async function getClimaMDP() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=-38.0004&longitude=-57.5562&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,wind_speed_10m&timezone=auto`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Error ${response.status}: ${errorBody.reason || response.statusText}`,
      );
    }

    const data = await response.json();

    if (data.current) {
      const { temperature_2m, relative_humidity_2m, wind_speed_10m } =
        data.current;
      return {
        temperatura: temperature_2m,
        humedad: relative_humidity_2m,
        viento: wind_speed_10m,
        lugar: "Mar del Plata (Open-Meteo)",
        resumen: temperature_2m > 20 ? "Calido" : "Fresco",
      };
    } else {
      return {
        error: "No se pudieron obtener los datos actuales de Open-Meteo.",
      };
    }
  } catch (error) {
    console.error("Error al obtener clima de Open-Meteo:", error.message);
    return { error: `No se pudo obtener el clima: ${error.message}` };
  }
}
