// descubro el backend desde el host de Expo en desarrollo y uso url externa en producción.
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const apiPort = process.env.EXPO_PUBLIC_API_PORT?.trim() || '3010';
const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

// reutilizo el host del navegador o el hostUri de Expo Go para no fijar la ip del wifi.
function discoverDevelopmentHost(): string | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.hostname;
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  try { return new URL(`http://${hostUri}`).hostname.replace(/^\[|\]$/g, ''); }
  catch { return null; }
}

const developmentHost = __DEV__ ? discoverDevelopmentHost() : null;
export const apiUrl = developmentHost
  ? `http://${developmentHost}:${apiPort}/api`
  : configuredUrl;
