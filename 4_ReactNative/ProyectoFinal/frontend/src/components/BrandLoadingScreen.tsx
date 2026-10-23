// muestro la marca completa mientras se restaura la sesión local.
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

const logo = require('../../assets/branding/dark/logo.png');

export function BrandLoadingScreen() {
  return (
    <View style={styles.container}>
      <Image accessibilityLabel="EstanciaApp" resizeMode="contain" source={logo} style={styles.logo} />
      <ActivityIndicator color="#b8e34d" size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: '#123824', flex: 1, justifyContent: 'center', padding: 32 },
  logo: { height: 280, maxWidth: 320, width: '100%' },
});
