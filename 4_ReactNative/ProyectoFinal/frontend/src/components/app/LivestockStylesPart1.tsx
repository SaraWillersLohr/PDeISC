// defino una parte de los estilos compartidos para mantener las pantallas modulares.
import { StyleSheet } from 'react-native';

const part = StyleSheet.create({
  animalPhoto: { borderRadius: 12, height: 40, width: 40 },
  evolutionPhoto: { borderRadius: 10, height: 190, marginTop: 10, width: '100%' },
  safe: { flex: 1 },
  page: { padding: 18, paddingBottom: 36 },
  pageDesktop: { paddingHorizontal: 40, paddingTop: 24 },
  innerWrapper: { width: '100%' },
  innerWrapperDesktop: { alignSelf: 'center', maxWidth: 1200, width: '100%' },
  pageHead: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
  pageHeadDesktop: {
      alignItems: 'center',
      marginBottom: 20,
    },
  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.2, marginTop: 4 },
  countBadge: {
      backgroundColor: 'rgba(134, 239, 172, 0.16)',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
  countText: { fontSize: 11, fontWeight: '800' },
  searchRow: {
      flexDirection: 'column',
      gap: 10,
      marginBottom: 18,
    },
  searchRowDesktop: {
      alignItems: 'center',
      flexDirection: 'row',
    },
  inventoryActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  searchBox: {
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row',
      height: 46,
      paddingHorizontal: 12,
    },
  searchInput: {
      flex: 1,
      fontSize: 13,
    },
  speciesFilter: { marginBottom: 16 },
  speciesFilterLabel: { fontSize: 11, fontWeight: '700', marginBottom: 8 },
  speciesFilterOptions: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  speciesChip: { borderRadius: 18, borderWidth: 1, minHeight: 34, justifyContent: 'center', paddingHorizontal: 14 },
  speciesChipText: { fontSize: 11, fontWeight: '700' },
  gridContainer: {
      gap: 12,
    },
  gridContainerDesktop: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
  card: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
    },
  cardDesktop: {
      flexBasis: '48%',
      flexGrow: 1,
    },
  row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
    },
  badge: {
      alignItems: 'center',
      borderRadius: 12,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
  title: {
      fontSize: 14,
      fontWeight: '800',
    },
  detail: {
      fontSize: 11,
      lineHeight: 16,
      marginTop: 2,
    },
  statePill: {
      borderRadius: 12,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
  stateHealthy: {
      backgroundColor: '#eaf4ec',
    },
  stateAlert: {
      backgroundColor: '#fee2e2',
    },
  stateText: {
      fontSize: 9.5,
      fontWeight: '800',
      textTransform: 'capitalize',
    },
  stateTextHealthy: {
      color: '#1f4e38',
    },
  stateTextAlert: {
      color: '#dc2626',
    },
  divider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 12,
    },
  occupancy: {
      fontSize: 18,
      fontWeight: '800',
    },
  track: {
      backgroundColor: 'rgba(128,128,128,0.15)',
      borderRadius: 5,
      height: 8,
      marginBottom: 8,
      marginTop: 14,
      overflow: 'hidden',
    },
  progress: {
      borderRadius: 5,
      height: 8,
    },
  noticeBanner: {
      alignItems: 'center',
      backgroundColor: '#fffbeb',
      borderRadius: 8,
      flexDirection: 'row',
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
  noticeText: {
      color: '#92400e',
      fontSize: 10.5,
      fontWeight: '700',
    },
  noticeDate: {
      fontSize: 10,
      marginTop: 2,
    },
  empty: {
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      padding: 32,
    },
  emptyIconWrap: {
      alignItems: 'center',
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      marginBottom: 12,
      width: 48,
    },
  message: {
      alignItems: 'center',
      gap: 12,
      padding: 40,
    },
  retry: {
      borderRadius: 10,
      marginTop: 14,
      paddingHorizontal: 16,
      paddingVertical: 9,
    },
  retryText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '800',
    },
  moveButton: {
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
  moveButtonText: {
      fontSize: 11,
      fontWeight: '800',
    },
  confirmButton: {
      alignItems: 'center',
      borderRadius: 10,
      flexDirection: 'row',
      height: 44,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
  matingCtas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  matingCta: { alignItems: 'center', borderRadius: 10, flexBasis: '48%', flexDirection: 'row', flexGrow: 1, gap: 8, justifyContent: 'center', minHeight: 44, paddingHorizontal: 14 },
  confirmText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '800',
    },
  cancelButton: {
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 1,
      height: 44,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
  cancelText: {
      fontSize: 12,
      fontWeight: '700',
    },
  disabledButton: {
      opacity: 0.5,
    },
  backdrop: {
      alignItems: 'center',
      backgroundColor: 'rgba(10,20,12,0.6)',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
  modal: {
      borderRadius: 20,
      borderWidth: 1,
      maxHeight: '85%',
      maxWidth: 440,
      padding: 22,
      width: '100%',
    },
  animalDetailScroll: {
      flexShrink: 1,
    }
});

export default part;
