// acá traigo y elimino datos de mi propia api
import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.7/+esm";

const API_EMPLEADOS = "/api/empleados";

// petición GET con fetch nativo — hay que convertir la respuesta con .json()
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

// misma petición GET pero con axios — la respuesta ya viene en respuesta.data
export async function obtenerEmpleadosConAxios() {
  const respuesta = await axios.get(API_EMPLEADOS);
  return respuesta.data;
}

// petición DELETE con fetch — le mando el id en la URL y el método DELETE
export async function eliminarEmpleadoConFetch(id) {
  const respuesta = await fetch(`${API_EMPLEADOS}/${id}`, {
    method: "DELETE",
  });

  if (!respuesta.ok) {
    let mensaje = `Error fetch DELETE: ${respuesta.status}`;
    try {
      const error = await respuesta.json();
      if (error.error) mensaje = error.error;
    } catch {}
    throw new Error(mensaje);
  }

  return respuesta.json();
}

// misma petición DELETE pero con axios
export async function eliminarEmpleadoConAxios(id) {
  const respuesta = await axios.delete(`${API_EMPLEADOS}/${id}`);
  return respuesta.data;
}
