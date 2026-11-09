import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { ProfilePhotoAction, type ProfileCameraProps } from './ProfilePhotoAction';

// Recorto y reduzco a JPEG tanto las imágenes subidas como las capturas del navegador.
function profileImage(source: CanvasImageSource, width: number, height: number): string {
  const canvas = document.createElement('canvas');
  const side = Math.min(width, height);
  canvas.width = canvas.height = Math.min(side, 512);
  const context = canvas.getContext('2d');
  if (!context || !side) throw new Error('No se pudo preparar la imagen.');
  context.drawImage(source, (width - side) / 2, (height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

export async function pickProfilePhoto(): Promise<string | null> {
  // El selector debe abrirse directamente desde el clic para funcionar también en web móvil.
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
  if (result.canceled) return null;
  const uri = result.assets[0].uri;
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      image.src = uri;
    });
    return profileImage(image, image.naturalWidth, image.naturalHeight);
  } finally {
    if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
  }
}

export function ProfileCamera({ disabled, onPhoto, onError }: ProfileCameraProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const activeStream = useRef<MediaStream | null>(null);
  const requestId = useRef(0);

  // Detengo la cámara si se sale de la pantalla, incluso con el permiso todavía pendiente.
  useEffect(() => () => {
    requestId.current += 1;
    activeStream.current?.getTracks().forEach((track) => track.stop());
  }, []);

  // Vinculo el video cuando se monta dentro del modal, incluso si el permiso llegó antes.
  const attachVideo = useCallback((element: HTMLVideoElement | null) => {
    video.current = element;
    if (element) element.srcObject = stream;
  }, [stream]);

  function close(): void {
    requestId.current += 1;
    activeStream.current?.getTracks().forEach((track) => track.stop());
    activeStream.current = null;
    setStream(null);
    setReady(false);
    setOpen(false);
  }

  async function start(): Promise<void> {
    onError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      onError('La cámara no está disponible en este navegador. Podés subir una foto.');
      return;
    }
    const id = ++requestId.current;
    setOpen(true);
    try {
      const camera = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user' } });
      if (id !== requestId.current) { camera.getTracks().forEach((track) => track.stop()); return; }
      activeStream.current = camera;
      setStream(camera);
    } catch {
      if (id !== requestId.current) return;
      close();
      onError('No se pudo abrir la cámara. Revisá el permiso del navegador o subí una foto.');
    }
  }

  function capture(): void {
    const source = video.current;
    if (!source || !ready) return;
    try {
      onPhoto(profileImage(source, source.videoWidth, source.videoHeight));
      close();
    } catch {
      close();
      onError('No se pudo capturar la foto. Probá de nuevo o subí una imagen.');
    }
  }

  return (
    <>
      <ProfilePhotoAction label="Sacar foto" disabled={disabled || open} onPress={() => void start()} />
      <Modal transparent visible={open} animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <View accessibilityViewIsModal style={[styles.card, { backgroundColor: colors.bgCard }]}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.textMain }]}>Cámara</Text>
              {stream ? <video ref={attachVideo} autoPlay muted playsInline onCanPlay={() => setReady(true)} style={videoStyle} /> : <ActivityIndicator color={colors.primary} />}
              <View style={styles.actions}>
                <Pressable accessibilityRole="button" disabled={!ready} onPress={capture} style={[styles.capture, { backgroundColor: colors.primary }, !ready && { opacity: 0.6 }]}>
                  <Text style={styles.captureText}>Tomar foto</Text>
                </Pressable>
                <ProfilePhotoAction label="Cancelar" disabled={false} onPress={close} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const videoStyle: CSSProperties = { width: '100%', maxHeight: '55vh', aspectRatio: '4 / 3', objectFit: 'contain', borderRadius: 10, backgroundColor: '#111' };

const styles = StyleSheet.create({
  backdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.48)', flex: 1, justifyContent: 'center', padding: 12 },
  card: { borderRadius: 16, flexShrink: 1, maxHeight: '90%', maxWidth: 480, overflow: 'hidden', width: '100%' },
  scroll: { flexGrow: 0, flexShrink: 1 },
  content: { gap: 12, padding: 16 },
  title: { fontSize: 19, fontWeight: '800' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  capture: { alignItems: 'center', borderRadius: 8, justifyContent: 'center', minHeight: 44, paddingHorizontal: 14 },
  captureText: { color: '#fff', fontWeight: '700' },
});
