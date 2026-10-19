import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Ofrece un acceso táctil para volver al comienzo de una lista larga.
export function ScrollToTopButton({visible,onPress}:{visible:boolean;onPress:()=>void}){const {colors}=useTheme();if(!visible)return null;return <Pressable accessibilityRole="button" accessibilityLabel="Volver arriba" onPress={onPress} style={[styles.button,{backgroundColor:colors.primary}]}><Text style={styles.text}>↑</Text></Pressable>;}
const styles=StyleSheet.create({button:{position:'absolute',right:18,bottom:20,width:52,height:52,borderRadius:26,alignItems:'center',justifyContent:'center',elevation:5},text:{fontSize:26,color:'#fff',fontWeight:'700'}});
