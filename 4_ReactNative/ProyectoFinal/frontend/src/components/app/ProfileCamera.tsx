import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ProfilePhotoAction, type ProfileCameraProps } from './ProfilePhotoAction';

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.35, base64: true,
};

// El servidor recibe JPEG en base64 y limita el tamaño de la imagen guardada.
function readPhoto(result: ImagePicker.ImagePickerResult): string | null {
  if (result.canceled) return null;
  const data = result.assets[0]?.base64;
  if (!data) throw new Error('No se pudo leer la imagen.');
  const photo = `data:image/jpeg;base64,${data}`;
  if (photo.length > 1_500_000) throw new Error('La foto debe pesar menos de 1,5 MB.');
  return photo;
}

export async function pickProfilePhoto(): Promise<string | null> {
  return readPhoto(await ImagePicker.launchImageLibraryAsync(pickerOptions));
}

export function ProfileCamera({ disabled, onPhoto, onError }: ProfileCameraProps) {
  const [opening, setOpening] = useState(false);

  async function takePhoto(): Promise<void> {
    setOpening(true);
    onError('');
    try {
      // Pido permiso únicamente al elegir Sacar foto. La galería sigue disponible si se rechaza.
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) { onError('No hay permiso para usar la cámara. Podés subir una foto desde la galería.'); return; }
      const photo = readPhoto(await ImagePicker.launchCameraAsync(pickerOptions));
      if (photo) onPhoto(photo);
    } catch {
      onError('No se pudo tomar la foto. Probá de nuevo o elegí una imagen de la galería.');
    } finally {
      setOpening(false);
    }
  }

  return <ProfilePhotoAction label="Sacar foto" disabled={disabled || opening} onPress={() => void takePhoto()} />;
}
