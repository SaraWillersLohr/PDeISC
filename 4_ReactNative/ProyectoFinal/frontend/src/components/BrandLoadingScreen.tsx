// muestro la marca completa mientras se restaura la sesión local.
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

const logo = require('../../assets/branding/dark/logo.png');

export function BrandLoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoCard}>
        <Image accessibilityLabel="EstanciaApp" resizeMode="contain" source={logo} style={styles.logo} />
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>GESTIÓN GANADERA Y DE CAMPO</Text>
      </View>
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
  logoCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(134, 239, 172, 0.18)',
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 28,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logo: {
    height: 160,
    maxWidth: 240,
    width: 240,
  },
  badge: {
    backgroundColor: 'rgba(134, 239, 172, 0.12)',
    borderColor: 'rgba(134, 239, 172, 0.25)',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 28,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#86efac',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
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

