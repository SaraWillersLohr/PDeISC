// acá traigo los usuarios de la api externa
import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.7/+esm";

const API_URL = "https://jsonplaceholder.typicode.com/users";

// petición con fetch nativo
export async function obtenerUsuariosConFetch() {
  const respuesta = await fetch(API_URL);

  if (!respuesta.ok) {
    throw new Error(`Error fetch: ${respuesta.status} ${respuesta.statusText}`);
  }

  return respuesta.json();
}

// misma petición pero con axios para validar los datos
export async function obtenerUsuariosConAxios() {
  const respuesta = await axios.get(API_URL);
  return respuesta.data;
}
