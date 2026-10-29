// Completo el popup web de OAuth; en móvil dejo que AuthSession capture el deep link.
import * as WebBrowser from 'expo-web-browser';
import { Platform, Text, View } from 'react-native';
import { Redirect } from 'expo-router';

if (Platform.OS === 'web') WebBrowser.maybeCompleteAuthSession();

export default function OAuthCallbackRoute() {
  if (Platform.OS === 'web') return <View><Text>Finalizando el inicio de sesión…</Text></View>;
  return <Redirect href="/" />;
}
