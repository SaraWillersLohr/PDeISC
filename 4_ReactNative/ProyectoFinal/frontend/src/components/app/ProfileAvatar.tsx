import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Uso iniciales si falta la foto o si la imagen guardada no puede abrirse.
export function ProfileAvatar({ photo, name, surname, size }: { photo?: string | null; name: string; surname: string; size: number }) {
  const { isDark } = useTheme();
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const shape = { width: size, height: size, borderRadius: size / 2 };
  const initials = `${name.trim()[0] ?? ''}${surname.trim()[0] ?? ''}`.toUpperCase() || 'E';

  if (photo && photo !== failedPhoto) {
    return <Image source={{ uri: photo }} accessibilityLabel="Foto de perfil" style={shape} onError={() => setFailedPhoto(photo)} />;
  }

  return (
    <View style={[shape, { alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#284536' : '#e8efe5' }]}>
      <Text style={{ color: isDark ? '#86efac' : '#1c4630', fontSize: Math.round(size * 0.32), fontWeight: '800' }}>{initials}</Text>
    </View>
  );
}
