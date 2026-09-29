import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppTabs } from './src/navigation/AppTabs';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function Main() {
  const { isDark } = useTheme();
  return <><StatusBar style={isDark ? 'light' : 'dark'} /><AppTabs /></>;
}

export default function App() {
  return <SafeAreaProvider><ThemeProvider><Main /></ThemeProvider></SafeAreaProvider>;
}
