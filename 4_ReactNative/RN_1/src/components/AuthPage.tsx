import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

const cowPhoto = require('../../assets/img_login.png');

export function AuthPage({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const wide = width >= 820;
  return <View style={[styles.page, wide && styles.pageWide]}>
    <ImageBackground source={cowPhoto} resizeMode="cover" style={[styles.hero, wide ? styles.heroWide : styles.heroMobile]} imageStyle={styles.photo}>
      <View style={styles.tint} />
      <View style={[styles.heroContent, !wide && styles.heroContentMobile]}>
        <View style={styles.brandMark}><Text style={styles.brandLeaf}>🌿</Text></View>
        <Text style={styles.eyebrow}>ESTANCIA APP</Text>
        <Text style={styles.heroTitle}>{wide ? 'Todo tu campo, en equilibrio.' : 'Gestión de campo'}</Text>
        {wide ? <Text style={styles.heroSubtitle}>Cuidamos cada detalle de tu estancia para que puedas enfocarte en lo que más importa.</Text> : null}
      </View>
      {wide ? <Text style={styles.photoCaption}>Una estancia, todo bajo control.</Text> : null}
    </ImageBackground>
    <View style={[styles.formPane, wide ? styles.formPaneWide : styles.formPaneMobile]}>
      <View style={styles.formInner}>{children}</View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f4f7f3' },
  pageWide: { flexDirection: 'row', padding: 22, gap: 22, backgroundColor: '#eaf0e9' },
  hero: { overflow: 'hidden', justifyContent: 'center', backgroundColor: '#37583b' },
  heroWide: { flex: 1, minWidth: 0, borderRadius: 25, minHeight: 560 },
  heroMobile: { width: '100%', height: 190 },
  photo: { borderRadius: 24 },
  tint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20, 46, 26, 0.40)' },
  heroContent: { position: 'relative', maxWidth: 520, paddingHorizontal: 50, paddingVertical: 42 },
  heroContentMobile: { paddingHorizontal: 26, paddingVertical: 19 },
  brandMark: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#f0f5eb', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  brandLeaf: { color: '#315d3d', fontSize: 22, fontWeight: '900' },
  eyebrow: { color: '#e4eedc', fontWeight: '800', fontSize: 11, letterSpacing: 2.7 },
  heroTitle: { color: '#fff', fontSize: 38, lineHeight: 44, fontWeight: '800', marginTop: 12, maxWidth: 420 },
  heroSubtitle: { color: '#edf3e8', fontSize: 16, lineHeight: 25, marginTop: 12, maxWidth: 390 },
  photoCaption: { position: 'absolute', bottom: 29, left: 50, color: '#f4f7ef', fontSize: 12, letterSpacing: 0.4 },
  formPane: { backgroundColor: '#fff', justifyContent: 'center' },
  formPaneWide: { width: '49%', maxWidth: 620, borderRadius: 25, paddingHorizontal: 28, paddingVertical: 30 },
  formPaneMobile: { flex: 1, paddingHorizontal: 24, paddingVertical: 24 },
  formInner: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', justifyContent: 'center' },
});
