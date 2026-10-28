// defino una parte de los estilos compartidos para mantener las pantallas modulares.
import { StyleSheet } from 'react-native';

const part = StyleSheet.create({
  moduleCard: {
      alignItems: 'center',
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      minHeight: 64,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
  moduleCardDesktop: {
      flexBasis: '48%',
      flexGrow: 1,
    },
  moduleCardPressed: {
      opacity: 0.82,
    },
  moduleIconBadge: {
      alignItems: 'center',
      borderRadius: 12,
      height: 38,
      justifyContent: 'center',
      width: 38,
    },
  moduleTitle: {
      fontSize: 13,
      fontWeight: '700',
    },
  moduleDescription: {
      fontSize: 10.5,
      marginTop: 2,
    },
  developmentCard: {
      alignItems: 'center',
      borderRadius: 20,
      borderWidth: 1,
      marginTop: 18,
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
  developmentIcon: {
      alignItems: 'center',
      borderRadius: 18,
      height: 64,
      justifyContent: 'center',
      marginBottom: 18,
      width: 64,
    },
  developmentTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  developmentCopy: { fontSize: 13, lineHeight: 20, marginTop: 9, maxWidth: 380, textAlign: 'center' },
  developmentBadge: { alignItems: 'center', borderRadius: 20, flexDirection: 'row', gap: 6, marginTop: 20, paddingHorizontal: 12, paddingVertical: 8 },
  developmentBadgeText: { fontSize: 11, fontWeight: '700' },
  profileGridDesktop: {
      flexDirection: 'row',
      gap: 20,
    },
  profileColumn: {
      flex: 1,
    },
  profileCard: {
      borderRadius: 18,
      borderWidth: 1,
      marginBottom: 18,
      padding: 18,
    },
  photoRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 14,
      marginVertical: 14,
    },
  photo: {
      borderRadius: 36,
      height: 72,
      width: 72,
    },
  photoFallback: {
      alignItems: 'center',
      borderRadius: 36,
      height: 72,
      justifyContent: 'center',
      width: 72,
    },
  photoInitials: {
      fontSize: 22,
      fontWeight: '900',
    },
  profileFullName: {
      fontSize: 17,
      fontWeight: '800',
    },
  profileMetaText: {
      fontSize: 11,
      marginTop: 2,
    },
  photoActions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
  smallBtn: {
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
  smallBtnText: {
      fontSize: 11,
      fontWeight: '800',
    },
  removePhoto: {
      color: '#dc2626',
      fontSize: 11,
      fontWeight: '700',
    },
  formLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 6,
      marginTop: 14,
    },
  formHelp: {
      fontSize: 11,
      marginTop: 4,
    },
  formInput: {
      borderRadius: 10,
      borderWidth: 1,
      fontSize: 13,
      height: 46,
      paddingHorizontal: 12,
    },
  primaryBtn: {
      alignItems: 'center',
      borderRadius: 11,
      height: 46,
      justifyContent: 'center',
      marginTop: 18,
    },
  primaryBtnText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '800',
    },
  disabled: {
      opacity: 0.65,
    },
  recoveryLink: {
      alignItems: 'center',
      paddingTop: 16,
    },
  recoveryText: {
      fontSize: 11,
      fontWeight: '700',
      textAlign: 'center',
    },
  logoutBtn: {
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      height: 48,
      justifyContent: 'center',
      marginTop: 10,
    },
  logoutText: {
      color: '#dc2626',
      fontSize: 13,
      fontWeight: '700',
    },
  appVersion: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginTop: 20,
      textAlign: 'center',
    },
  requestCard: {
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 14,
      padding: 16,
    },
  requestName: {
      fontSize: 15,
      fontWeight: '800',
    },
  requestEmail: {
      fontSize: 12,
      marginTop: 4,
    },
  requestInput: {
      borderRadius: 10,
      borderWidth: 1,
      marginTop: 12,
      minHeight: 42,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
  healthTab: {
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 1,
      flex: 1,
      justifyContent: 'center',
      minHeight: 40,
      paddingHorizontal: 10,
    },
  healthTabText: {
      fontSize: 12,
      fontWeight: '700',
    },
  roleLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 6,
      marginTop: 14,
    },
  roleOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 6,
    },
  roleOption: {
      borderRadius: 20,
      paddingHorizontal: 13,
      paddingVertical: 8,
    },
  roleOptionText: {
      fontSize: 11,
      fontWeight: '600',
    },
  requestActions: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'flex-end',
      marginTop: 14,
    },
  approveButton: {
      alignItems: 'center',
      borderRadius: 10,
      justifyContent: 'center',
      minHeight: 40,
      paddingHorizontal: 14,
    }
});

export default part;
