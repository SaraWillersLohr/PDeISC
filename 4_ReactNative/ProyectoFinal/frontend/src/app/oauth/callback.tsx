// La sesión OAuth captura los parámetros del enlace; esta ruta evita que Expo Router muestre "Unmatched Route".
import { Redirect } from 'expo-router';

export default function OAuthCallbackRoute() {
  return <Redirect href="/" />;
}
