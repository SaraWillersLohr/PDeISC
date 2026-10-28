// muestro los indicadores y accesos rápidos del inicio.
// presento los resúmenes y accesos principales según el perfil activo.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { getDashboard, type DashboardMetrics } from '../../services/productionApi';
import { listAnimals } from '../../services/livestockApi';
import { normalizeRole , Page , Header , roleLabel , SpeciesBarChart } from './Screens.shared';
import { HealthScreen } from './Screens.health';
import { s } from './ScreensStyles';

export function HomeScreen() {
  const { session } = useSession();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [speciesCounts, setSpeciesCounts] = useState<{ species: string; count: number }[]>([]);
  const [breedCountsLoaded, setBreedCountsLoaded] = useState(false);
  const [metricsError, setMetricsError] = useState('');
  const role = normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno');
  const name = session?.usuario.nombre?.trim() || 'equipo';
  const isVet = role === 'veterinario';
  const isField = role === 'peon';
  const isManager = role === 'administrador' || role === 'dueno';
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const dashboardCopy = isVet ? 'Controles y seguimiento de animales en enfermería.' : isField ? 'Lo importante para las tareas y ganado de hoy.' : 'Monitoreo productivo y sanitario de la estancia.';
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  useEffect(() => {
    if (!session || isField || isVet) return;
    let active = true;
    getDashboard(session).then((data) => { if (active) setMetrics(data); }).catch((cause: unknown) => { if (active) setMetricsError(friendlyErrorMessage(cause, 'No se pudieron cargar las estadísticas.')); });
    listAnimals(session).then((animals) => {
      if (!active) return;
      const counts = new Map<string, number>();
      animals.filter((animal) => animal.activo === 1).forEach((animal) => {
        counts.set(animal.especie, (counts.get(animal.especie) ?? 0) + 1);
      });
      setSpeciesCounts([...counts.entries()].map(([species, count]) => ({ species, count })).sort((a, b) => b.count - a.count || a.species.localeCompare(b.species, 'es')));
      setBreedCountsLoaded(true);
    }).catch((cause: unknown) => { if (active) { setBreedCountsLoaded(true); setMetricsError(friendlyErrorMessage(cause, 'No se pudieron cargar los animales por raza.')); } });
    return () => { active = false; };
  }, [session, isField, isVet]);

  if (isVet) return <HealthScreen />;

  const statistics = metrics ? [
    { label: 'Crías del año', value: metrics.crias_ano, color: '#3d9458', icon: 'leaf-outline' as const, note: 'Nacimientos registrados' },
    { label: 'Hembras preñadas', value: metrics.hembras_prenadas, color: '#d9822b', icon: 'heart-circle-outline' as const, note: 'Diagnóstico confirmado' },
    { label: 'Servicios · 90 días', value: metrics.servicios_90_dias, color: '#3f78b8', icon: 'git-network-outline' as const, note: 'Actividad de monta' },
    { label: 'Ventas · año', value: metrics.ventas_ano, color: '#8a5c32', icon: 'pricetag-outline' as const, note: 'Animales dados de baja por venta' },
    { label: 'Muertes · año', value: metrics.muertes_ano, color: '#9d3b3b', icon: 'heart-dislike-outline' as const, note: 'Muertes confirmadas' },
    { label: role === 'administrador' ? 'Muertes pendientes' : 'Alertas sanitarias', value: role === 'administrador' ? metrics.muertes_pendientes : metrics.alertas_sanitarias, color: '#c74c3e', icon: 'alert-circle-outline' as const, note: 'Requieren atención' },
  ] : [];

  return (
    <Page>
      <Header title={isManager ? `¡Hola, ${name}!` : 'Panel de Campo'} subtitle={`${roleLabel[role] ?? 'EQUIPO'} · ${today.toUpperCase()}`} />

      {/* Agro Welcome Banner */}
      <View style={[s.welcome, isDark && s.welcomeDark]}>
        <View style={{ flex: 1 }}>
          <View style={s.welcomeTag}>
            <Text style={s.welcomeEyebrow}>{roleLabel[role] ?? 'Equipo de estancia'}</Text>
          </View>
          <Text style={s.welcomeTitle}>Buen día, {name}</Text>
          <Text style={s.welcomeCopy}>{dashboardCopy}</Text>
        </View>
        <View style={s.welcomeIconWrap}>
          <Ionicons color="#fde047" name="sunny" size={36} />
        </View>
      </View>

      {isField ? (
        <View style={s.fieldShortcuts}>
          <View style={s.sectionHead}>
            <View>
              <Text style={[s.sectionTitle, { color: colors.textMain }]}>Accesos rápidos</Text>
              <Text style={[s.sectionCopy, { color: colors.textMuted }]}>Lo que necesitás para el trabajo de campo</Text>
            </View>
            <Ionicons color={colors.primary} name="flash-outline" size={20} />
          </View>
          <View style={[s.actionGrid, isDesktop && s.actionGridDesktop]}>
            {[
              { title: 'Ver animales', description: 'Consultá fichas, registrá pesajes y movimientos.', icon: 'paw-outline' as const, color: '#2d6a4f', route: '/(app)/animals' },
              { title: 'Mis tareas', description: 'Revisá pendientes y actualizá su estado.', icon: 'checkbox-outline' as const, color: '#366aa1', route: '/(app)/tasks' },
              { title: 'Mi estancia', description: 'Ubicá corrales y consultá el establecimiento.', icon: 'home-outline' as const, color: '#b06d2c', route: '/(app)/estate' },
              { title: 'Reproducción', description: 'Accedé a servicios, diagnósticos y nacimientos.', icon: 'git-branch-outline' as const, color: '#6a4d95', route: '/(app)/reproduccion' },
            ].map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.title}
                onPress={() => router.push(item.route as never)}
                style={({ pressed }) => [s.actionCard, isDesktop && s.actionCardWide, { backgroundColor: colors.bgCard, borderColor: colors.border }, pressed && s.actionCardPressed]}
              >
                <View style={[s.actionIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : `${item.color}16` }]}>
                  <Ionicons color={item.color} name={item.icon} size={21} />
                </View>
                <Text style={[s.actionTitle, { color: colors.textMain }]}>{item.title}</Text>
                <Text style={[s.actionDescription, { color: colors.textMuted }]}>{item.description}</Text>
                <Ionicons color={colors.textMuted} name="arrow-forward" size={16} style={s.actionArrow} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {/* Animal counts by species */}
      {isManager ? (
        <View style={[s.statsCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={s.sectionHead}>
            <View>
              <Text style={[s.sectionTitle, { color: colors.textMain }]}>Animales por especie</Text>
              <Text style={[s.sectionCopy, { color: colors.textMuted }]}>Cantidad de animales activos</Text>
            </View>
            <View style={s.dateChip}><Text style={s.dateChipText}>{speciesCounts.reduce((sum, item) => sum + item.count, 0)} ANIMALES</Text></View>
          </View>
          {speciesCounts.length ? <SpeciesBarChart data={speciesCounts} isDark={isDark} textColor={colors.textMuted} /> : <Text style={[s.sectionCopy, { color: colors.textMuted }]}>{breedCountsLoaded ? 'Todavía no hay animales activos para mostrar.' : 'Cargando animales por especie…'}</Text>}
        </View>
      ) : null}

      {/* Productive statistics below the breed chart */}
      {isManager ? (
        <View style={[s.statsCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={s.sectionHead}>
            <View>
              <Text style={[s.sectionTitle, { color: colors.textMain }]}>Estadísticas Productivas</Text>
              <Text style={[s.sectionCopy, { color: colors.textMuted }]}>Resumen actual del establecimiento</Text>
            </View>
            <View style={s.dateChip}>
              <Text style={s.dateChipText}>HOY</Text>
            </View>
          </View>

          {statistics.length ? (
            <View style={[s.statsGrid, isDesktop && s.statsGridDesktop]}>
              {statistics.map((item) => {
                const max = Math.max(1, ...statistics.map((entry) => entry.value));
                return (
                  <View key={item.label} style={[s.statBox, isDesktop && s.statBoxDesktop, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8faf7', borderColor: colors.borderLight }]}>
                    <View style={s.statBoxTop}>
                      <View style={[s.statIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#edf4ec' }]}>
                        <Ionicons color={item.color} name={item.icon} size={18} />
                      </View>
                      <Text style={[s.statBoxValue, { color: colors.textMain }]}>{item.value}</Text>
                    </View>
                    <Text style={[s.statBoxLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                    <View style={s.statTrack}>
                      <View style={[s.statBar, { backgroundColor: item.color, width: `${Math.max(item.value > 0 ? 10 : 0, (item.value / max) * 100)}%` }]} />
                    </View>
                    <Text style={[s.statBoxNote, { color: colors.textMuted }]}>{item.note}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={[s.sectionCopy, { color: colors.textMuted }]}>Cargando estadísticas productivas…</Text>
          )}
        </View>
      ) : null}

      {metricsError ? <Text style={s.requestError}>{metricsError}</Text> : null}

    </Page>
  );
}
