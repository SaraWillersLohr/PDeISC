// inicio el flujo oauth del proveedor y entrego el código al backend para validarlo.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet } from 'react-native';
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
  facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || configuredSocialIds?.facebookAppId,
  githubClientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || configuredSocialIds?.githubClientId,
};
const config = {
  google: { label: 'Google', icon: 'google' as const, clientId: Platform.select({ web: socialIds?.googleClientIdWeb, android: socialIds?.googleClientIdAndroid || socialIds?.googleClientIdWeb, ios: socialIds?.googleClientIdIos || socialIds?.googleClientIdWeb }), endpoint: 'https://accounts.google.com/o/oauth2/v2/auth', scopes: ['openid', 'email', 'profile'] },
  facebook: { label: 'Facebook', icon: 'facebook' as const, clientId: socialIds?.facebookAppId, endpoint: 'https://www.facebook.com/dialog/oauth', scopes: ['email', 'public_profile'] },
  github: { label: 'GitHub', icon: 'github' as const, clientId: socialIds?.githubClientId, endpoint: 'https://github.com/login/oauth/authorize', scopes: ['read:user', 'user:email'] },
};
const socialCallbackBaseUri = (process.env.EXPO_PUBLIC_SOCIAL_CALLBACK_BASE_URL || 'https://estanciaapp-api.onrender.com/api/auth').replace(/\/$/, '');

export function SocialLoginButton({ provider, disabled, compact = false, onSuccess, onError }: {
  provider: Provider; disabled: boolean; compact?: boolean; onSuccess: (session: Session) => Promise<void>; onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const item = config[provider];
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'estanciaapp', path: 'oauth/callback' });
  const [request, , promptAsync] = AuthSession.useAuthRequest({
    clientId: item.clientId ?? 'not-configured',
    redirectUri,
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
    if (!item.clientId) { onError(`Esta versión no incluye el ID público de ${item.label}. Configurá EXPO_PUBLIC_${provider === 'google' ? 'GOOGLE_CLIENT_ID_WEB' : provider === 'facebook' ? 'FACEBOOK_APP_ID' : 'GITHUB_CLIENT_ID'} en EAS (entorno preview) y generá e instalá un APK nuevo.`); return; }
    if (!request?.url) return;
    setBusy(true);
    try {
      const providerRedirectUri = Platform.OS === 'web' ? redirectUri : `${socialCallbackBaseUri}/${provider}/callback`;
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
