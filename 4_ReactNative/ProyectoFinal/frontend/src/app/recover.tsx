// recupero una cuenta con código temporal y establezco una contraseña nueva.
import { Redirect } from 'expo-router';

// conservo la ruta para enlaces viejos y envío al usuario al ingreso.
export default function RecoverRoute() {
  return <Redirect href="/" />;
}
