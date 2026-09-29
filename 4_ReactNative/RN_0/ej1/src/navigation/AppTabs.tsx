import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { ThemeButton } from '../components/ThemeButton';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { StylesScreen } from '../screens/StylesScreen';

type TabRoutes = { Inicio: undefined; Estilos: undefined };
const Tabs = createBottomTabNavigator<TabRoutes>();

export function AppTabs() {
  const { palette, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...base,
        colors: {
          ...base.colors,
          background: palette.background,
          card: palette.surface,
          text: palette.text,
          border: palette.border,
          primary: palette.accent,
        },
      }}
    >
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          headerRight: () => <ThemeButton />,
          headerStyle: {
            backgroundColor: palette.background,
            borderBottomColor: palette.border,
            borderBottomWidth: 1,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 19,
            color: palette.text,
          },
          headerShadowVisible: false,
          tabBarActiveTintColor: palette.accent,
          tabBarInactiveTintColor: palette.secondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            marginBottom: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopColor: palette.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 66,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 26 : 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: isDark ? 0.25 : 0.06,
            shadowRadius: 10,
            elevation: 8,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={
                route.name === 'Inicio'
                  ? (focused ? 'home' : 'home-outline')
                  : (focused ? 'color-palette' : 'color-palette-outline')
              }
              color={color}
              size={size}
            />
          ),
        })}
      >
        <Tabs.Screen
          name="Inicio"
          component={HomeScreen}
          options={{
            headerTitle: 'Mi Proyecto',
          }}
        />
        <Tabs.Screen
          name="Estilos"
          component={StylesScreen}
          options={{
            headerShown: false,
          }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}

