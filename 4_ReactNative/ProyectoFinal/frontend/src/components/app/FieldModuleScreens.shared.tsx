// presento la estructura visual común para las pantallas de tareas y reproducción.
import { Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { s } from './FieldModuleStyles';

export function Frame({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle: string }>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[s.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView contentContainerStyle={[s.page, isDesktop && s.pageDesktop]} showsVerticalScrollIndicator={false}>
        <View style={[s.innerContainer, isDesktop && s.innerContainerDesktop]}>
          <Text style={[s.heading, { color: colors.textMain }]}>{title}</Text>
          <Text style={[s.subtitle, { color: colors.textMuted }]}>{subtitle.toUpperCase()}</Text>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
