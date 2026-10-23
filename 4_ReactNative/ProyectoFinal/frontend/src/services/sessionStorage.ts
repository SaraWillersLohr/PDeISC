// guardo y recupero la sesión mediante el almacenamiento cifrado del dispositivo.
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Session } from '../types/auth';

const sessionKey = 'estancia_app_session';

// persisto los tokens y el perfil después de un inicio de sesión correcto.
export async function saveSession(session: Session): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage.setItem(sessionKey, JSON.stringify(session));
    return;
  }
  await SecureStore.setItemAsync(sessionKey, JSON.stringify(session));
}

// recupero la sesión previamente guardada cuando se vuelve a abrir la app.
export async function getSession(): Promise<Session | null> {
  const serializedSession = Platform.OS === 'web'
    ? globalThis.localStorage.getItem(sessionKey)
    : await SecureStore.getItemAsync(sessionKey);

  return serializedSession ? (JSON.parse(serializedSession) as Session) : null;
}

// elimino los tokens del dispositivo al cerrar sesión.
export async function removeSession(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage.removeItem(sessionKey);
    return;
  }
  await SecureStore.deleteItemAsync(sessionKey);
}
