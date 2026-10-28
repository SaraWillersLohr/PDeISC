// defino una parte de los estilos compartidos para mantener las pantallas modulares.
import { StyleSheet } from 'react-native';

const part = StyleSheet.create({
  safe: { flex: 1 },
  page: { padding: 18, paddingBottom: 36 },
  pageDesktop: { paddingHorizontal: 40, paddingTop: 24 },
  innerWrapper: { width: '100%' },
  innerWrapperDesktop: { alignSelf: 'center', maxWidth: 1200, width: '100%' },
  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginBottom: 14 },
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
  gridWrap: {
      gap: 12,
    },
  gridWrapDesktop: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
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
  title: {
      fontSize: 14,
      fontWeight: '800',
    },
  sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      marginBottom: 12,
      marginTop: 24,
    },
  copy: {
      fontSize: 11.5,
      lineHeight: 16,
      marginTop: 3,
    },
  avatarBadge: {
      alignItems: 'center',
      borderRadius: 12,
      height: 38,
      justifyContent: 'center',
      width: 38,
    },
  roleBadge: {
      borderRadius: 12,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
  roleBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'capitalize',
    },
  primary: {
      alignItems: 'center',
      borderRadius: 10,
      flexDirection: 'row',
      height: 42,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
  primaryText: {
      color: '#ffffff',
      fontSize: 11,
      fontWeight: '800',
    },
  secondary: {
      borderRadius: 10,
      borderWidth: 1,
      height: 42,
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
  secondaryText: {
      fontSize: 11,
      fontWeight: '700',
    },
  deleteIconButton: {
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 1,
      height: 42,
      justifyContent: 'center',
      width: 48,
    },
  danger: {
      borderColor: '#fca5a5',
      borderRadius: 10,
      borderWidth: 1,
      height: 42,
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
  dangerText: {
      color: '#dc2626',
      fontSize: 11,
      fontWeight: '700',
    },
  error: {
      backgroundColor: '#fff0ed',
      borderRadius: 10,
      color: '#dc2626',
      fontSize: 12,
      marginBottom: 14,
      padding: 12,
    },
  success: {
      backgroundColor: '#eaf4ec',
      borderRadius: 10,
      color: '#1f4e38',
      fontSize: 12,
      marginVertical: 10,
      padding: 12,
    },
  fieldLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 4,
      marginTop: 14,
    },
  input: {
      borderRadius: 10,
      borderWidth: 1,
      fontSize: 13,
      height: 46,
      marginTop: 6,
      paddingHorizontal: 12,
    },
  option: {
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
  optionText: {
      fontSize: 11,
      fontWeight: '700',
    },
  breedList: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 14,
    },
  breedChip: {
      borderRadius: 14,
      paddingHorizontal: 11,
      paddingVertical: 5,
    },
  breedChipText: {
      fontSize: 10.5,
      fontWeight: '800',
    },
  overlay: {
      alignItems: 'center',
      backgroundColor: 'rgba(10,20,12,0.6)',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
  modal: {
      borderRadius: 20,
      borderWidth: 1,
      maxWidth: 440,
      padding: 22,
      width: '100%',
    }
});

export default part;
