// comparto la estructura visual de los módulos de organización.
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { st } from './OrganizationStyles';
import { ScrollToTop } from './ScrollToTop';

export function Screen({ title, children }: React.PropsWithChildren<{ title: string }>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const scrollToTop = useRef<() => void>(() => {});
  const [showScrollTop, setShowScrollTop] = useState(false);
  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) { setShowScrollTop(event.nativeEvent.contentOffset.y > 320); }
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[st.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView ref={(instance) => { scrollToTop.current = () => instance?.scrollTo({ y: 0, animated: true }); }} onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={[st.page, isDesktop && st.pageDesktop]} showsVerticalScrollIndicator={false}>
        <View style={[st.innerWrapper, isDesktop && st.innerWrapperDesktop]}>
          <Text style={[st.heading, { color: colors.textMain }]}>{title}</Text>
          {children}
        </View>
      </ScrollView>
      <ScrollToTop visible={showScrollTop} onPress={() => scrollToTop.current()} />
    </SafeAreaView>
  );
}
