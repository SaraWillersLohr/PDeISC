// acá traigo los datos de mi propia api
import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.7/+esm";

const API_EMPLEADOS = "/api/empleados";

// petición con fetch nativo
export async function obtenerEmpleadosConFetch() {
  const respuesta = await fetch(API_EMPLEADOS);

  if (!respuesta.ok) {
    let mensaje = `Error fetch: ${respuesta.status}`;
    try {
      const error = await respuesta.json();
      if (error.error) mensaje = error.error;
    } catch {
      // si no viene json, uso el mensaje por defecto
    }
    throw new Error(mensaje);
  }

  return respuesta.json();
}

// misma petición pero con axios
export async function obtenerEmpleadosConAxios() {
  const respuesta = await axios.get(API_EMPLEADOS);
  return respuesta.data;
}
