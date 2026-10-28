// defino una parte de los estilos compartidos para mantener las pantallas modulares.
import { StyleSheet } from 'react-native';

const part = StyleSheet.create({
  overlay: { alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.48)', flex: 1, justifyContent: 'center', padding: 20 },
  safe: { flex: 1 },
  page: { padding: 18, paddingBottom: 36 },
  pageDesktop: { paddingHorizontal: 40, paddingTop: 24 },
  innerContainer: { width: '100%' },
  innerContainerDesktop: { alignSelf: 'center', maxWidth: 1200, width: '100%' },
  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.2, marginBottom: 20, marginTop: 4 },
  modalCard: {
      alignSelf: 'center',
      marginBottom: 0,
      maxWidth: 440,
      width: '100%',
    },
  card: {
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 12,
      padding: 16,
    },
  cardDesktop: {
      flexBasis: '48%',
      flexGrow: 1,
    },
  cardTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
  input: {
      borderRadius: 10,
      borderWidth: 1,
      fontSize: 13,
      height: 46,
      marginTop: 10,
      paddingHorizontal: 12,
    },
  primary: {
      alignItems: 'center',
      borderRadius: 10,
      height: 44,
      justifyContent: 'center',
      marginTop: 14,
      paddingHorizontal: 16,
    },
  primaryText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '800',
    },
  pregnancyButton: {
      alignItems: 'center',
      borderRadius: 10,
      flexDirection: 'row',
      gap: 7,
      justifyContent: 'center',
      marginTop: 14,
      minHeight: 44,
      paddingHorizontal: 14,
      width: '100%',
    },
  copy: {
      fontSize: 11.5,
      lineHeight: 17,
      marginTop: 5,
    },
  error: {
      backgroundColor: '#fff0ed',
      borderRadius: 10,
      color: '#dc2626',
      fontSize: 12,
      marginBottom: 14,
      padding: 12,
    },
  row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
    },
  rowWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
  userChip: {
      alignItems: 'center',
      borderRadius: 20,
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
  userChipText: {
      fontSize: 11,
      fontWeight: '700',
    },
  statusPill: {
      alignItems: 'center',
      borderRadius: 12,
      flexDirection: 'row',
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
  statusPillText: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'capitalize',
    },
  taskFooter: {
      marginTop: 10,
    },
  actionHint: {
      fontSize: 10.5,
      fontWeight: '800',
      marginTop: 6,
    },
  section: {
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 10,
      marginTop: 14,
    },
  gridWrap: {
      gap: 12,
    },
  gridWrapDesktop: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
  twoColDesktop: {
      flexDirection: 'row',
      gap: 16,
    },
  colItem: {
      flex: 1,
    },
  badgeCircle: {
      alignItems: 'center',
      borderRadius: 12,
      height: 36,
      justifyContent: 'center',
      width: 36,
    }
});

export default part;
