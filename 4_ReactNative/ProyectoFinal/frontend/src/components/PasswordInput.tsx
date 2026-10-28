import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps, type StyleProp, type ViewStyle } from 'react-native';

type Props = Omit<TextInputProps, 'secureTextEntry' | 'style'> & {
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps['style'];
};

export function PasswordInput({ containerStyle, inputStyle, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput {...inputProps} secureTextEntry={!visible} style={[styles.input, inputStyle]} />
      <Pressable
        accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => setVisible((current) => !current)}
        style={styles.toggle}
      >
        <Ionicons color="#748076" name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', width: '100%' },
  input: { paddingRight: 44, width: '100%' },
  toggle: { alignItems: 'center', bottom: 0, justifyContent: 'center', position: 'absolute', right: 4, top: 0, width: 38 },
});
