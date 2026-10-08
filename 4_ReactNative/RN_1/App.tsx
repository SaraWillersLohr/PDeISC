import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, SESSION_KEY } from './src/config/api';
import { LoginScreen } from './src/screens/LoginScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RegistrationScreen } from './src/screens/RegistrationScreen';
import { EmailVerificationScreen } from './src/screens/EmailVerificationScreen';
import { PasswordChangeScreen } from './src/screens/PasswordChangeScreen';
import { ApiError, changeInitialPasswordApi, getProfileApi, loginApi, registerApi, resendVerificationApi, verifyEmailApi } from './src/services/authApi';
import type { PublicUser } from './src/types/auth';

export default function App() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | 'verify'>('login');
  const [pendingEmail, setPendingEmail] = useState('');

  // Si se eligió recordar, restauramos el token seguro y pedimos el perfil vigente.
  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const token = await SecureStore.getItemAsync(SESSION_KEY);
        if (!token) return;
        const profile = await getProfileApi(token);
        if (mounted) {
          setToken(token);
          setUser(profile);
        }
      } catch (cause) {
        // Una respuesta de autenticación inválida revoca el dato local; un error de red no.
        if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) {
          await SecureStore.deleteItemAsync(SESSION_KEY);
        } else if (mounted) {
          setError('No se pudo validar la sesión guardada porque la API no está disponible. Se conserva la sesión para reintentar; conectate a la red de la estancia e ingresá de nuevo si hace falta.');
        }
      } finally {
        if (mounted) setBusy(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const signIn = async (email: string, password: string, remember: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const result = await loginApi(email, password);
      if (remember) await SecureStore.setItemAsync(SESSION_KEY, result.token);
      else await SecureStore.deleteItemAsync(SESSION_KEY);
      setToken(result.token);
      setEntered(false);
      setUser(result.usuario);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.';
      setError(message.toLowerCase().includes('network request failed')
        ? `No se pudo conectar con la API (${API_BASE_URL}). Revisá que esté encendida y que la URL sea accesible desde este dispositivo.`
        : message);
    } finally {
      setBusy(false);
    }
  };

  const startRegistration = async (data: { nombre: string; apellido: string; email: string; password: string }) => {
    setBusy(true); setError(null); setNotice(null);
    try {
      await registerApi(data);
      setPendingEmail(data.email); setAuthView('verify');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo registrar la cuenta.'); }
    finally { setBusy(false); }
  };

  const verifyEmail = async (code: string) => {
    setBusy(true); setError(null); setNotice(null);
    try {
      const message = await verifyEmailApi(pendingEmail, code);
      setAuthView('login'); setNotice(`${message} Podrás ingresar cuando el administrador la apruebe.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo verificar el correo.'); }
    finally { setBusy(false); }
  };

  const resendCode = async () => {
    setBusy(true); setError(null); setNotice(null);
    try { setNotice(await resendVerificationApi(pendingEmail)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo reenviar el código.'); }
    finally { setBusy(false); }
  };

  const changeInitialPassword = async (password: string) => {
    if (!token) return;
    setBusy(true); setError(null);
    try { setUser(await changeInitialPasswordApi(token, password)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cambiar la contraseña.'); }
    finally { setBusy(false); }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      setUser(null);
      setToken(null);
      setEntered(false);
      setError(null);
    } catch {
      Alert.alert('No se pudo cerrar la sesión', 'Volvé a intentarlo.');
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
          ? <RegistrationScreen busy={busy} error={error} onBack={() => { setAuthView('login'); setError(null); }} onSubmit={(data) => void startRegistration(data)} />
          : authView === 'verify'
            ? <EmailVerificationScreen email={pendingEmail} busy={busy} error={error} notice={notice} onBack={() => { setAuthView('login'); setError(null); }} onVerify={(code) => void verifyEmail(code)} onResend={() => void resendCode()} />
            : <LoginScreen onLogin={signIn} onRegisterPress={() => { setError(null); setNotice(null); setAuthView('register'); }} busy={busy} error={error} notice={notice} />}
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f5ef', gap: 12 },
  loadingText: { color: '#606960', fontSize: 14 },
  signedInHint: { position: 'absolute', bottom: 8, alignSelf: 'center', color: '#7a8278', fontSize: 11 },
});
