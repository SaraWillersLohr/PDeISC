// resuelvo módulos secundarios y solicitudes administrativas.
// presento los resúmenes y accesos principales según el perfil activo.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { approveRegistrationRequest, listRegistrationRequests, rejectRegistrationRequest, type RegistrationRequest, type RequestedRole } from '../../services/adminApi';
import { AnimalsInventoryScreen, NursingScreen } from './LivestockScreens';
import { ReproductionScreen, TasksManagerScreen } from './FieldModuleScreens';
import { EventsScreen } from './EventsScreen';
import { EstateScreen } from './EstateScreen';
import { CatalogScreen, TeamScreen } from './OrganizationScreens';
import { useMyRole , modules , ModuleItem , Page , Header ,  } from './Screens.shared';
import { MoreScreen } from './Screens.profile';
import { s } from './ScreensStyles';

export function GenericModuleScreen() {
  const { module } = useLocalSearchParams<{ module: string }>();
  const role = useMyRole();
  const item = modules.find((entry) => entry.key === module);
  if (!item || !item.roles.includes(role)) {
    return <ModuleInDevelopmentScreen moduleKey={module ?? ''} item={item} />;
  }
  if (role === 'administrador' && item.key === 'equipo') return <AdminRequestsScreen />;
  if (item.key === 'equipo') return <TeamScreen />;
  if (item.key === 'catalogo') return <CatalogScreen />;
  if (item.key === 'perfil') return <MoreScreen />;
  if (item.key === 'estancia') return <EstateScreen />;
  if (item.key === 'animales') return <AnimalsInventoryScreen />;
  if (item.key === 'tareas') return <TasksManagerScreen />;
  if (item.key === 'sanidad') return <NursingScreen />;
  if (item.key === 'reproduccion') return <ReproductionScreen />;
  if (item.key === 'eventos') return <EventsScreen />;
  return <ModuleInDevelopmentScreen moduleKey={module ?? ''} item={item} />;
}

