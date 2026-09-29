import { Image } from 'expo-image';
import { ImageSourcePropType, StyleSheet, useWindowDimensions } from 'react-native';

type Props = { imgSource: ImageSourcePropType; selectedImage?: string };

export default function ImageViewer({ imgSource, selectedImage }: Props) {
  const { width, height } = useWindowDimensions();
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;
  return <Image source={imageSource} contentFit="cover" style={[styles.image, { width: Math.min(width - 48, 320), height: Math.min(height * 0.52, 440) }]} accessibilityLabel="Photo being decorated" />;
}

const styles = StyleSheet.create({ image: { borderRadius: 18 } });
