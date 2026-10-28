import { Redirect } from 'expo-router';

// mantengo la ruta histórica y vuelvo al login, donde se abre la activación como modal.
export default function AccessRoute() {
  return <Redirect href="/" />;
}
