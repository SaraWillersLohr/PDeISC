// conecto los accesos de navegación con animales, tareas y sanidad.
// presento los resúmenes y accesos principales según el perfil activo.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimalsInventoryScreen, NursingScreen } from './LivestockScreens';
import { TasksManagerScreen } from './FieldModuleScreens';
import { listPendingDeaths, reviewDeath, type DeathReport } from '../../services/productionApi';
import { useMyRole , Page , Header } from './Screens.shared';
import { s } from './ScreensStyles';

export function AnimalsScreen() {
  const role = useMyRole();
  if (role === 'veterinario') return <HealthScreen />;
  return <AnimalsInventoryScreen />;
}

export function TasksScreen() {
  const role = useMyRole();
  if (role === 'veterinario') return <HealthScreen />;
  return <TasksManagerScreen />;
}

export function HealthScreen() {
  const role = useMyRole();
  if (role === 'veterinario') return <NursingScreen />;
  if (role === 'peon') return <Redirect href="/(app)/animals" />;
  if (role === 'administrador') return <AdministratorHealthScreen />;
  if (role === 'dueno') return <NursingScreen />;
  return <AnimalsInventoryScreen />;
}

export function AdministratorHealthScreen() {
  const { colors } = useTheme();
  const [section, setSection] = useState<'muertes' | 'enfermeria'>('muertes');
  return <>
    <Page>
      <Header title="Sanidad y enfermería" subtitle="REPORTES DE MUERTE Y SEGUIMIENTO VETERINARIO" />
      <View style={[s.requestActions, { marginBottom: 12 }]}>
        {(['muertes', 'enfermeria'] as const).map((item) => (
          <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: section === item }} onPress={() => setSection(item)} style={[s.healthTab, { backgroundColor: section === item ? colors.primary : colors.bgCard, borderColor: colors.border }]}>
            <Text style={[s.healthTabText, { color: section === item ? '#ffffff' : colors.textMain }]}>{item === 'muertes' ? 'Muertes pendientes' : 'Enfermería'}</Text>
          </Pressable>
        ))}
      </View>
    </Page>
    {section === 'muertes' ? <DeathReviewScreen /> : <NursingScreen />}
  </>;
}

// permito al administrador confirmar o rechazar bajas pendientes.
export function DeathReviewScreen() {
  const { session } = useSession();
  const { colors } = useTheme();
  const [rows, setRows] = useState<DeathReport[]>([]);
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  const [message, setMessage] = useState('');

  async function load(): Promise<void> {
    if (!session) return;
    try { setRows(await listPendingDeaths(session)); }
    catch (cause) { setMessage(friendlyErrorMessage(cause, 'No se pudieron cargar los reportes.')); }
  }

  useEffect(() => {
    if (!session) return;
    let active = true;
    listPendingDeaths(session).then((data) => { if (active) setRows(data); }).catch((cause: unknown) => { if (active) setMessage(friendlyErrorMessage(cause, 'No se pudieron cargar los reportes.')); });
    return () => { active = false; };
  }, [session]);

  async function decide(row: DeathReport, decision: 'confirmar' | 'rechazar'): Promise<void> {
    if (!session) return;
    try {
      const reason = rejectionReasons[row.id_reporte]?.trim();
      if (decision === 'rechazar' && !reason) { setMessage('Escribí el motivo para rechazar el reporte.'); return; }
      await reviewDeath(session, row.id_reporte, decision, reason);
      setRejectionReasons((current) => { const next = { ...current }; delete next[row.id_reporte]; return next; });
      setMessage(decision === 'confirmar' ? 'Muerte confirmada.' : 'Animal reactivado; reporte conservado.');
      await load();
    } catch (cause) {
      setMessage(friendlyErrorMessage(cause, 'No se pudo revisar el reporte.'));
    }
  }

  return (
    <Page>
      <Header title="Revisión de muertes" subtitle="BAJAS PENDIENTES DE CONFIRMACIÓN" />
      {message ? <Text style={s.requestNotice}>{message}</Text> : null}
      {rows.length ? (
        rows.map((row) => (
          <View key={row.id_reporte} style={[s.requestCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[s.requestName, { color: colors.textMain }]}>{row.nombre || row.identificador} · {row.corral}</Text>
            <Text style={[s.requestEmail, { color: colors.textSecondary }]}>{row.fecha} · {row.motivo}</Text>
            {row.latitud != null && row.longitud != null ? <Text style={[s.requestEmail, { color: colors.textMuted }]}>Ubicación GPS · {row.latitud}, {row.longitud}</Text> : null}
            {row.foto ? <Image accessibilityLabel="Foto adjunta al reporte de muerte" source={{ uri: row.foto }} style={{ borderRadius: 10, height: 150, marginTop: 10, width: '100%' }} /> : null}
            <TextInput
              accessibilityLabel="Motivo de rechazo del reporte de muerte"
              onChangeText={(value) => setRejectionReasons((current) => ({ ...current, [row.id_reporte]: value }))}
              placeholder="Motivo obligatorio si rechazás"
              placeholderTextColor={colors.textMuted}
              style={[s.requestInput, { borderColor: colors.border, color: colors.textMain }]}
              value={rejectionReasons[row.id_reporte] ?? ''}
            />
            <View style={s.requestActions}>
              <Pressable onPress={() => void decide(row, 'rechazar')} style={s.rejectButton}>
                <Text style={s.rejectText}>Rechazar y reactivar</Text>
              </Pressable>
              <Pressable onPress={() => void decide(row, 'confirmar')} style={[s.approveButton, { backgroundColor: colors.primary }]}>
                <Text style={s.approveText}>Confirmar muerte</Text>
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <View style={[s.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[s.emptyIcon, { backgroundColor: colors.bgCardMuted }]}>
            <Ionicons color={colors.primary} name="shield-checkmark" size={26} />
          </View>
          <Text style={[s.emptyTitle, { color: colors.textMain }]}>Sin reportes pendientes</Text>
          <Text style={[s.emptyCopy, { color: colors.textMuted }]}>Las bajas operativas informadas por el peón aparecerán acá para su aprobación.</Text>
        </View>
      )}
    </Page>
  );
}
