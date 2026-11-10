// registro servicios reproductivos, preñeces y nacimientos.
// muestro operaciones de campo conectadas a las APIs productivas.
import { ConfirmDelete } from '../ConfirmDelete';
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useLiveChanges } from '../../context/LiveChangesContext';
import { useTheme } from '../../context/ThemeContext';
import { confirmPregnancy, deleteBirthRecord, deleteMatingService, listReproduction, type ReproductionData } from '../../services/modulesApi';
import { Frame } from './FieldModuleScreens.shared';
import { s } from './FieldModuleStyles';

export function ReproductionScreen() {
  const { session } = useSession();
  const revision = useLiveChanges();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  const [data, setData] = useState<ReproductionData>({ servicios: [], nacimientos: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const currentRole = session?.usuario.rol.toLowerCase();
  const owner = currentRole === 'dueno';
  const canConfirmPregnancy = currentRole === 'dueno' || currentRole === 'peon';
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'servicio' | 'nacimiento'; id: number; label: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);

  const reload = useCallback(async () => {
    if (!session) return;
    try { setData(await listReproduction(session)); setMessage(''); }
    catch (e) { setMessage(friendlyErrorMessage(e, 'No se pudo cargar reproducción.')); }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listReproduction(session)
      .then((result) => { if (active) setData(result); })
      .catch((e: unknown) => { if (active) setMessage(friendlyErrorMessage(e, 'No se pudo cargar reproducción.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, revision]);

  async function removeRecord(): Promise<void> {
    if (!session || !deleteTarget || busy) return;
    setBusy(true); setMessage('');
    try {
      if (deleteTarget.type === 'servicio') await deleteMatingService(session, deleteTarget.id);
      else await deleteBirthRecord(session, deleteTarget.id);
      setDeleteTarget(null); await reload(); setMessage(deleteTarget.type === 'servicio' ? 'Servicio reproductivo borrado.' : 'Registro borrado; la ficha de la cría se conservó.');
    } catch (e) { setMessage(friendlyErrorMessage(e, 'No se pudo borrar el registro.')); }
    finally { setBusy(false); }
  }

  async function confirmServicePregnancy(id: number): Promise<void> {
    if (!session) return;
    setConfirming(id); setMessage('');
    try { const result = await confirmPregnancy(session, id); await reload(); setMessage(`Preñez confirmada. Fecha estimada de nacimiento: ${result.fecha_estimada_nacimiento.slice(0, 10)}.`); }
    catch (e) { setMessage(friendlyErrorMessage(e, 'No se pudo confirmar la preñez.')); }
    finally { setConfirming(null); }
  }

  return (
    <Frame title="Reproducción" subtitle="SERVICIOS DE MONTA, PREÑECES Y NACIMIENTOS">
      {message && !deleteTarget ? <Text style={s.error}>{message}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 20 }} />
      ) : (
        <>
          <Text style={[s.section, { color: colors.textMain }]}>Servicios recientes · {data.servicios.length}</Text>
          <View style={[s.gridWrap, isDesktop && s.gridWrapDesktop]}>
            {data.servicios.map((item) => (
              <View
                key={item.id_servicio}
                style={[
                  s.card,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                  isDesktop && s.cardDesktop,
                ]}
              >
                <View style={s.row}>
                  <View style={[s.badgeCircle, { backgroundColor: isDark ? 'rgba(134,239,172,0.15)' : '#eaf4ec' }]}>
                    <Ionicons color={isDark ? '#86efac' : '#2d6a4f'} name="git-branch" size={16} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: colors.textMain }]}>{item.nombre_madre || item.madre} · {item.fecha.slice(0, 10)}</Text>
                    <Text style={[s.copy, { color: colors.textSecondary }]}>Padre: {item.padre || item.padre_texto || 'Sin identificar'} · {item.metodo} · {item.especie}</Text>
                    {item.fecha_estimada_nacimiento ? <Text style={[s.copy, { color: colors.accentLime, marginTop: 5 }]}>Preñez confirmada · nacimiento estimado {item.fecha_estimada_nacimiento.slice(0, 10)}</Text> : null}
                  </View>
                  {owner ? <Pressable accessibilityRole="button" accessibilityLabel="Borrar servicio reproductivo" disabled={busy} onPress={() => { setMessage(''); setDeleteTarget({ type: 'servicio', id: item.id_servicio, label: `${item.nombre_madre || item.madre} · ${item.fecha.slice(0, 10)}` }); }}><Ionicons color="#dc2626" name="trash-outline" size={18} /></Pressable> : null}
                </View>
                {item.observaciones ? <Text style={[s.copy, { color: colors.textMuted, marginTop: 6 }]}>{item.observaciones}</Text> : null}
                {canConfirmPregnancy && item.madre_activa !== 0 && !item.fecha_estimada_nacimiento ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Confirmar preñez de ${item.nombre_madre || item.madre}`}
                    disabled={confirming !== null}
                    onPress={() => void confirmServicePregnancy(item.id_servicio)}
                    style={[s.pregnancyButton, { backgroundColor: colors.primary }, confirming !== null && { opacity: 0.6 }]}
                  >
                    <Ionicons color="#ffffff" name="checkmark-circle-outline" size={17} />
                    <Text style={s.primaryText}>{confirming === item.id_servicio ? 'CALCULANDO FECHA…' : 'CONFIRMAR PREÑEZ'}</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>

          <Text style={[s.section, { color: colors.textMain, marginTop: 18 }]}>Nacimientos registrados · {data.nacimientos.length}</Text>
          <View style={[s.gridWrap, isDesktop && s.gridWrapDesktop]}>
            {data.nacimientos.map((item) => (
              <View
                key={item.id_nacimiento}
                style={[
                  s.card,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                  isDesktop && s.cardDesktop,
                ]}
              >
                <View style={s.row}>
                  <View style={[s.badgeCircle, { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#fef3e7' }]}>
                    <Ionicons color="#d97706" name="heart" size={16} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: colors.textMain }]}>{item.nombre_cria || item.cria} · {item.fecha.slice(0, 10)}</Text>
                    <Text style={[s.copy, { color: colors.textSecondary }]}>Madre: {item.madre || item.madre_texto || 'Sin informar'} · Padre: {item.padre || item.padre_texto || 'Sin informar'}</Text>
                  </View>
                  {owner ? <Pressable accessibilityRole="button" accessibilityLabel="Borrar registro de nacimiento" disabled={busy} onPress={() => { setMessage(''); setDeleteTarget({ type: 'nacimiento', id: item.id_nacimiento, label: `${item.nombre_cria || item.cria} · ${item.fecha.slice(0, 10)}` }); }}><Ionicons color="#dc2626" name="trash-outline" size={18} /></Pressable> : null}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      {/* Comparto el modal para mantener botones alineados y legibles en ambos temas. */}
      <ConfirmDelete
        visible={Boolean(deleteTarget)}
        busy={busy}
        error={message}
        detail={`${deleteTarget?.label ?? ''}\nEste elemento se eliminará de forma permanente.${deleteTarget?.type === 'nacimiento' ? ' La ficha de la cría se conservará.' : ''}`}
        onCancel={() => { setDeleteTarget(null); setMessage(''); }}
        onConfirm={() => void removeRecord()}
      />
    </Frame>
  );
}
