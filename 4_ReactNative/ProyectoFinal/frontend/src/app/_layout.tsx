// defino la pila principal de pantallas móviles.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '../context/SessionContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
    <SessionProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f4f6f1' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="access" />
        <Stack.Screen name="(app)" />
      </Stack>
    </SessionProvider>
    </SafeAreaProvider>
  );
}
