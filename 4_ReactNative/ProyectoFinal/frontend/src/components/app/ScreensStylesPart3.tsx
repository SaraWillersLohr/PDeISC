// defino una parte de los estilos compartidos para mantener las pantallas modulares.
import { StyleSheet } from 'react-native';

const part = StyleSheet.create({
  approveText: {
      color: '#ffffff',
      fontSize: 11,
      fontWeight: '800',
    },
  rejectButton: {
      alignItems: 'center',
      borderColor: '#fca5a5',
      borderRadius: 10,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 40,
      paddingHorizontal: 14,
    },
  rejectText: {
      color: '#dc2626',
      fontSize: 11,
      fontWeight: '700',
    },
  requestNotice: {
      backgroundColor: '#e8efe5',
      borderRadius: 10,
      color: '#1f4e38',
      fontSize: 12,
      marginBottom: 12,
      padding: 12,
    },
  requestError: {
      backgroundColor: '#fff0ed',
      borderRadius: 10,
      color: '#9b3d36',
      fontSize: 12,
      marginBottom: 12,
      padding: 12,
    },
  emptyCard: {
      alignItems: 'center',
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 24,
      paddingVertical: 36,
    },
  emptyIcon: {
      alignItems: 'center',
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      marginBottom: 12,
      width: 48,
    },
  emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
    },
  emptyCopy: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 6,
      maxWidth: 380,
      textAlign: 'center',
    },
  modalBackdrop: {
      alignItems: 'center',
      backgroundColor: 'rgba(10,20,12,0.6)',
      flex: 1,
      justifyContent: 'center',
      padding: 22,
    },
  modalCard: {
      borderRadius: 20,
      borderWidth: 1,
      maxWidth: 440,
      padding: 22,
      width: '100%',
    },
  modalTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
  modalCopy: {
      fontSize: 13,
      lineHeight: 20,
      marginTop: 10,
    },
  backBtn: {
      alignSelf: 'flex-start',
      borderRadius: 9,
      margin: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
  backBtnText: {
      fontSize: 12,
      fontWeight: '700',
    }
});

export default part;
