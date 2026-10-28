// consulto la ocupación y administración operativa de corrales.
// muestro los inventarios de animales y corrales con datos del backend.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Modal, Platform, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { deleteCorral, listCorrals, saveCorral, type CorralRecord } from '../../services/livestockApi';
import { InventoryPage , Empty } from './LivestockScreens.shared';
import { style } from './LivestockStyles';

// consulto ocupación y capacidad de cada corral activo.
export function CorralsInventoryScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  const [rows, setRows] = useState<CorralRecord[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const role = session?.usuario.rol.toLowerCase();
  const canManage = role === 'dueno';
  const [editing, setEditing] = useState<CorralRecord | null | false>(false);
  const [deleting, setDeleting] = useState<CorralRecord | null>(null);
  const [corralName, setCorralName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [actionError, setActionError] = useState('');
  const [savingCorral, setSavingCorral] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    try { setRows(await listCorrals(session)); }
    catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudo cargar la lista de corrales.')); }
    finally { setLoading(false); setRefreshing(false); }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listCorrals(session).then((data) => { if (active) setRows(data); })
      .catch((cause: unknown) => { if (active) setError(friendlyErrorMessage(cause, 'No se pudo cargar la lista de corrales.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);

  const filtered = useMemo(() => rows.filter((corral) => corral.nombre.toLowerCase().includes(query.trim().toLowerCase())), [query, rows]);

  return (
    <InventoryPage
      title="Corrales"
      subtitle="OCUPACIÓN Y CAPACIDAD PRODUCTIVA"
      count={filtered.length}
      search={query}
      onSearch={setQuery}
      loading={loading}
      error={error}
      onRetry={() => { setLoading(true); void load(); }}
      onRefresh={() => { setRefreshing(true); void load(); }}
      refreshing={refreshing}
      headerAction={canManage ? (
        <Pressable onPress={() => { setEditing(null); setCorralName(''); setCapacity(''); setActionError(''); }} style={[style.confirmButton, { backgroundColor: colors.primary }]}>
          <Ionicons color="#ffffff" name="add" size={17} style={{ marginRight: 4 }} />
          <Text style={style.confirmText}>Crear corral</Text>
        </Pressable>
      ) : null}
    >
      {actionError ? <Text style={style.errorText}>{actionError}</Text> : null}

      <View style={[style.gridContainer, isDesktop && style.gridContainerDesktop]}>
        {filtered.map((corral) => {
          const occupancy = Number(corral.ocupacion);
          const maxCapacity = Number(corral.capacidad);
          const ratio = maxCapacity ? Math.min(occupancy / maxCapacity, 1) : 0;
          return (
            <View
              key={corral.id_corral}
              style={[
                style.card,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
                isDesktop && style.cardDesktop,
              ]}
            >
              <View style={style.row}>
                <View style={[style.badge, { backgroundColor: corral.es_enfermeria ? (isDark ? 'rgba(239,68,68,0.18)' : '#faecea') : (isDark ? 'rgba(245,158,11,0.18)' : '#fef3e7') }]}>
                  <Ionicons
                    color={corral.es_enfermeria ? '#ef4444' : '#d97706'}
                    name={corral.es_enfermeria ? 'medkit' : 'grid'}
                    size={18}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[style.title, { color: colors.textMain }]}>{corral.nombre}</Text>
                  <Text style={[style.detail, { color: colors.textMuted }]}>
                    {corral.es_enfermeria ? 'Corral sanitario / enfermería' : 'Corral general operativo'}
                  </Text>
                </View>
                <Text style={[style.occupancy, { color: colors.textMain }]}>
                  {occupancy}
                  <Text style={[style.detail, { color: colors.textMuted }]}> / {maxCapacity}</Text>
                </Text>
              </View>

              <View style={style.track}>
                <View
                  style={[
                    style.progress,
                    {
                      backgroundColor: ratio >= 0.9 ? '#ef4444' : ratio >= 0.7 ? '#f59e0b' : '#34d399',
                      width: `${Math.max(ratio > 0 ? 6 : 0, ratio * 100)}%`,
                    },
                  ]}
                />
              </View>

              <View style={style.row}>
                <Text style={[style.detail, { color: colors.textSecondary, flex: 1 }]}>
                  Ocupación actual · {Math.round(ratio * 100)}%
                </Text>
                {canManage && !corral.es_enfermeria ? (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={() => { setEditing(corral); setCorralName(corral.nombre); setCapacity(String(corral.capacidad)); setActionError(''); }}
                      style={[style.moveButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' }]}
                    >
                      <Text style={[style.moveButtonText, { color: colors.primary }]}>Editar</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { setDeleting(corral); setActionError(''); }}
                      style={[style.moveButton, { backgroundColor: isDark ? 'rgba(239,68,68,0.14)' : '#fee2e2' }]}
                    >
                      <Text style={[style.moveButtonText, { color: '#dc2626' }]}>Baja</Text>
                    </Pressable>
                  </View>
                ) : null}
                {corral.es_enfermeria && role === 'dueno' ? (
                  <Pressable onPress={() => router.push('/(app)/health')} style={[style.moveButton, { backgroundColor: isDark ? 'rgba(134,239,172,0.14)' : '#eaf4ec' }]}>
                    <Text style={[style.moveButtonText, { color: colors.primary }]}>Ver animales y evolución</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {!loading && !error && filtered.length === 0 ? (
        <Empty
          title={query ? 'No encontramos corrales' : 'Todavía no hay corrales creados'}
          text={query ? 'Probá con otro nombre.' : 'Los corrales del establecimiento aparecerán acá.'}
        />
      ) : null}

      <Modal animationType="fade" onRequestClose={() => setEditing(false)} transparent visible={editing !== false}>
        <View style={style.backdrop}>
          <View style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[style.modalTitle, { color: colors.textMain }]}>{editing ? 'Editar corral' : 'Nuevo corral'}</Text>
            <Text style={[style.selectLabel, { color: colors.textMuted }]}>NOMBRE</Text>
            <TextInput
              onChangeText={setCorralName}
              placeholder="Ej. Potrero norte"
              placeholderTextColor={colors.textMuted}
              style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={corralName}
            />
            <Text style={[style.selectLabel, { color: colors.textMuted }]}>CAPACIDAD DE ANIMALES</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setCapacity}
              placeholder="Cantidad de animales permitida"
              placeholderTextColor={colors.textMuted}
              style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={capacity}
            />
            {actionError ? <Text style={style.errorText}>{actionError}</Text> : null}
            <View style={style.modalActions}>
              <Pressable onPress={() => setEditing(false)} style={[style.cancelButton, { borderColor: colors.border }]}>
                <Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
              <Pressable disabled={savingCorral} onPress={() => void persist()} style={[style.confirmButton, { backgroundColor: colors.primary }]}>
                <Text style={style.confirmText}>{savingCorral ? 'Guardando…' : 'Guardar corral'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" onRequestClose={() => setDeleting(null)} transparent visible={Boolean(deleting)}>
        <View style={style.backdrop}>
          <View style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[style.modalTitle, { color: colors.textMain }]}>Dar de baja {deleting?.nombre}</Text>
            <Text style={[style.detail, { color: colors.textSecondary }]}>
              {Number(deleting?.ocupacion ?? 0) > 0 ? `Primero trasladá los ${deleting?.ocupacion} animales asignados a otro corral antes de darlo de baja.` : 'El corral quedará inactivo y se conservará su historial productivo.'}
            </Text>
            {actionError ? <Text style={style.errorText}>{actionError}</Text> : null}
            <View style={style.modalActions}>
              <Pressable onPress={() => setDeleting(null)} style={[style.cancelButton, { borderColor: colors.border }]}>
                <Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={savingCorral || Number(deleting?.ocupacion ?? 0) > 0}
                onPress={() => deleting && void remove(deleting)}
                style={[style.confirmButton, { backgroundColor: '#dc2626' }, Number(deleting?.ocupacion ?? 0) > 0 && style.disabledButton]}
              >
                <Text style={style.confirmText}>{savingCorral ? 'Procesando…' : 'Confirmar baja'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </InventoryPage>
  );

  async function persist(): Promise<void> {
    if (!session || !corralName.trim() || !Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      setActionError('Ingresá un nombre y una capacidad válida.');
      return;
    }
    setSavingCorral(true); setActionError('');
    try {
      await saveCorral(session, { ...(editing ? { id_corral: editing.id_corral } : {}), nombre: corralName.trim(), capacidad: Number(capacity) });
      setEditing(false); await load();
    } catch (cause) {
      setActionError(friendlyErrorMessage(cause, 'No se pudo guardar el corral.'));
    } finally {
      setSavingCorral(false);
    }
  }

  async function remove(corral: CorralRecord): Promise<void> {
    if (!session) return;
    setActionError('');
    setSavingCorral(true);
    try { await deleteCorral(session, corral.id_corral); setDeleting(null); await load(); }
    catch (cause) { setActionError(friendlyErrorMessage(cause, 'No se pudo dar de baja el corral.')); }
    finally { setSavingCorral(false); }
  }
}
