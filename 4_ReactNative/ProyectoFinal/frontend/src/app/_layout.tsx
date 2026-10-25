// defino la pila principal de pantallas móviles.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '../context/SessionContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
    <SessionProvider>
      <ThemeProvider>
      <AppNavigation />
      </ThemeProvider>
    </SessionProvider>
    </SafeAreaProvider>
  );
}

function AppNavigation() {
  const { isDark } = useTheme();
  return <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: isDark ? '#101b14' : '#f4f6f1' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="access" />
        <Stack.Screen name="recover" />
        <Stack.Screen name="(app)" />
      </Stack>
  </>;
}
