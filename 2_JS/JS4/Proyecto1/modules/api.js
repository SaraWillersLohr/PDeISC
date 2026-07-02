// acá traigo los usuarios de la api externa
import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.7/+esm";

const API_URL = "https://jsonplaceholder.typicode.com/users";

// petición con fetch nativo
export async function obtenerUsuariosConFetch() {
  const respuesta = await fetch(API_URL);
//fetch es una API nativa de javascript que se encarga de hacer peticiones a la api

  if (!respuesta.ok) {
    throw new Error(`Error fetch: ${respuesta.status} ${respuesta.statusText}`);
  }

  return respuesta.json();
}
//axios es una libreria de javascript que se encarga de hacer peticiones a la api
// misma petición pero con axios
export async function obtenerUsuariosConAxios() {
  const respuesta = await axios.get(API_URL);
  return respuesta.data;
}
