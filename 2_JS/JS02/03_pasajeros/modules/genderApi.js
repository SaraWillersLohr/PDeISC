const API_KEY = "5595820e63669ae1bb12fa9ccaf4c1b452e286efc0bc490b3ff689f2db0be357";

// Exporto estas funciones para usarlas en otros archivos
export const checkGender = async (name) => {
    try {
// Llamo a la API para traer datos
        const response = await fetch(`https://gender-api.com/get?name=${name}&key=${API_KEY}`);
        if (!response.ok) throw new Error("Error en la respuesta de la API");
        const data = await response.json();
        return data; // Estructura: { name, gender, accuracy, ... }
    } catch (error) {
        console.error("Error al validar con Gender-API:", error);
        return null;
    }
};
