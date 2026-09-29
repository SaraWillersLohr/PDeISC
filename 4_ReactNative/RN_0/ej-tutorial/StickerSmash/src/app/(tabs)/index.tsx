import { useEffect, useRef, useState } from 'react';
import { ImageSourcePropType, Platform, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Button from '@/components/button';
import CircleButton from '@/components/circle-button';
import EmojiList from '@/components/emoji-list';
import EmojiPicker from '@/components/emoji-picker';
import EmojiSticker from '@/components/emoji-sticker';
import IconButton from '@/components/icon-button';
import ImageViewer from '@/components/image-viewer';

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string>();
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType>();
  const [feedback, setFeedback] = useState('');
  const [permissionResponse, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const imageRef = useRef<View>(null);

  useEffect(() => {
    if (permissionResponse?.status === 'undetermined') void requestPermission();
  }, [permissionResponse?.status, requestPermission]);

  const pickImageAsync = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setShowAppOptions(true);
        setFeedback('Photo selected. Add a sticker or save your image.');
      }
    } catch {
      setFeedback('The photo library could not be opened. Check its permission and try again.');
    }
  };

  const saveImageAsync = async () => {
    try {
      if (Platform.OS === 'web') {
        if (!imageRef.current) return;
        const { default: domtoimage } = await import('dom-to-image');
        const dataUrl = await domtoimage.toJpeg(imageRef.current, { quality: 0.95, width: 320, height: 440 });
        const link = document.createElement('a');
        link.download = 'sticker-smash.jpeg';
        link.href = dataUrl;
        link.click();
      } else {
        // Algunos clientes Expo Go todavía incluyen el módulo anterior de MediaLibrary.
        let MediaLibrary;
        try {
          MediaLibrary = await import('expo-media-library');
        } catch {
          MediaLibrary = await import('expo-media-library/legacy');
        }
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (!permission.granted) {
          setFeedback('Allow photo access to save your creation.');
          return;
        }
        const localUri = await captureRef(imageRef, { height: 440, quality: 1, format: 'jpg' });
        if ('Asset' in MediaLibrary) {
          await MediaLibrary.Asset.create(localUri);
        } else {
          await MediaLibrary.saveToLibraryAsync(localUri);
        }
      }
      setFeedback('Your creation has been saved.');
    } catch {
      setFeedback('Could not save the image. Please try again.');
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false} style={styles.canvas}>
          <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
          {pickedEmoji && <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />}
        </View>
      </View>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton icon="refresh" label="Reset" onPress={() => { setShowAppOptions(false); setPickedEmoji(undefined); setFeedback('Creation reset.'); }} />
            <CircleButton onPress={() => setIsModalVisible(true)} />
            <IconButton icon="save-alt" label="Save" onPress={saveImageAsync} />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
          <Button label="Use this photo" onPress={() => { setShowAppOptions(true); setFeedback('Default photo selected. Add a sticker or save your image.'); }} />
        </View>
      )}
      <EmojiPicker isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={() => setIsModalVisible(false)} />
      </EmojiPicker>
      <Text accessibilityLiveRegion="polite" style={styles.feedback}>{feedback}</Text>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', alignItems: 'center' },
  imageContainer: { flex: 1, justifyContent: 'center', width: '100%', alignItems: 'center', padding: 16 },
  canvas: { width: '100%', maxWidth: 320, height: '100%', maxHeight: 440, alignItems: 'center', justifyContent: 'center' },
  footerContainer: { flex: 1 / 3, alignItems: 'center', justifyContent: 'flex-start', gap: 8 },
  optionsContainer: { position: 'absolute', bottom: 24 },
  optionsRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  feedback: { position: 'absolute', left: 16, right: 16, bottom: 4, minHeight: 18, color: '#fff', textAlign: 'center', fontSize: 12 },
});
