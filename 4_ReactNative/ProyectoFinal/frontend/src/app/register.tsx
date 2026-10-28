import { Redirect } from 'expo-router';

// mantengo la ruta histórica y vuelvo al login, donde se abre la solicitud como modal.
export default function RegisterRoute() {
  return <Redirect href="/" />;
}
