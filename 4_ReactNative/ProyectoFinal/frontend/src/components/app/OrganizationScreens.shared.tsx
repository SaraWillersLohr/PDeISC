// comparto la estructura visual de los módulos de organización.
import { Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { st } from './OrganizationStyles';

export function Screen({ title, children }: React.PropsWithChildren<{ title: string }>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[st.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView contentContainerStyle={[st.page, isDesktop && st.pageDesktop]} showsVerticalScrollIndicator={false}>
        <View style={[st.innerWrapper, isDesktop && st.innerWrapperDesktop]}>
          <Text style={[st.heading, { color: colors.textMain }]}>{title}</Text>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
