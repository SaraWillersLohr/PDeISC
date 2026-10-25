import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet } from 'react-native';
import { socialLogin } from '../services/authApi';
import type { Session } from '../types/auth';

WebBrowser.maybeCompleteAuthSession();

type Provider = 'google' | 'facebook' | 'github';
const socialIds = Constants.expoConfig?.extra?.socialAuth as {
  googleClientIdWeb?: string; googleClientIdAndroid?: string; googleClientIdIos?: string; facebookAppId?: string; githubClientId?: string;
} | undefined;
const config = {
  google: { label: 'Google', icon: 'google' as const, clientId: Platform.select({ web: socialIds?.googleClientIdWeb, android: socialIds?.googleClientIdAndroid || socialIds?.googleClientIdWeb, ios: socialIds?.googleClientIdIos || socialIds?.googleClientIdWeb }), endpoint: 'https://accounts.google.com/o/oauth2/v2/auth', scopes: ['openid', 'email', 'profile'] },
  facebook: { label: 'Facebook', icon: 'facebook' as const, clientId: socialIds?.facebookAppId, endpoint: 'https://www.facebook.com/dialog/oauth', scopes: ['email', 'public_profile'] },
  github: { label: 'GitHub', icon: 'github' as const, clientId: socialIds?.githubClientId, endpoint: 'https://github.com/login/oauth/authorize', scopes: ['read:user', 'user:email'] },
};

export function SocialLoginButton({ provider, disabled, compact = false, onSuccess, onError }: {
  provider: Provider; disabled: boolean; compact?: boolean; onSuccess: (session: Session) => Promise<void>; onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const item = config[provider];
  const redirectUri = process.env.EXPO_PUBLIC_SOCIAL_REDIRECT_URI || AuthSession.makeRedirectUri({ scheme: 'estanciaapp' });
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
    if (!item.clientId) { onError(`Falta configurar el ID público de ${item.label} en frontend/.env.local.`); return; }
    if (!request) return;
    setBusy(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success') return;
      if (request.state && result.params.state !== request.state) throw new Error('La respuesta del proveedor no es válida. Volvé a intentar.');
      const code = result.params.code;
      if (!code) throw new Error(`No se recibió una credencial válida de ${item.label}.`);
      const session = await socialLogin(provider, code, { redirectUri, clientId: item.clientId!, codeVerifier: request.codeVerifier });
      await onSuccess(session);
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : `No se pudo iniciar sesión con ${item.label}.`);
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
