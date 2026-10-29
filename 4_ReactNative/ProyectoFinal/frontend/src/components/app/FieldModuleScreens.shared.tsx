// presento la estructura visual común para las pantallas de tareas y reproducción.
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { s } from './FieldModuleStyles';
import { ScrollToTop } from './ScrollToTop';

export function Frame({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle: string }>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const scrollToTop = useRef<() => void>(() => {});
  const [showScrollTop, setShowScrollTop] = useState(false);
  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) { setShowScrollTop(event.nativeEvent.contentOffset.y > 320); }
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[s.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView ref={(instance) => { scrollToTop.current = () => instance?.scrollTo({ y: 0, animated: true }); }} onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={[s.page, isDesktop && s.pageDesktop]} showsVerticalScrollIndicator={false}>
        <View style={[s.innerContainer, isDesktop && s.innerContainerDesktop]}>
          <Text style={[s.heading, { color: colors.textMain }]}>{title}</Text>
          <Text style={[s.subtitle, { color: colors.textMuted }]}>{subtitle.toUpperCase()}</Text>
          {children}
        </View>
      </ScrollView>
      <ScrollToTop visible={showScrollTop} onPress={() => scrollToTop.current()} />
    </SafeAreaView>
  );
}
