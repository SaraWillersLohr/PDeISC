// inicio el flujo oauth del proveedor y entrego el código al backend para validarlo.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet } from 'react-native';
import { apiUrl } from '../config/api';
import { friendlyErrorMessage } from '../services/apiErrors';
import { socialLogin } from '../services/authApi';
import type { Session } from '../types/auth';

WebBrowser.maybeCompleteAuthSession();

type Provider = 'google' | 'facebook' | 'github';
const configuredSocialIds = Constants.expoConfig?.extra?.socialAuth as {
  googleClientIdWeb?: string; googleClientIdAndroid?: string; googleClientIdIos?: string; facebookAppId?: string; githubClientId?: string;
} | undefined;
// Expo reemplaza estas referencias públicas durante el bundle de EAS; las dejo como fallback
// si una actualización/manifiesto no expone extra.socialAuth en Constants.expoConfig.
const socialIds = {
  googleClientIdWeb: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || configuredSocialIds?.googleClientIdWeb,
  googleClientIdAndroid: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || configuredSocialIds?.googleClientIdAndroid,
  googleClientIdIos: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || configuredSocialIds?.googleClientIdIos,
  facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || configuredSocialIds?.facebookAppId || process.env.FACEBOOK_APP_ID || process.env.FACEBOOK_CLIENT_ID,
  githubClientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || configuredSocialIds?.githubClientId,
};
const config = {
  // El callback móvil es HTTPS en nuestro backend, así que Google debe recibir
  // el ID del cliente web, que es el tipo de cliente que admite esa URI.
  google: { label: 'Google', icon: 'google' as const, clientId: socialIds?.googleClientIdWeb, endpoint: 'https://accounts.google.com/o/oauth2/v2/auth', scopes: ['openid', 'email', 'profile'] },
  facebook: { label: 'Facebook', icon: 'facebook' as const, clientId: socialIds?.facebookAppId, endpoint: 'https://www.facebook.com/dialog/oauth', scopes: ['email', 'public_profile'] },
  github: { label: 'GitHub', icon: 'github' as const, clientId: socialIds?.githubClientId, endpoint: 'https://github.com/login/oauth/authorize', scopes: ['read:user', 'user:email'] },
};
// En EAS tomo el mismo host/base API que usa la app para evitar que el OAuth
// callback quede apuntando a un dominio viejo o distinto del backend desplegado.
const defaultSocialApiUrl = 'https://estanciaapp-api.onrender.com/api';
const socialCallbackBaseUri = (__DEV__
  ? process.env.EXPO_PUBLIC_SOCIAL_CALLBACK_BASE_URL || `${defaultSocialApiUrl}/auth`
  : `${(apiUrl || defaultSocialApiUrl).replace(/\/$/, '')}/auth`
).replace(/\/$/, '');

export function SocialLoginButton({ provider, disabled, compact = false, onSuccess, onError }: {
  provider: Provider; disabled: boolean; compact?: boolean; onSuccess: (session: Session) => Promise<void>; onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [oauthState] = useState(() => {
    const nonce = Crypto.randomUUID();
    return Platform.OS === 'web' && typeof window !== 'undefined'
      ? `web:${encodeURIComponent(window.location.origin)}:${nonce}`
      : nonce;
  });
  const item = config[provider];
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'estanciaapp', path: 'oauth/callback' });
  const [request, , promptAsync] = AuthSession.useAuthRequest({
    clientId: item.clientId ?? 'not-configured',
    redirectUri,
    state: oauthState,
    responseType: AuthSession.ResponseType.Code,
    scopes: item.scopes,
    usePKCE: provider !== 'facebook',
    extraParams: provider === 'facebook' ? { auth_type: 'rerequest' } : undefined,
  }, { authorizationEndpoint: item.endpoint });

  async function start(): Promise<void> {
    if (Platform.OS !== 'web' && Constants.expoVersion) {
      onError(`Para ingresar con ${item.label} necesitás una compilación de desarrollo. En Expo Go podés usar correo y contraseña.`);
      return;
    }
    if (!item.clientId) { onError(`Falta configurar el ID público de ${item.label}. Para un APK, agregá EXPO_PUBLIC_${provider === 'google' ? 'GOOGLE_CLIENT_ID_WEB' : provider === 'facebook' ? 'FACEBOOK_APP_ID' : 'GITHUB_CLIENT_ID'} al entorno preview de EAS y generá e instalá un APK nuevo; para desarrollo local, agregalo a frontend/.env.local.`); return; }
    if (!request?.url) return;
    setBusy(true);
    try {
      // Todos los proveedores vuelven al mismo callback HTTPS registrado.
      // El backend usa el state para devolver web a su origen o móvil al deep link.
      const providerRedirectUri = `${socialCallbackBaseUri}/${provider}/callback`;
      const authorizationUrl = new URL(request.url);
      authorizationUrl.searchParams.set('redirect_uri', providerRedirectUri);
      const result = await promptAsync({ url: authorizationUrl.toString() });
      if (result.type !== 'success') return;
      if (request.state && result.params.state !== request.state) throw new Error('La respuesta del proveedor no es válida. Volvé a intentar.');
      if (result.params.error) throw new Error('El proveedor canceló el inicio de sesión o no pudo autorizarlo.');
      const code = result.params.code;
      if (!code) throw new Error(`No se recibió una credencial válida de ${item.label}.`);
      const session = await socialLogin(provider, code, { redirectUri: providerRedirectUri, clientId: item.clientId!, codeVerifier: request.codeVerifier });
      await onSuccess(session);
    } catch (cause) {
      onError(friendlyErrorMessage(cause, `No se pudo iniciar sesión con ${item.label}.`));
    } finally { setBusy(false); }
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Continuar con ${item.label}`} disabled={disabled || busy} onPress={() => void start()} style={[styles.button, compact && styles.compactButton, (disabled || busy) && styles.disabled]}>
      {busy ? <ActivityIndicator color="#334239" size="small" /> : <MaterialCommunityIcons color={provider === 'facebook' ? '#1877f2' : provider === 'google' ? '#4285f4' : '#26332b'} name={item.icon} size={compact ? 21 : 25} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#dce3db', borderRadius: 30, borderWidth: 1, height: 58, justifyContent: 'center', width: 58 },
  compactButton: { borderRadius: 22, height: 44, width: 44 },
  disabled: { opacity: 0.55 },
});
