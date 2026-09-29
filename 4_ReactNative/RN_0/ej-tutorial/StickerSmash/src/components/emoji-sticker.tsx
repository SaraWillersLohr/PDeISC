import { ImageSourcePropType, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = { imageSize: number; stickerSource: ImageSourcePropType };

export default function EmojiSticker({ imageSize, stickerSource }: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleImage = useSharedValue(imageSize);
  const doubleTap = Gesture.Tap().numberOfTaps(2).onStart(() => {
    scaleImage.value = scaleImage.value === imageSize * 2 ? imageSize : imageSize * 2;
  });
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const pan = Gesture.Pan().onUpdate((event) => {
    translateX.value = offsetX.value + event.translationX;
    translateY.value = offsetY.value + event.translationY;
  }).onEnd(() => {
    offsetX.value = translateX.value;
    offsetY.value = translateY.value;
  });
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }, { translateY: translateY.value }] }));
  const imageStyle = useAnimatedStyle(() => ({ width: withSpring(scaleImage.value), height: withSpring(scaleImage.value) }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View accessible accessibilityLabel="Sticker. Drag to move, or double tap to resize." style={[styles.stickerContainer, animatedStyle]}>
        <GestureDetector gesture={doubleTap}>
          <Animated.Image source={stickerSource} resizeMode="contain" style={[{ width: imageSize, height: imageSize }, imageStyle]} />
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({ stickerContainer: { position: 'absolute', left: '43%', top: '43%' } });
