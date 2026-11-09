import { Pressable, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { s } from './ScreensStyles';

export type ProfileCameraProps = { disabled: boolean; onPhoto: (photo: string) => void; onError: (message: string) => void };

// Mantengo el mismo tamaño táctil para subir una imagen y usar la cámara.
export function ProfilePhotoAction({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[s.smallBtn, { backgroundColor: colors.bgCardMuted }, disabled && s.disabled]}>
      <Text style={[s.smallBtnText, { color: colors.textMain }]}>{label}</Text>
    </Pressable>
  );
}
