import { Image, type ImageStyle, StyleSheet, type StyleProp } from 'react-native';

const wordmarks = {
  light: require('../../assets/branding/light/title.png'),
  dark: require('../../assets/branding/dark/title.png'),
} as const;

type BrandWordmarkProps = {
  mode?: keyof typeof wordmarks;
  style?: StyleProp<ImageStyle>;
};

export function BrandWordmark({ mode = 'light', style }: BrandWordmarkProps) {
  return <Image accessibilityLabel="EstanciaApp" resizeMode="contain" source={wordmarks[mode]} style={[styles.image, style]} />;
}

const styles = StyleSheet.create({ image: { height: 42, width: 154 } });
