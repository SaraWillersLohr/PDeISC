import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Explica cómo regresar cuando se abre una ruta desconocida.
export default function NotFound(){return <View style={styles.page}><Text style={styles.title}>No encontramos esta pantalla.</Text><Link href="/">Volver al inicio</Link></View>;}
const styles=StyleSheet.create({page:{flex:1,alignItems:'center',justifyContent:'center',padding:24,gap:12},title:{fontSize:20,fontWeight:'700'}});
