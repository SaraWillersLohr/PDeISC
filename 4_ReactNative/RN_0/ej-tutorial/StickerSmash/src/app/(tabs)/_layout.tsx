import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';
import { useAppTheme } from '@/theme';

export default function TabLayout() {
  const { colors, isDark, toggleTheme } = useAppTheme();

  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '700' },
      headerShadowVisible: false,
      headerRight: () => (
        // El botón del encabezado cambia el modo sin agregar pantallas ni ajustes extra.
        <Pressable accessibilityRole="button" accessibilityLabel={isDark ? 'Activar modo claro' : 'Activar modo oscuro'} onPress={toggleTheme} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, marginRight: 8 }}>
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={colors.accent} />
          <Text style={{ color: colors.text, fontSize: 13 }}>{isDark ? 'Claro' : 'Oscuro'}</Text>
        </Pressable>
      ),
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.muted,
    }}>
      <Tabs.Screen name="index" options={{ title: 'StickerSmash', tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="about" options={{ title: 'About', tabBarIcon: ({ color, size }) => <Ionicons name="information-circle" color={color} size={size} /> }} />
    </Tabs>
  );
}