export function ModuleInDevelopmentScreen({ moduleKey, item }: { moduleKey: string; item?: ModuleItem }) {
  const { colors, isDark } = useTheme();
  const routeTitle = moduleKey
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const title = item?.label || routeTitle || 'Nueva sección';

  return (
    <Page>
      <Header title={title} subtitle="MÓDULO DE ESTANCIAAPP" />
      <View style={[s.developmentCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <View style={[s.developmentIcon, { backgroundColor: isDark ? 'rgba(134,239,172,0.12)' : '#e8f5ed' }]}>
          <Ionicons color={isDark ? '#86efac' : '#2d6a4f'} name={item?.icon ?? 'construct-outline'} size={30} />
        </View>
        <Text style={[s.developmentTitle, { color: colors.textMain }]}>Sección en desarrollo</Text>
        <Text style={[s.developmentCopy, { color: colors.textMuted }]}>
          {item
            ? `Estamos preparando ${item.label.toLowerCase()} para este perfil. Podés seguir usando las demás secciones desde el menú.`
            : 'Estamos preparando esta sección. Podés seguir usando las demás secciones desde el menú.'}
        </Text>
        <View style={[s.developmentBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f2' }]}>
          <Ionicons color={colors.textMuted} name="time-outline" size={15} />
          <Text style={[s.developmentBadgeText, { color: colors.textMuted }]}>Próximamente</Text>
        </View>
      </View>
    </Page>
  );
}

export function TeamModuleScreen() {
  return useMyRole() === 'administrador' ? <AdminRequestsScreen /> : <TeamScreen />;
}

// muestro solicitudes verificadas y permito al administrador asignar un rol antes de aprobar.
export function AdminRequestsScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const token = session?.accessToken;
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<number, RequestedRole>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [decision, setDecision] = useState<{ request: RegistrationRequest; action: 'approve' | 'reject' } | null>(null);
  const [showTeam, setShowTeam] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token) return () => { active = false; };
    void listRegistrationRequests(token).then((items) => { if (active) setRequests(items); }).catch((cause: unknown) => {
      if (active) setError(friendlyErrorMessage(cause, 'No se pudieron cargar las solicitudes.'));
    });
    return () => { active = false; };
  }, [token]);

  async function resolveRequest(): Promise<void> {
    if (!decision || !token) return;
    setBusyId(decision.request.id_solicitud); setError(''); setNotice('');
    try {
      if (decision.action === 'approve') await approveRegistrationRequest(token, decision.request.id_solicitud, selectedRoles[decision.request.id_solicitud] ?? 'peon');
      else await rejectRegistrationRequest(token, decision.request.id_solicitud);
      setRequests((current) => current.filter((request) => request.id_solicitud !== decision.request.id_solicitud));
      setNotice(decision.action === 'approve' ? 'Solicitud aprobada. Se envió el código de acceso al correo.' : 'Solicitud rechazada.');
      setDecision(null);
    } catch (cause) {
      setError(friendlyErrorMessage(cause, 'No se pudo resolver la solicitud.'));
    } finally {
      setBusyId(null);
    }
  }

  const roleOptions: { role: RequestedRole; label: string }[] = [{ role: 'dueno', label: 'Dueño' }, { role: 'peon', label: 'Peón' }, { role: 'veterinario', label: 'Veterinario' }];
  if (showTeam) return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={() => setShowTeam(false)} style={[s.backBtn, { backgroundColor: colors.bgCardMuted }]}>
        <Text style={[s.backBtnText, { color: colors.primary }]}>‹ Volver a solicitudes</Text>
      </Pressable>
      <TeamScreen />
    </View>
  );

  return (
    <Page>
      <Header title="Solicitudes" subtitle="ALTAS DE LA ORGANIZACIÓN" />
      <Pressable onPress={() => setShowTeam(true)} style={[s.approveButton, { alignSelf: 'flex-start', backgroundColor: colors.primary, marginBottom: 16 }]}>
        <Text style={s.approveText}>Administrar usuarios activos</Text>
      </Pressable>

      {notice ? <Text style={s.requestNotice}>{notice}</Text> : null}
      {error ? <Text style={s.requestError}>{error}</Text> : null}

      {requests.length ? (
        requests.map((request) => (
          <View key={request.id_solicitud} style={[s.requestCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[s.requestName, { color: colors.textMain }]}>{request.nombre} {request.apellido}</Text>
            <Text style={[s.requestEmail, { color: colors.textSecondary }]}>{request.email}</Text>
            <Text style={[s.roleLabel, { color: colors.textMuted }]}>ASIGNAR ROL AL APROBAR</Text>
            <View style={s.roleOptions}>
              {roleOptions.map((option) => (
                <Pressable
                  key={option.role}
                  onPress={() => setSelectedRoles((current) => ({ ...current, [request.id_solicitud]: option.role }))}
                  style={[
                    s.roleOption,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#eef1eb' },
                    (selectedRoles[request.id_solicitud] ?? 'peon') === option.role && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[s.roleOptionText, { color: colors.textSecondary }, (selectedRoles[request.id_solicitud] ?? 'peon') === option.role && { color: '#ffffff', fontWeight: '800' }]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={s.requestActions}>
              <Pressable disabled={busyId === request.id_solicitud} onPress={() => setDecision({ request, action: 'reject' })} style={s.rejectButton}>
                <Text style={s.rejectText}>Rechazar</Text>
              </Pressable>
              <Pressable disabled={busyId === request.id_solicitud} onPress={() => setDecision({ request, action: 'approve' })} style={[s.approveButton, { backgroundColor: colors.primary }]}>
                <Text style={s.approveText}>{busyId === request.id_solicitud ? 'Procesando…' : 'Aprobar y enviar código'}</Text>
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <View style={[s.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[s.emptyIcon, { backgroundColor: colors.bgCardMuted }]}>
            <Ionicons color={colors.primary} name="people" size={26} />
          </View>
          <Text style={[s.emptyTitle, { color: colors.textMain }]}>No hay solicitudes pendientes</Text>
          <Text style={[s.emptyCopy, { color: colors.textMuted }]}>Las solicitudes aparecen cuando la persona confirma su correo.</Text>
        </View>
      )}

      <Modal animationType="fade" onRequestClose={() => setDecision(null)} transparent visible={Boolean(decision)}>
        <View style={s.modalBackdrop}>
          <View style={[s.modalCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[s.modalTitle, { color: colors.textMain }]}>
              {decision?.action === 'approve' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
            </Text>
            <Text style={[s.modalCopy, { color: colors.textSecondary }]}>
              {decision ? `${decision.request.nombre} ${decision.request.apellido} · ${decision.request.email}` : ''}
              {decision?.action === 'approve'
                ? `\nRol asignado: ${roleOptions.find((option) => option.role === (selectedRoles[decision.request.id_solicitud] ?? 'peon'))?.label}. Se enviará un código de acceso.`
                : '\nNo se creará una cuenta activa.'}
            </Text>
            <View style={s.requestActions}>
              <Pressable onPress={() => setDecision(null)} style={s.rejectButton}>
                <Text style={s.rejectText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={() => void resolveRequest()} style={[s.approveButton, { backgroundColor: colors.primary }]}>
                <Text style={s.approveText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}
