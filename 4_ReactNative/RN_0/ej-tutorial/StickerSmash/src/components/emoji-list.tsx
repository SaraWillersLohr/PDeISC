import { FlatList, Image, ImageSourcePropType, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme';

const emojiImages: ImageSourcePropType[] = [
  require('@/assets/images/emoji1.png'),
  require('@/assets/images/emoji2.png'),
  require('@/assets/images/emoji3.png'),
  require('@/assets/images/emoji4.png'),
  require('@/assets/images/emoji5.png'),
  require('@/assets/images/emoji6.png'),
];

type Props = { onSelect: (emoji: ImageSourcePropType) => void; onCloseModal: () => void };

export default function EmojiList({ onSelect, onCloseModal }: Props) {
  const { colors } = useAppTheme();
  return (
    <FlatList
      data={emojiImages}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      keyExtractor={(_, index) => `emoji-${index}`}
      renderItem={({ item, index }) => (
        <Pressable accessibilityRole="button" accessibilityLabel={`Choose sticker ${index + 1}`} onPress={() => { onSelect(item); onCloseModal(); }} style={({ pressed }) => [styles.option, { backgroundColor: pressed ? colors.accentSoft : 'transparent' }]}>
          <Image source={item} style={styles.image} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({ list: { alignItems: 'center', gap: 16, paddingHorizontal: 8 }, option: { padding: 8, borderRadius: 14 }, image: { width: 88, height: 88, resizeMode: 'contain' } });
