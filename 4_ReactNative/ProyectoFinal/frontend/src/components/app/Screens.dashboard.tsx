import { AppSectionIcon } from './AppSectionIcon';
// muestro los indicadores y accesos rápidos del inicio.
// presento los resúmenes y accesos principales según el perfil activo.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useLiveChanges } from '../../context/LiveChangesContext';
import { useTheme } from '../../context/ThemeContext';
import { getDashboard, type DashboardMetrics } from '../../services/productionApi';
import { listAnimals } from '../../services/livestockApi';
import { normalizeRole , Page , Header , roleLabel , SpeciesBarChart } from './Screens.shared';
import { getUserStatistics, type UserStatistics } from '../../services/organizationApi';
import { HealthScreen } from './Screens.health';
import { s } from './ScreensStyles';

export function HomeScreen() {
  const { session } = useSession();
  const revision = useLiveChanges();
  const { width, fontScale } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [speciesCounts, setSpeciesCounts] = useState<{ species: string; count: number }[]>([]);
  const [breedCountsLoaded, setBreedCountsLoaded] = useState(false);
  const [metricsError, setMetricsError] = useState('');
  const [userStatistics, setUserStatistics] = useState<UserStatistics | null>(null);
  const [teamError, setTeamError] = useState('');
  const [statisticsRetry, setStatisticsRetry] = useState(0);
  const role = normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno');
  const name = session?.usuario.nombre?.trim() || 'equipo';
  const isVet = role === 'veterinario';
  const isField = role === 'peon';
  const isManager = role === 'dueno';
  const isUserManager = role === 'gestor_usuarios';
  const isDesktop = Platform.OS === 'web' && width >= 860;
  // En celulares y con texto ampliado, una tarjeta por fila mantiene legibles los roles.
  const stackUserStatistics = width < 520 * Math.max(1, fontScale);
  const dashboardCopy = isUserManager ? 'Consultá los usuarios registrados y gestioná los accesos del equipo.' : isField ? 'Lo importante para las tareas y ganado de hoy.' : 'Monitoreo productivo y sanitario de la estancia.';
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  useEffect(() => {
    if (!session || !isManager) return;
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
  }, [session, isManager, revision]);

  useEffect(() => {
    if (!session || !isUserManager) return;
    let active = true;
    // Inicio consulta conteos reales y se actualiza al aprobar, desactivar o cambiar un rol.
    getUserStatistics(session)
      .then((statistics) => {
        if (!active) return;
        setUserStatistics(statistics);
        setTeamError('');
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setUserStatistics(null);
        setTeamError(friendlyErrorMessage(cause, 'No se pudieron cargar las estadísticas del equipo.'));
      });
    return () => { active = false; };
  }, [session, isUserManager, revision, statisticsRetry]);

  if (isVet) return <HealthScreen />;

  const roleNames: Record<string, string> = { dueno: 'Dueños', peon: 'Peones', veterinario: 'Veterinarios', gestor_usuarios: 'Gestores de usuarios' };
  const roleIcons: Record<string, keyof typeof Ionicons.glyphMap> = { dueno: 'key-outline', peon: 'leaf-outline', veterinario: 'medkit-outline', gestor_usuarios: 'people-outline' };
  // Mientras carga o falla la consulta no invento cifras ni reemplazo los datos con ceros.
  const teamStatistics = userStatistics ? [
    { label: 'Usuarios registrados', value: userStatistics.total, icon: 'people-outline' as const, note: 'Cuentas existentes en la estancia' },
    { label: 'Con acceso habilitado', value: userStatistics.activos, icon: 'checkmark-circle-outline' as const, note: 'Cuentas activas que pueden ingresar' },
    { label: 'Sin acceso habilitado', value: userStatistics.sin_acceso, icon: 'lock-closed-outline' as const, note: 'Cuentas desactivadas o pendientes de habilitación' },
    ...userStatistics.roles.map((entry) => ({
      label: roleNames[entry.rol] ?? roleLabel[entry.rol] ?? entry.rol,
      value: entry.total,
      icon: roleIcons[entry.rol] ?? 'person-outline' as const,
      note: `${entry.activos} con acceso · ${entry.sin_acceso} sin acceso`,
    })),
  ] : null;

  const statistics = metrics ? [
    { label: 'Crías del año', value: metrics.crias_ano, color: '#3d9458', icon: 'leaf-outline' as const, note: 'Nacimientos registrados', route: '/(app)/reproduccion' as const, destination: 'Reproducción' },
    { label: 'Hembras preñadas', value: metrics.hembras_prenadas, color: '#d9822b', icon: 'heart-circle-outline' as const, note: 'Diagnóstico confirmado', route: '/(app)/reproduccion' as const, destination: 'Reproducción' },
    { label: 'Servicios · 90 días', value: metrics.servicios_90_dias, color: '#3f78b8', icon: 'git-network-outline' as const, note: 'Actividad de monta', route: '/(app)/reproduccion' as const, destination: 'Reproducción' },
    { label: 'Ventas · año', value: metrics.ventas_ano, color: '#8a5c32', icon: 'pricetag-outline' as const, note: 'Animales dados de baja por venta', route: '/(app)/animals' as const, destination: 'Mis animales' },
    { label: 'Muertes · año', value: metrics.muertes_ano, color: '#9d3b3b', icon: 'heart-dislike-outline' as const, note: 'Muertes confirmadas', route: '/(app)/health' as const, destination: 'Sanidad y enfermería' },
    { label: role === 'dueno' ? 'Muertes pendientes' : 'Alertas sanitarias', value: role === 'dueno' ? metrics.muertes_pendientes : metrics.alertas_sanitarias, color: '#c74c3e', icon: 'alert-circle-outline' as const, note: 'Requieren atención', route: '/(app)/health' as const, destination: 'Sanidad y enfermería' },
  ] : [];

  return (
    <Page>
      <Header title={isManager || isUserManager ? `¡Hola, ${name}!` : 'Panel de Campo'} subtitle={`${roleLabel[role] ?? 'EQUIPO'} · ${today.toUpperCase()}`} />

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

      {isUserManager ? (
        <View style={[s.statsCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View>
            <Text style={[s.sectionTitle, { color: colors.textMain }]}>Estadísticas del equipo</Text>
            <Text style={[s.sectionCopy, { color: colors.textMuted }]}>Cuentas registradas por rol. Las solicitudes todavía sin aprobar se consultan en Equipo y Accesos.</Text>
          </View>
          {teamStatistics ? (
            <View style={[s.statsGrid, isDesktop && s.statsGridDesktop]}>
              {teamStatistics.map((item) => (
                <View key={item.label} style={[s.statBox, isDesktop && s.statBoxDesktop, stackUserStatistics && { flexBasis: '100%' }, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8faf7', borderColor: colors.borderLight }]}>
                  <View style={s.statBoxTop}>
                    <View style={[s.statIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#edf4ec' }]}>
                      <Ionicons color={colors.primary} name={item.icon} size={18} />
                    </View>
                    <Text style={[s.statBoxValue, { color: colors.textMain }]}>{item.value}</Text>
                  </View>
                  <Text style={[s.statBoxLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[s.statBoxNote, { color: colors.textMuted }]}>{item.note}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={teamError ? s.requestError : [s.sectionCopy, { color: colors.textMuted }]}>
              {teamError || 'Cargando estadísticas del equipo…'}
            </Text>
          )}
          {teamError ? (
            <Pressable accessibilityRole="button" onPress={() => setStatisticsRetry((current) => current + 1)} style={[s.smallBtn, { alignSelf: 'flex-start', backgroundColor: colors.bgCardMuted, marginTop: 12 }]}>
              <Text style={[s.smallBtnText, { color: colors.textMain }]}>Reintentar consulta</Text>
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => router.push('/(app)/team')} style={[s.primaryBtn, { backgroundColor: colors.primary, marginTop: 16 }]}>
            <Text style={s.primaryBtnText}>Ir a Equipo y Accesos</Text>
          </Pressable>
        </View>
      ) : null}

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
              { title: 'Ver animales', description: 'Consultá fichas, registrá pesajes y movimientos.', icon: 'horseshoe' as const, color: '#2d6a4f', route: '/(app)/animals' },
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
                  <AppSectionIcon color={item.color} name={item.icon} size={21} />
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
                  // Toda la estadística funciona como acceso al módulo, también con teclado.
                  <Pressable
                    key={item.label}
                    accessibilityRole="link"
                    accessibilityLabel={`${item.label}: ${item.value}. Abrir ${item.destination}`}
                    onPress={() => router.push(item.route)}
                    style={({ pressed }) => [s.statBox, isDesktop && s.statBoxDesktop, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8faf7', borderColor: colors.borderLight }, pressed && { opacity: 0.75 }]}
                  >
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
                    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 10 }}>
                      <Text style={{ color: colors.primary, flex: 1, fontSize: 13, fontWeight: '700' }}>Ver {item.destination}</Text>
                      <Ionicons name="arrow-forward" color={colors.primary} size={16} />
                    </View>
                  </Pressable>
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
