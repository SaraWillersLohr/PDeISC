// centralizo las notificaciones en una campana disponible en todas las secciones.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { friendlyErrorMessage } from '../../services/apiErrors';
import { listNotifications, updateNotification, type NotificationRecord } from '../../services/livestockApi';

export function NotificationBell() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [olderThan, setOlderThan] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageHistory, setPageHistory] = useState<(number | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const unread = items.filter((item) => !item.leida && !item.estado_respuesta).length;

  const loadFirst = useCallback(async () => {
    if (!session) return;
    setLoading(true); setError('');
    try {
      const page = await listNotifications(session);
      setItems(page.data); setHasMore(page.hasMore); setOlderThan(page.data[page.data.length - 1]?.id_notificacion ?? null); setPageHistory([null]);
    } catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudieron cargar las notificaciones.')); }
    finally { setLoading(false); }
  }, [session]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => { void loadFirst(); }, 0);
    return () => clearTimeout(timer);
  }, [open, loadFirst]);

  // Mantengo actualizado el contador y la lista con una consulta liviana cada cinco segundos.
  useEffect(() => {
    if (!session) return;
    let active = true;
    const timer = setInterval(() => {
      void listNotifications(session).then((page) => {
        if (!active) return;
        setItems((current) => {
          const byId = new Map<number, NotificationRecord>();
          for (const item of current) byId.set(item.id_notificacion, item);
          for (const item of page.data) byId.set(item.id_notificacion, item);
          return [...byId.values()].sort((a, b) => b.id_notificacion - a.id_notificacion).slice(0, Math.max(10, current.length));
        });
      }).catch(() => undefined);
    }, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [session]);

  async function loadOlder(): Promise<void> {
    if (!session || loading || !hasMore || olderThan === null) return;
    setLoading(true); setError('');
    try {
      const page = await listNotifications(session, olderThan);
      setItems(page.data); setHasMore(page.hasMore); setOlderThan(page.data[page.data.length - 1]?.id_notificacion ?? null); setPageHistory((current) => [...current, olderThan]);
    } catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudieron cargar más notificaciones.')); }
    finally { setLoading(false); }
  }

  async function loadNewer(): Promise<void> {
    if (!session || loading || pageHistory.length < 2) return;
    const nextHistory = pageHistory.slice(0, -1);
    const before = nextHistory[nextHistory.length - 1];
    setLoading(true); setError('');
    try {
      const page = await listNotifications(session, before ?? undefined);
      setItems(page.data); setHasMore(page.hasMore); setOlderThan(page.data[page.data.length - 1]?.id_notificacion ?? null); setPageHistory(nextHistory);
    } catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudieron cargar las notificaciones recientes.')); }
    finally { setLoading(false); }
  }

  async function act(item: NotificationRecord, action: 'read' | 'delete' | 'accept' | 'reject'): Promise<void> {
    if (!session) return;
    setBusyId(item.id_notificacion); setError('');
    try {
      await updateNotification(session, item.id_notificacion, action);
      if (action === 'delete') setItems((current) => current.filter((row) => row.id_notificacion !== item.id_notificacion));
      else setItems((current) => current.map((row) => row.id_notificacion === item.id_notificacion
        ? { ...row, leida: 1, estado_respuesta: action === 'accept' ? 'aceptada' : action === 'reject' ? 'rechazada' : row.estado_respuesta }
        : row));
    } catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudo actualizar la notificación.')); }
    finally { setBusyId(null); }
  }

  function destinationFor(item: NotificationRecord): '/(app)/animals' | '/(app)/health' | null {
    const role = session?.usuario.rol.toLowerCase() ?? '';
    return item.tipo === 'alta_enfermeria' && ['administrador', 'copropietario', 'peon', 'dueno'].includes(role)
      ? '/(app)/animals'
      : ['reporte_sanitario', 'ingreso_enfermeria', 'estado_salud'].includes(item.tipo) && ['administrador', 'copropietario', 'peon', 'veterinario', 'dueno'].includes(role)
      ? '/(app)/health'
      : item.tipo === 'movimiento_animal' && ['administrador', 'copropietario', 'dueno'].includes(role)
      ? '/(app)/animals'
      : null;
  }

  function openDestination(item: NotificationRecord): void {
    const destination = destinationFor(item);
    if (destination) { setOpen(false); router.push(destination); }
  }

  return <>
    <View>
      <Pressable accessibilityLabel={unread ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'} accessibilityRole="button" onPress={() => setOpen(true)} style={[styles.bell, { backgroundColor: isDark ? '#26392c' : '#eaf2eb' }]}>
        <Ionicons color={isDark ? '#b9e7c2' : '#214d35'} name="notifications-outline" size={21} />
        {unread > 0 ? <View style={styles.count}><Text style={styles.countText}>{unread > 9 ? '9+' : unread}</Text></View> : null}
      </Pressable>
    </View>
    <Modal animationType="fade" onRequestClose={() => setOpen(false)} transparent visible={open}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Cerrar notificaciones" onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
        <View style={[styles.panel, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[styles.head, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}><Text style={[styles.heading, { color: colors.textMain }]}>Notificaciones</Text><Text style={[styles.caption, { color: colors.textMuted }]}>Las más recientes primero · de a 10</Text></View>
            <Pressable accessibilityLabel="Cerrar notificaciones" onPress={() => setOpen(false)} style={styles.close}><Ionicons color={colors.textSecondary} name="close" size={21} /></Pressable>
          </View>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {loading && items.length === 0 ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View> : null}
          {!loading && items.length === 0 && !error ? <Text style={[styles.empty, { color: colors.textMuted }]}>Todavía no tenés notificaciones.</Text> : null}
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {items.map((item) => {
              const request = item.tipo.startsWith('solicitud') && !item.estado_respuesta;
              const canOpen = Boolean(destinationFor(item));
              const resolved = Boolean(item.estado_respuesta);
              return <View key={item.id_notificacion} style={[styles.card, { borderColor: colors.border, backgroundColor: item.leida || resolved ? colors.bgCardMuted : (isDark ? '#223328' : '#f1f7f1') }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.statusDot, { backgroundColor: item.leida || resolved ? colors.textMuted : colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: colors.textMain }]}>{item.titulo}</Text>
                    <Text style={[styles.date, { color: colors.textMuted }]}>{new Date(item.created_at).toLocaleString('es-AR')}</Text>
                  </View>
                  <Pressable accessibilityLabel="Eliminar notificación" disabled={busyId === item.id_notificacion} onPress={() => void act(item, 'delete')} hitSlop={8}><Ionicons color={colors.textMuted} name="trash-outline" size={18} /></Pressable>
                </View>
                <Text style={[styles.message, { color: colors.textSecondary }]}>{item.mensaje}</Text>
                {request ? <View style={styles.actions}>
                  <Pressable disabled={busyId === item.id_notificacion} onPress={() => void act(item, 'reject')} style={[styles.action, styles.reject]}><Text style={styles.rejectText}>Rechazar</Text></Pressable>
                  <Pressable disabled={busyId === item.id_notificacion} onPress={() => void act(item, 'accept')} style={[styles.action, { backgroundColor: colors.primary }]}><Text style={styles.acceptText}>Aceptar</Text></Pressable>
                </View> : <View style={styles.actions}>
                  {canOpen ? <Pressable onPress={() => openDestination(item)} style={[styles.action, styles.linkAction]}><Text style={[styles.linkText, { color: colors.primary }]}>Ir al módulo</Text><Ionicons color={colors.primary} name="arrow-forward" size={14} /></Pressable> : null}
                  {!item.leida && !resolved ? <Pressable disabled={busyId === item.id_notificacion} onPress={() => void act(item, 'read')} style={[styles.action, { backgroundColor: colors.primary }]}><Text style={styles.acceptText}>Marcar como leída</Text></Pressable> : resolved ? <Text style={[styles.response, { color: colors.textMuted }]}>Solicitud {item.estado_respuesta}</Text> : null}
                </View>}
              </View>;
            })}
          </ScrollView>
          {(hasMore || pageHistory.length > 1) ? <View style={[styles.pager, { borderTopColor: colors.border }]}>
            {pageHistory.length > 1 ? <Pressable disabled={loading} onPress={() => void loadNewer()} style={styles.pagerButton}><Text style={[styles.moreText, { color: colors.primary }]}>10 más recientes</Text></Pressable> : <View style={styles.pagerButton} />}
            {hasMore ? <Pressable disabled={loading} onPress={() => void loadOlder()} style={styles.pagerButton}>{loading ? <ActivityIndicator color={colors.primary} /> : <Text style={[styles.moreText, { color: colors.primary }]}>10 anteriores</Text>}</Pressable> : null}
          </View> : null}
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  bell: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 38 },
  count: { alignItems: 'center', backgroundColor: '#dc3f36', borderColor: '#fff', borderRadius: 9, borderWidth: 1.5, height: 18, justifyContent: 'center', minWidth: 18, paddingHorizontal: 3, position: 'absolute', right: -2, top: -3 },
  countText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  overlay: { alignItems: 'flex-end', backgroundColor: 'rgba(12, 22, 15, 0.25)', flex: 1, paddingTop: 62, paddingRight: 16 },
  panel: { borderRadius: 16, borderWidth: 1, elevation: 14, maxHeight: '82%', maxWidth: 440, overflow: 'hidden', width: '100%', shadowColor: '#102014', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 18 },
  head: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingHorizontal: 17, paddingVertical: 14 },
  heading: { fontSize: 17, fontWeight: '800' }, caption: { fontSize: 11, marginTop: 3 }, close: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 },
  error: { color: '#b42318', fontSize: 12, paddingHorizontal: 16, paddingTop: 10 },
  loading: { alignItems: 'center', padding: 28 }, empty: { padding: 24, textAlign: 'center' },
  list: { flexGrow: 0 }, listContent: { gap: 9, padding: 12 },
  card: { borderRadius: 12, borderWidth: 1, padding: 12 }, cardTop: { alignItems: 'flex-start', flexDirection: 'row', gap: 8 }, statusDot: { borderRadius: 4, height: 8, marginTop: 5, width: 8 }, title: { fontSize: 13, fontWeight: '700' }, date: { fontSize: 10, marginTop: 3 }, message: { fontSize: 12, lineHeight: 17, marginTop: 8 },
  actions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', marginTop: 10 }, action: { alignItems: 'center', borderRadius: 8, flexDirection: 'row', gap: 4, justifyContent: 'center', minHeight: 30, paddingHorizontal: 10 }, acceptText: { color: '#fff', fontSize: 11, fontWeight: '700' }, reject: { backgroundColor: '#fff1f0', borderColor: '#f2c6c3', borderWidth: 1 }, rejectText: { color: '#a5322a', fontSize: 11, fontWeight: '700' }, linkAction: { backgroundColor: 'transparent' }, linkText: { fontSize: 11, fontWeight: '700' }, response: { fontSize: 11, fontWeight: '700' }, pager: { alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 12 }, pagerButton: { alignItems: 'center', justifyContent: 'center', minHeight: 40, minWidth: 90 }, moreText: { fontSize: 12, fontWeight: '700' },
});
