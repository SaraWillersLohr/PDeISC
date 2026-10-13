// Archivo App.tsx: el estado raíz, los flujos de autenticación, la navegación y el ciclo de sesión. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, SESSION_KEY } from './src/config/api';
import { LoginScreen } from './src/screens/LoginScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RegistrationScreen } from './src/screens/RegistrationScreen';
import { EmailVerificationScreen } from './src/screens/EmailVerificationScreen';
import { PasswordChangeScreen } from './src/screens/PasswordChangeScreen';
import { AccessTokenScreen } from './src/screens/AccessTokenScreen';
import { PasswordRecoveryScreen } from './src/screens/PasswordRecoveryScreen';
import { FeedbackProvider, useFeedback } from './src/components/FeedbackProvider';
import { ApiError, changeInitialPasswordApi, exchangeSocialCodeApi, getProfileApi, listSocialProvidersApi, loginApi, logoutApi, redeemAccessTokenApi, registerApi, requestPasswordRecoveryApi, resendAccessTokenApi, resendVerificationApi, resetPasswordApi, verifyEmailApi, type SocialProviderId } from './src/services/authApi';
import type { PublicUser } from './src/types/auth';
// Esta función recupera la sesión recordada desde sessionStorage en web o SecureStore en Android/iOS.
async function readSavedSession(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return typeof window === 'undefined' ? null : window.sessionStorage.getItem(SESSION_KEY); }
    catch { return null; }
  }
  return SecureStore.getItemAsync(SESSION_KEY);
}
// Esta función guarda el JWT de sesión en el almacenamiento correspondiente a la plataforma cuando la persona elige recordarla. Recibe token como entrada.
async function saveSession(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { if (typeof window !== 'undefined') window.sessionStorage.setItem(SESSION_KEY, token); } catch {
      // El navegador puede bloquear sessionStorage; en ese caso la sesión sigue activa en memoria.
    }
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, token);
}
// Esta función elimina el JWT local al cerrar sesión o cuando se debe descartar una sesión inválida.
async function clearSavedSession(): Promise<void> {
  if (Platform.OS === 'web') {
    try { if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY); } catch {
      // No se interrumpe el cierre de sesión si el navegador bloquea sessionStorage.
    }
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
// Esta función coordina app dentro de la aplicación: mantiene el estado necesario, ejecuta las acciones de usuario y determina qué pantalla se presenta.
export default function App() {
  return <FeedbackProvider><AppContent /></FeedbackProvider>;
}
// Esta función coordina app dentro de la aplicación: mantiene el estado necesario, ejecuta las acciones de usuario y determina qué pantalla se presenta.
function AppContent() {
  const { showMessage } = useFeedback();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | 'verify' | 'access' | 'recover'>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [socialProviders, setSocialProviders] = useState<SocialProviderId[]>([]);
  const handledSocialCallbacks = useRef(new Set<string>());

  // Si se eligió recordar, restauramos el token seguro y pedimos el perfil vigente.
  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const token = await readSavedSession();
        if (!token) return;
        const profile = await getProfileApi(token);
        if (mounted) {
          setToken(token);
          setUser(profile);
        }
      } catch (cause) {
        // Una respuesta de autenticación inválida revoca el dato local; un error de red no.
        if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) {
          await clearSavedSession();
        } else if (mounted) {
          setError('No se pudo validar la sesión guardada porque la API no está disponible. Se conserva la sesión para reintentar; conectate a la red de la estancia e ingresá de nuevo si hace falta.');
        }
      } finally {
        if (mounted) setBusy(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    void listSocialProvidersApi().then((providers) => { if (mounted) setSocialProviders(providers); }).catch(() => { if (mounted) setSocialProviders([]); });
    return () => { mounted = false; };
  }, []);
  // Esta función inicia sesión con correo y contraseña, guarda o elimina el JWT según la preferencia elegida y actualiza el perfil y el estado de navegación. Recibe email, password, remember como entrada.
  const signIn = async (email: string, password: string, remember: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const result = await loginApi(email, password);
      if (remember) await saveSession(result.token);
      else await clearSavedSession();
      setToken(result.token);
      setEntered(false);
      setUser(result.usuario);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.';
      setError(/network request failed|fetch failed|connectexception|failed to connect/i.test(message)
        ? `No se pudo conectar con la API (${API_BASE_URL}). Revisá que esté encendida y que la URL sea accesible desde este dispositivo.`
        : message);
    } finally {
      setBusy(false);
    }
  };
  // Esta función construye la URL OAuth con el proveedor, el modo de ingreso o registro y la preferencia de sesión; luego abre el proveedor en el navegador apropiado para la plataforma. Recibe provider, remember, mode como entrada.
  const startSocialLogin = (provider: SocialProviderId, remember: boolean, mode: 'login' | 'register' = 'login') => {
    setError(null); setNotice(null);
    const query = new URLSearchParams({ remember: remember ? '1' : '0', mode });
    if (Platform.OS !== 'web') query.set('redirect', 'estanciaapp://auth/callback');
    const url = `${API_BASE_URL}/auth/${provider}?${query.toString()}`;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.location.assign(url);
      return;
    }
    void Linking.openURL(url).catch((cause) => {
      setError(cause instanceof Error ? `No se pudo abrir el acceso con ${provider}: ${cause.message}` : 'No se pudo abrir el acceso social.');
    });
  };

  const completeSocialCallback = useCallback(async (callbackUrl: string) => {
    let parsed: URL;
    try { parsed = new URL(callbackUrl); } catch { return; }
    const code = parsed.searchParams.get('socialCode');
    const socialError = parsed.searchParams.get('socialError');
    const socialRegistered = parsed.searchParams.get('socialRegistered');
    if (!code && !socialError && socialRegistered !== '1') return;
    const uniqueValue = code ?? socialError ?? socialRegistered ?? '';
    if (handledSocialCallbacks.current.has(uniqueValue)) return;
    handledSocialCallbacks.current.add(uniqueValue);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.replaceState({}, '', parsed.pathname || '/');
    }
    const mode = parsed.searchParams.get('socialMode') === 'register' ? 'register' : 'login';
    setAuthView(mode);
    if (socialRegistered === '1') {
      setNotice('Solicitud creada y correo confirmado por el proveedor. El administrador debe aprobarla; después te llegará el token para ingresar.');
      setError(null); setBusy(false); return;
    }
    if (socialError) {
      setError(socialError); setBusy(false); return;
    }

    setBusy(true); setError(null); setNotice(null);
    try {
      const result = await exchangeSocialCodeApi(code!);
      if (result.rememberMe) await saveSession(result.token);
      else await clearSavedSession();
      setToken(result.token); setUser(result.usuario); setEntered(false);
      setNotice('Iniciaste sesión con tu cuenta social.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo completar el inicio de sesión social.');
    } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => { void completeSocialCallback(url); });
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      void completeSocialCallback(window.location.href);
    } else {
      void Linking.getInitialURL().then((url) => { if (url) void completeSocialCallback(url); }).catch(() => undefined);
    }
    return () => subscription.remove();
  }, [completeSocialCallback]);
  // Esta función envía los datos del formulario para crear una solicitud de registro y prepara la pantalla para ingresar el código recibido por correo. Recibe data como entrada.
  const startRegistration = async (data: { nombre: string; apellido: string; email: string; password: string }) => {
    setBusy(true); setError(null); setNotice(null);
    try {
      await registerApi(data);
      setPendingEmail(data.email); setAuthView('verify');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo registrar la cuenta.'); }
    finally { setBusy(false); }
  };
  // Esta función envía el código de verificación y comunica que el correo quedó confirmado mientras la solicitud espera aprobación administrativa. Recibe code como entrada.
  const verifyEmail = async (code: string) => {
    setBusy(true); setError(null); setNotice(null);
    try {
      const message = await verifyEmailApi(pendingEmail, code);
      setAuthView('login'); setNotice(`${message} Cuando el administrador apruebe el acceso, te enviaremos por correo el token para ingresar.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo verificar el correo.'); }
    finally { setBusy(false); }
  };
  // Esta función solicita otro código para verificar el correo y presenta el resultado de la operación en la interfaz.
  const resendCode = async () => {
    setBusy(true); setError(null); setNotice(null);
    try { setNotice(await resendVerificationApi(pendingEmail)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo reenviar el código.'); }
    finally { setBusy(false); }
  };
  // Esta función canjea el token enviado tras la aprobación, guarda la sesión si se pidió recordarla y lleva a la persona a la bienvenida o al cambio de contraseña inicial. Recibe email, accessToken, remember como entrada.
  const redeemAccessToken = async (email: string, accessToken: string, remember: boolean) => {
    setBusy(true); setError(null); setNotice(null);
    try {
      const result = await redeemAccessTokenApi(email, accessToken);
      if (remember) await saveSession(result.token);
      else await clearSavedSession();
      setToken(result.token); setUser(result.usuario); setEntered(false); setAuthView('login');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo canjear el token.';
      setError(/network request failed|fetch failed|connectexception|failed to connect/i.test(message)
        ? `No se pudo conectar con la API (${API_BASE_URL}). Revisá que esté encendida y que la URL sea accesible desde este dispositivo.`
        : message);
    } finally { setBusy(false); }
  };
  // Esta función solicita el reenvío del token de acceso para una cuenta aprobada que todavía no inició sesión. Recibe email como entrada.
  const resendAccessToken = async (email: string) => {
    setBusy(true); setError(null); setNotice(null);
    try { setNotice(await resendAccessTokenApi(email)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo reenviar el token.'); }
    finally { setBusy(false); }
  };

  // Pide un código de recuperación y conserva la respuesta neutra para que la interfaz no pueda enumerar cuentas.
  const requestRecoveryCode = async (email: string): Promise<boolean> => {
    setBusy(true); setError(null);
    try {
      setNotice(await requestPasswordRecoveryApi(email));
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo solicitar el código. Intentá de nuevo.');
      return false;
    } finally { setBusy(false); }
  };

  // Envía el código y la contraseña nueva; al completarse el servidor revoca los JWT anteriores.
  const completePasswordRecovery = async (email: string, code: string, password: string): Promise<boolean> => {
    setBusy(true); setError(null);
    try {
      setNotice(await resetPasswordApi(email, code, password));
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar la contraseña.');
      return false;
    } finally { setBusy(false); }
  };
  // Esta función cambia la contraseña inicial usando la sesión autenticada y actualiza el perfil que mantiene la app. Recibe password como entrada.
  const changeInitialPassword = async (password: string) => {
    if (!token) return;
    setBusy(true); setError(null);
    try { setUser(await changeInitialPasswordApi(token, password)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cambiar la contraseña.'); }
    finally { setBusy(false); }
  };
  // Esta función elimina el token local y limpia el usuario y los estados de navegación para volver a la pantalla de ingreso.
  const signOut = async () => {
    let serverRevoked = false;
    try {
      if (token) { await logoutApi(token); serverRevoked = true; }
    } catch {
      // Aunque no haya conexión para revocar el JWT, se borra la copia local y se informa que la revocación remota quedó pendiente.
    }
    try {
      await clearSavedSession();
      setUser(null);
      setToken(null);
      setEntered(false);
      setError(null);
      if (token && !serverRevoked) showMessage('Sesión cerrada en este dispositivo', 'No se pudo contactar la API para revocar las sesiones guardadas. Volvé a conectarte e iniciá sesión para comprobar el estado.', 'info');
    } catch {
      showMessage('No se pudo cerrar la sesión', 'Volvé a intentarlo.', 'error');
    }
  };

  if (busy && !user) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#315a3c" /><Text style={styles.loadingText}>Conectando con tu sesión…</Text></View>;
  }

  return (
    <View style={styles.app}>
      <StatusBar barStyle="dark-content" />
      {user && token
        ? user.debe_cambiar_password
          ? <PasswordChangeScreen busy={busy} error={error} onSubmit={(password) => void changeInitialPassword(password)} />
          : entered
            ? <HomeScreen user={user} token={token} onLogout={() => void signOut()} />
            : <WelcomeScreen user={user} onContinue={() => setEntered(true)} onLogout={() => void signOut()} />
        : authView === 'register'
          ? <RegistrationScreen busy={busy} error={error} socialProviders={socialProviders} onSocialRegister={(provider) => startSocialLogin(provider, false, 'register')} onBack={() => { setAuthView('login'); setError(null); }} onSubmit={(data) => void startRegistration(data)} />
          : authView === 'verify'
            ? <EmailVerificationScreen email={pendingEmail} busy={busy} error={error} notice={notice} onBack={() => { setAuthView('login'); setError(null); }} onVerify={(code) => void verifyEmail(code)} onResend={() => void resendCode()} />
            : authView === 'access'
              ? <AccessTokenScreen initialEmail={accessEmail} busy={busy} error={error} notice={notice}
                onBack={() => { setAuthView('login'); setError(null); setNotice(null); }}
                onRedeem={(email, accessToken, remember) => void redeemAccessToken(email, accessToken, remember)}
                onResend={(email) => void resendAccessToken(email)} />
              : authView === 'recover'
                ? <PasswordRecoveryScreen initialEmail={recoveryEmail} busy={busy} error={error} onRequestCode={requestRecoveryCode} onResetPassword={completePasswordRecovery} onBack={() => { setAuthView('login'); setError(null); setNotice(null); }} />
                : <LoginScreen onLogin={signIn} socialProviders={socialProviders} onSocialLogin={startSocialLogin}
                onAccessTokenPress={(email) => { setAccessEmail(email); setError(null); setNotice(null); setAuthView('access'); }}
                onRecoveryPress={(email) => { setRecoveryEmail(email); setError(null); setNotice(null); setAuthView('recover'); }}
                onRegisterPress={() => { setError(null); setNotice(null); setAuthView('register'); }} busy={busy} error={error} notice={notice} />}
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f5ef', gap: 12 },
  loadingText: { color: '#606960', fontSize: 14 },
  signedInHint: { position: 'absolute', bottom: 8, alignSelf: 'center', color: '#7a8278', fontSize: 11 },
});
