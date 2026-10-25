import { Image, type ImageStyle, StyleSheet, type StyleProp, View, type ViewStyle } from 'react-native';

const logos = {
  light: require('../../assets/branding/light/logo.png'),
  dark: require('../../assets/branding/dark/logo.png'),
} as const;

type BrandWordmarkProps = {
  mode?: keyof typeof logos;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  size?: number;
};

export function BrandWordmark({ mode = 'light', style, containerStyle, size = 104 }: BrandWordmarkProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        accessibilityLabel="EstanciaApp"
        resizeMode="contain"
        source={logos[mode]}
        style={[{ height: size, width: size }, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
