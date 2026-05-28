// Yo uso esta API KEY para conectar con Gender-API y determinar el género de un nombre
const API_KEY =
  "5595820e63669ae1bb12fa9ccaf4c1b452e286efc0bc490b3ff689f2db0be357";

// Yo exporto esta función para usarla en otros archivos del proyecto
export const checkGender = async (name) => {
  try {
    // Yo llamo a la API externa para obtener datos sobre el género del nombre
    const response = await fetch(
      `https://gender-api.com/get?name=${name}&key=${API_KEY}`,
    );
    if (!response.ok) throw new Error("Error en la respuesta de la API");
    const data = await response.json();
    return data; // Estructura: { name, gender, accuracy, ... }
  } catch (error) {
    // Si hay error, lo registro en consola y devuelvo null
    console.error("Error al validar con Gender-API:", error);
    return null;
  }
};
