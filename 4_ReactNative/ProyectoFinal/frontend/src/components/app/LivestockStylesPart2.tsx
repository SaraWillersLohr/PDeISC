// defino una parte de los estilos compartidos para mantener las pantallas modulares.
import { StyleSheet } from 'react-native';

const part = StyleSheet.create({
  animalDetailModal: {
      maxWidth: 620,
    },
  animalDetailContent: {
      paddingBottom: 2,
    },
  modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 6,
    },
  modalInput: {
      borderRadius: 10,
      borderWidth: 1,
      fontSize: 13,
      height: 46,
      marginTop: 10,
      paddingHorizontal: 12,
    },
  notesInput: {
      borderRadius: 10,
      borderWidth: 1,
      fontSize: 12,
      marginTop: 12,
      minHeight: 80,
      padding: 12,
      textAlignVertical: 'top',
    },
  selectLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 6,
      marginTop: 14,
    },
  destination: {
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 8,
      padding: 12,
    },
  destinationText: {
      fontSize: 12.5,
      fontWeight: '700',
    },
  genderOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  genderOption: { borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9 },
  matingActions: { gap: 8, marginTop: 18 },
  matingActionButton: { alignItems: 'center', borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 12 },
  modalActions: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'flex-end',
      marginTop: 18,
    },
  errorText: {
      color: '#dc2626',
      fontSize: 11,
      marginTop: 8,
    },
  successText: { color: '#2d6a4f', fontSize: 12, fontWeight: '700', marginBottom: 10 }
});

export default part;
