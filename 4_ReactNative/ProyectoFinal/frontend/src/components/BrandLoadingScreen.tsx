// muestro la marca completa mientras se restaura la sesión local.
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

const logo = require('../../assets/logo-app.png');

export function BrandLoadingScreen() {
  return (
    <View style={styles.container}>
      <Image accessibilityLabel="EstanciaApp" resizeMode="contain" source={logo} style={styles.logo} />
      <View style={styles.loadingRow}>
        <ActivityIndicator color="#86efac" size="small" />
        <Text style={styles.loadingText}>Iniciando sistema…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#0f2418',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  logo: {
    height: 260,
    maxWidth: 320,
    width: '100%',
    marginBottom: 32,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    color: '#b5cbb9',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

