import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerStyle: { backgroundColor: '#25292e' }, headerTintColor: '#fff', tabBarStyle: { backgroundColor: '#25292e' }, tabBarActiveTintColor: '#ffd33d' }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="about" options={{ title: 'About', tabBarIcon: ({ color, size }) => <Ionicons name="information-circle" color={color} size={size} /> }} />
    </Tabs>
  );
}
