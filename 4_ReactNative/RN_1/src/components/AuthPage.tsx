// Marco visual compartido por las pantallas de autenticación: imagen lateral en escritorio y fondo completo en móvil.
import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

const cowPhoto = require('../../assets/img_login.png');

// Esta función adapta la presentación de acceso al tamaño disponible sin superponer el título con el formulario.
export function AuthPage({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const wide = width >= 820;

  if (!wide) {
    return <ImageBackground source={cowPhoto} resizeMode="cover" style={styles.mobileBackground} imageStyle={styles.photo}>
      <View style={styles.mobileTint} />
      <View style={styles.mobileBrand}>
        <View style={styles.brandMark}><Text style={styles.brandLeaf}>🌿</Text></View>
        <Text style={styles.eyebrow}>ESTANCIA APP</Text>
        <Text style={styles.mobileHeroTitle}>Gestión de campo</Text>
      </View>
      <View style={styles.mobileFormPane}><View style={styles.mobileFormInner}>{children}</View></View>
    </ImageBackground>;
  }

  return <View style={styles.pageWide}>
    <ImageBackground source={cowPhoto} resizeMode="cover" style={styles.heroWide} imageStyle={styles.photo}>
      <View style={styles.tint} />
      <View style={styles.heroContent}>
        <View style={styles.brandMark}><Text style={styles.brandLeaf}>🌿</Text></View>
        <Text style={styles.eyebrow}>ESTANCIA APP</Text>
        <Text style={styles.heroTitle}>Todo tu campo, en equilibrio.</Text>
        <Text style={styles.heroSubtitle}>Cuidamos cada detalle de tu estancia para que puedas enfocarte en lo que más importa.</Text>
      </View>
      <Text style={styles.photoCaption}>Una estancia, todo bajo control.</Text>
    </ImageBackground>
    <View style={styles.formPaneWide}><View style={styles.formInner}>{children}</View></View>
  </View>;
}

const styles = StyleSheet.create({
  pageWide: { flex: 1, flexDirection: 'row', padding: 22, gap: 22, backgroundColor: '#eaf0e9' },
  mobileBackground: { flex: 1, backgroundColor: '#244a30' },
  photo: { borderRadius: 24 },
  mobileTint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20, 46, 26, 0.48)' },
  mobileBrand: { paddingTop: 34, paddingHorizontal: 25, paddingBottom: 18 },
  brandMark: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#f0f5eb', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  brandLeaf: { color: '#315d3d', fontSize: 23, fontWeight: '900' },
  eyebrow: { color: '#e4eedc', fontWeight: '800', fontSize: 11, letterSpacing: 2.7 },
  mobileHeroTitle: { color: '#fff', fontSize: 31, lineHeight: 36, fontWeight: '800', marginTop: 8 },
  mobileFormPane: { flex: 1, minHeight: 0, marginTop: 4, paddingHorizontal: 17, paddingTop: 18, paddingBottom: 12, backgroundColor: 'rgba(255,255,255,0.97)', borderTopLeftRadius: 27, borderTopRightRadius: 27 },
  mobileFormInner: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  heroWide: { flex: 1, minWidth: 0, borderRadius: 25, minHeight: 560, overflow: 'hidden', justifyContent: 'center', backgroundColor: '#37583b' },
  tint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20, 46, 26, 0.40)' },
  heroContent: { position: 'relative', maxWidth: 520, paddingHorizontal: 50, paddingVertical: 42 },
  heroTitle: { color: '#fff', fontSize: 38, lineHeight: 44, fontWeight: '800', marginTop: 12, maxWidth: 420 },
  heroSubtitle: { color: '#edf3e8', fontSize: 16, lineHeight: 25, marginTop: 12, maxWidth: 390 },
  photoCaption: { position: 'absolute', bottom: 29, left: 50, color: '#f4f7ef', fontSize: 12, letterSpacing: 0.4 },
  formPaneWide: { width: '49%', maxWidth: 620, borderRadius: 25, paddingHorizontal: 28, paddingVertical: 30, backgroundColor: '#fff', justifyContent: 'center' },
  formInner: { width: '100%', maxWidth: 480, alignSelf: 'center', justifyContent: 'center' },
});
