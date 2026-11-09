// permito consultar y actualizar los datos personales y la sesión.
// presento los resúmenes y accesos principales según el perfil activo.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { removeSession, saveSession } from '../../services/sessionStorage';
import { changeMyPassword, updateMyProfile } from '../../services/authApi';
import { PasswordInput } from '../PasswordInput';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileCamera, pickProfilePhoto } from './ProfileCamera';
import { ProfilePhotoAction } from './ProfilePhotoAction';
import { normalizeRole , Page , Header , roleLabel } from './Screens.shared';
import { s } from './ScreensStyles';

export function MoreScreen() {
  const { session, setSession } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const role = normalizeRole(session?.usuario.rol.toLowerCase() ?? '');

  const [name, setName] = useState(session?.usuario.nombre ?? '');
  const [surname, setSurname] = useState(session?.usuario.apellido ?? '');
  const [photo, setPhoto] = useState<string | null>(session?.usuario.foto_perfil ?? null);
  const [photoError, setPhotoError] = useState('');
  const photoPending = photo !== (session?.usuario.foto_perfil ?? null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function logout(): Promise<void> {
    await removeSession();
    setSession(null);
    router.replace('/');
  }

  // La foto elegida se muestra primero como vista previa y se publica al guardar los datos.
  async function pickPhoto(): Promise<void> {
    setPhotoError('');
    try {
      const selected = await pickProfilePhoto();
      if (selected) setPhoto(selected);
    } catch (cause) {
      setPhotoError(friendlyErrorMessage(cause, 'No se pudo abrir la imagen. Elegí otra foto.'));
    }
  }

  async function saveProfile(): Promise<void> {
    if (!session) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const usuario = await updateMyProfile(session, { nombre: name, apellido: surname, foto_perfil: photo });
      const updated = { ...session, usuario };
      await saveSession(updated);
      setSession(updated);
      setMessage('Perfil actualizado correctamente.');
    } catch (cause) {
      setError(friendlyErrorMessage(cause, 'No se pudo actualizar el perfil.'));
    } finally {
      setBusy(false);
    }
  }

  async function savePassword(): Promise<void> {
    if (!session) return;
    if (!currentPassword) { setError('Ingresá tu contraseña actual.'); return; }
    if (newPassword.length < 10) { setError('La contraseña nueva debe tener al menos 10 caracteres.'); return; }
    if (newPassword !== confirmPassword) { setError('Las contraseñas nuevas no coinciden.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      setMessage(await changeMyPassword(session, currentPassword, newPassword));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (cause) {
      setError(friendlyErrorMessage(cause, 'No se pudo cambiar la contraseña.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <Header title="Mi perfil" subtitle="DATOS PERSONALES, SEGURIDAD Y SESIÓN" />

      <View style={[isDesktop && s.profileGridDesktop]}>
        {/* Personal Details Card */}
        <View style={[s.profileCard, isDesktop && s.profileColumn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.textMain }]}>Datos personales</Text>
          <View style={s.photoRow}>
            <ProfileAvatar photo={photo} name={name} surname={surname} size={64} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[s.profileFullName, { color: colors.textMain }]}>{name || session?.usuario.nombre} {surname || session?.usuario.apellido}</Text>
              <Text style={[s.profileMetaText, { color: colors.textMuted }]}>{roleLabel[role] ?? role} · {session?.usuario.email}</Text>
            </View>
          </View>
          <View style={s.photoActions}>
            <ProfilePhotoAction label="Subir foto" disabled={busy} onPress={() => void pickPhoto()} />
            <ProfileCamera disabled={busy} onPhoto={setPhoto} onError={setPhotoError} />
            {photo ? <ProfilePhotoAction label="Quitar foto" disabled={busy} onPress={() => { setPhotoError(''); setPhoto(null); }} /> : null}
          </View>
          {photoPending ? <Text style={[s.formHelp, { color: colors.textMuted }]}>{photo ? 'Vista previa. Guardá los datos personales para aplicar la foto.' : 'Guardá los datos personales para quitar la foto.'}</Text> : null}
          {photoError ? <Text accessibilityRole="alert" style={s.requestError}>{photoError}</Text> : null}

          <Text style={[s.formLabel, { color: colors.textMuted }]}>NOMBRE</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setName}
            style={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={name}
          />

          <Text style={[s.formLabel, { color: colors.textMuted }]}>APELLIDO</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setSurname}
            style={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={surname}
          />

          <Pressable disabled={busy} onPress={() => void saveProfile()} style={[s.primaryBtn, { backgroundColor: colors.primary }, busy && s.disabled]}>
            <Text style={s.primaryBtnText}>Guardar datos personales</Text>
          </Pressable>
        </View>

        {/* Password / Security Card */}
        <View style={[s.profileCard, isDesktop && s.profileColumn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.textMain }]}>Cambiar contraseña</Text>
          <Text style={[s.formHelp, { color: colors.textMuted }]}>Para proteger tu acceso, primero ingresá tu contraseña actual.</Text>

          <Text style={[s.formLabel, { color: colors.textMuted }]}>CONTRASEÑA ACTUAL</Text>
          <PasswordInput
            accessibilityLabel="Contraseña actual"
            autoCapitalize="none"
            onChangeText={setCurrentPassword}
            containerStyle={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            inputStyle={{ color: colors.inputText, fontSize: 13, height: 46, paddingLeft: 12 }}
            value={currentPassword}
          />

          <Text style={[s.formLabel, { color: colors.textMuted }]}>CONTRASEÑA NUEVA</Text>
          <PasswordInput
            accessibilityLabel="Contraseña nueva"
            autoCapitalize="none"
            onChangeText={setNewPassword}
            placeholder="Al menos 10 caracteres"
            containerStyle={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            inputStyle={{ color: colors.inputText, fontSize: 13, height: 46, paddingLeft: 12 }}
            placeholderTextColor={colors.textMuted}
            value={newPassword}
          />

          <Text style={[s.formLabel, { color: colors.textMuted }]}>REPETIR CONTRASEÑA</Text>
          <PasswordInput
            accessibilityLabel="Repetir contraseña nueva"
            autoCapitalize="none"
            onChangeText={setConfirmPassword}
            containerStyle={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            inputStyle={{ color: colors.inputText, fontSize: 13, height: 46, paddingLeft: 12 }}
            value={confirmPassword}
          />

          <Pressable disabled={busy} onPress={() => void savePassword()} style={[s.primaryBtn, { backgroundColor: colors.primary }, busy && s.disabled]}>
            <Text style={s.primaryBtnText}>Cambiar contraseña</Text>
          </Pressable>

          <Pressable onPress={() => router.push({ pathname: '/recover', params: { email: session?.usuario.email ?? '' } })} style={s.recoveryLink}>
            <Text style={[s.recoveryText, { color: colors.accentLime }]}>¿No recordás tu contraseña? Usar código de recuperación</Text>
          </Pressable>
        </View>
      </View>

      {message ? <Text style={s.requestNotice}>{message}</Text> : null}
      {error ? <Text style={s.requestError}>{error}</Text> : null}

      <Pressable onPress={() => void logout()} style={[s.logoutBtn, { borderColor: isDark ? '#4b2e2b' : '#e7d9d7' }]}>
        <Ionicons color="#dc2626" name="log-out-outline" size={17} style={{ marginRight: 6 }} />
        <Text style={s.logoutText}>Cerrar sesión</Text>
      </Pressable>

      <Text style={[s.appVersion, { color: colors.textMuted }]}>ESTANCIAAPP · GESTIÓN AGROPECUARIA INTELIGENTE</Text>
    </Page>
  );
}
