// comparto elementos visuales y validaciones de los inventarios ganaderos.
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { style } from './LivestockStyles';
import { ScrollToTop } from './ScrollToTop';

export function SpeciesFilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={onPress} style={[style.speciesChip, { backgroundColor: active ? colors.primary : colors.bgCard, borderColor: active ? colors.primary : colors.border }]}>
      <Text style={[style.speciesChipText, { color: active ? '#ffffff' : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

// presento estados de carga, error y contenido con refresco manual.
export function InventoryPage({
  title,
  subtitle,
  count,
  search,
  onSearch,
  loading,
  error,
  onRetry,
  onRefresh,
  refreshing,
  headerAction,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  search: string;
  onSearch: (value: string) => void;
  loading: boolean;
  error: string;
  onRetry: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const scrollToTop = useRef<() => void>(() => {});
  const [showScrollTop, setShowScrollTop] = useState(false);
  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) { setShowScrollTop(event.nativeEvent.contentOffset.y > 320); }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[style.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView
        ref={(instance) => { scrollToTop.current = () => instance?.scrollTo({ y: 0, animated: true }); }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[style.page, isDesktop && style.pageDesktop]}
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[style.innerWrapper, isDesktop && style.innerWrapperDesktop]}>
          <View style={[style.pageHead, isDesktop && style.pageHeadDesktop]}>
            <View>
              <Text style={[style.heading, { color: colors.textMain }]}>{title}</Text>
              <Text style={[style.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
            </View>
            <View style={style.countBadge}>
              <Text style={[style.countText, { color: colors.primary }]}>{count} registros</Text>
            </View>
          </View>

          {/* Search bar & Action Button */}
          <View style={[style.searchRow, isDesktop && style.searchRowDesktop]}>
            <View style={[style.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons color={colors.textMuted} name="search-outline" size={18} style={{ marginRight: 8 }} />
              <TextInput
                accessibilityLabel={`Buscar ${title.toLowerCase()}`}
                onChangeText={onSearch}
                placeholder={`Buscar en ${title.toLowerCase()}…`}
                placeholderTextColor={colors.textMuted}
                style={[style.searchInput, { color: colors.inputText }]}
                value={search}
              />
            </View>
            {headerAction}
          </View>

          {loading ? (
            <View style={style.message}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[style.detail, { color: colors.textMuted }]}>Cargando datos del establecimiento…</Text>
            </View>
          ) : error ? (
            <View style={[style.empty, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Ionicons color="#dc2626" name="alert-circle" size={32} />
              <Text style={[style.title, { color: colors.textMain, marginTop: 8 }]}>No se pudo cargar la información</Text>
              <Text style={[style.detail, { color: colors.textMuted }]}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={onRetry} style={[style.retry, { backgroundColor: colors.primary }]}>
                <Text style={style.retryText}>Reintentar conexión</Text>
              </Pressable>
            </View>
          ) : (
            children
          )}
        </View>
      </ScrollView>
      <ScrollToTop visible={showScrollTop} onPress={() => scrollToTop.current()} />
    </SafeAreaView>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[style.empty, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={[style.emptyIconWrap, { backgroundColor: colors.bgCardMuted }]}>
        <Ionicons color={colors.primary} name="file-tray-outline" size={28} />
      </View>
      <Text style={[style.title, { color: colors.textMain }]}>{title}</Text>
      <Text style={[style.detail, { color: colors.textMuted }]}>{text}</Text>
    </View>
  );
}

export function formatAnimalAge(value: string): string {
  const birth = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 'fecha no válida';
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years < 0) return 'fecha futura';
  if (years === 0 && months === 0) return 'menos de 1 mes';
  return [years ? `${years} ${years === 1 ? 'año' : 'años'}` : '', months ? `${months} ${months === 1 ? 'mes' : 'meses'}` : ''].filter(Boolean).join(' y ');
}

export function isValidBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= today;
}
