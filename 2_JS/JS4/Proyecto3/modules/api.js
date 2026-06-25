// acá hablo directo con la api externa para crear usuarios
import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.7/+esm";

const API_URL = "https://jsonplaceholder.typicode.com/users";

// acá mando los datos del formulario con fetch POST
export async function crearUsuarioConFetch(datos) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error(`Error fetch: ${respuesta.status}`);
  }

  const respuestaApi = await respuesta.json();
  return { enviado: datos, respuesta: respuestaApi };
}

// acá mando los mismos datos pero con axios POST
export async function crearUsuarioConAxios(datos) {
  const respuesta = await axios.post(API_URL, datos);
  return { enviado: datos, respuesta: respuesta.data };
}
