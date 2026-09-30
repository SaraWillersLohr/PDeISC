import React, { useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Modal, Pressable, ScrollView, SectionList, StatusBar, StyleSheet, Switch, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { componentes, Componente } from './components';

export default function App() {
  // guardo el componente elegido y las opciones que puede cambiar la persona.
  const { width } = useWindowDimensions();
  const [seleccion, setSeleccion] = useState<Componente | null>(null);
  const [oscuro, setOscuro] = useState(false);
  const [texto, setTexto] = useState('');
  const [cuenta, setCuenta] = useState(0);
  const [activo, setActivo] = useState(true);
  const [mensaje, setMensaje] = useState('Todavía no tocaste el botón.');
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const fondo = oscuro ? '#111827' : '#f4f7fb';
  const tarjeta = oscuro ? '#1f2937' : '#ffffff';
  const tinta = oscuro ? '#f8fafc' : '#172033';
  const tenue = oscuro ? '#c0cad8' : '#667085';
  const anchoCard = width > 1050 ? '31.5%' : width > 650 ? '47.5%' : '100%';

  // vuelvo a la lista cuando la persona cierra la demostración.
  const cerrar = () => setSeleccion(null);

  // dibujo una demostración pequeña según el componente elegido.
  const dibujarDemo = (item: Componente) => {
    switch (item.nombre) {
      case 'View': return <View style={styles.cajaDemo}><Text style={{ color: tinta }}>Este contenedor agrupa texto y espacio.</Text></View>;
      case 'Text': return <Text style={[styles.textoGrande, { color: '#635bdb' }]}>Hola, estoy aprendiendo</Text>;
      case 'Image': return <View style={styles.imagePlaceholder}><Image source={{ uri: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=500' }} style={styles.imagenDemo} /><Text style={{ color: tenue }}>Image muestra recursos visuales.</Text></View>;
      case 'ScrollView': return <ScrollView style={styles.scrollDemo}>{['Primer elemento', 'Segundo elemento', 'Tercer elemento', 'Cuarto elemento', 'Quinto elemento'].map((fila) => <Text key={fila} style={[styles.fila, { color: tinta }]}>{fila}</Text>)}</ScrollView>;
      case 'TextInput': return <TextInput value={texto} onChangeText={setTexto} placeholder="Escribí algo..." placeholderTextColor={tenue} style={[styles.input, { color: tinta, borderColor: oscuro ? '#475569' : '#d8deea' }]} />;
      case 'Button': return <View><Button title="Cambiar texto" onPress={() => setMensaje('¡El botón ejecutó su acción!')} /><Text style={[styles.centrado, { color: tinta }]}>{mensaje}</Text></View>;
      case 'Pressable': return <Pressable onPress={() => setCuenta(cuenta + 1)} style={styles.boton}><Text style={styles.botonTexto}>Presioname</Text><Text style={styles.botonTexto}>Toques: {cuenta}</Text></Pressable>;
      case 'Switch': return <View style={styles.enFila}><Text style={{ color: tinta }}>Estado: {activo ? 'activado' : 'desactivado'}</Text><Switch value={activo} onValueChange={setActivo} /></View>;
      case 'FlatList': return <FlatList scrollEnabled={false} data={['🍎  Manzana', '🍌  Banana', '🍊  Naranja']} keyExtractor={(fruta) => fruta} renderItem={({ item: fruta }) => <Text style={[styles.fila, { color: tinta }]}>{fruta}</Text>} />;
      case 'SectionList': return <SectionList scrollEnabled={false} sections={[{ title: 'Frutas', data: ['Manzana', 'Pera'] }, { title: 'Verduras', data: ['Zanahoria', 'Tomate'] }]} keyExtractor={(fila) => fila} renderSectionHeader={({ section }) => <Text style={[styles.subtitulo, { color: '#635bdb' }]}>{section.title}</Text>} renderItem={({ item: fila }) => <Text style={{ color: tinta, padding: 5 }}>• {fila}</Text>} />;
      case 'ActivityIndicator': return <View style={styles.centrado}><ActivityIndicator size="large" color="#635bdb" /><Button title={mostrarCarga ? 'Ocultar carga' : 'Mostrar carga'} onPress={() => setMostrarCarga(!mostrarCarga)} />{mostrarCarga && <Text style={{ color: tenue }}>Cargando datos...</Text>}</View>;
      case 'Modal': return <View><Text style={{ color: tinta, marginBottom: 12 }}>Una ventana encima del contenido.</Text><Button title="Abrir ventana" onPress={() => setMostrarCarga(true)} /><Modal visible={mostrarCarga} transparent animationType="fade" onRequestClose={() => setMostrarCarga(false)}><View style={styles.fondoModal}><View style={[styles.modal, { backgroundColor: tarjeta }]}><Text style={[styles.subtitulo, { color: tinta }]}>¡Hola desde el Modal!</Text><Button title="Cerrar" onPress={() => setMostrarCarga(false)} /></View></View></Modal></View>;
      case 'StatusBar': return <View><StatusBar barStyle={oscuro ? 'light-content' : 'dark-content'} /><Text style={{ color: tinta }}>La barra superior adapta su contenido al tema.</Text></View>;
      default: return null;
    }
  };

  return <View style={[styles.pantalla, { backgroundColor: fondo }]}>
    <StatusBar barStyle={oscuro ? 'light-content' : 'dark-content'} />
    <View style={[styles.cabecera, { backgroundColor: tarjeta }]}>
      <View style={styles.cabeceraFila}><View style={{ flex: 1 }}><Text style={[styles.etiqueta, { color: '#635bdb' }]}>GUÍA INTERACTIVA</Text><Text style={[styles.titulo, { color: tinta }]}>Componentes de{ '\n' }React Native</Text></View><Switch value={oscuro} onValueChange={setOscuro} accessibilityLabel="Activar modo oscuro" /></View>
      <Text style={[styles.descripcion, { color: tenue }]}>Conocé las piezas principales para crear interfaces y probá qué hace cada una.</Text>
      <Text style={[styles.contador, { color: tenue }]}>{componentes.length} componentes nativos · modo {oscuro ? 'oscuro' : 'claro'}</Text>
    </View>
    <ScrollView contentContainerStyle={styles.lista}>
      <View style={styles.grilla}>{componentes.map((item) => <View key={item.nombre} style={[styles.cardWrap, { width: anchoCard }]}>
        <View style={[styles.card, { backgroundColor: tarjeta }]}>
          <View style={styles.enFila}><View style={[styles.icono, { backgroundColor: item.color }]}><Text style={styles.iconoTexto}>{item.icono}</Text></View><View style={{ flex: 1 }}><Text style={[styles.nombre, { color: tinta }]}>{item.nombre}</Text><Text style={[styles.cardDescripcion, { color: tenue }]}>{item.descripcion}</Text></View></View>
          <Pressable accessibilityRole="button" onPress={() => { setSeleccion(item); setMostrarCarga(false); }} style={styles.botonPequeno}><Text style={styles.botonPequenoTexto}>Ver ejemplo  →</Text></Pressable>
        </View>
      </View>)}</View>
      <View style={[styles.pie, { backgroundColor: tarjeta }]}><Text style={[styles.pieTitulo, { color: tinta }]}>¿Qué son los componentes nativos?</Text><Text style={{ color: tenue, lineHeight: 21 }}>Son elementos de interfaz que React Native conecta con las vistas propias de Android y iOS. Esta guía toma como referencia la documentación oficial.</Text></View>
      <Text style={[styles.fuente, { color: tenue }]}>Referencia: reactnative.dev · Expo + TypeScript</Text>
    </ScrollView>
    <Modal visible={seleccion !== null} transparent animationType="slide" onRequestClose={cerrar}>
      <View style={styles.fondoModal}><View style={[styles.detalle, { backgroundColor: tarjeta }]}>
        <View style={styles.cabeceraFila}><Text style={[styles.tituloDetalle, { color: tinta }]}>{seleccion?.nombre}</Text><Pressable onPress={cerrar}><Text style={styles.cerrar}>Cerrar ✕</Text></Pressable></View>
        <Text style={[styles.descripcion, { color: tenue }]}>{seleccion?.descripcion}</Text>
        <Text style={[styles.subtitulo, { color: tinta }]}>Demostración</Text><View style={[styles.zonaDemo, { backgroundColor: oscuro ? '#111827' : '#f4f2ff' }]}>{seleccion && dibujarDemo(seleccion)}</View>
        <Text style={[styles.subtitulo, { color: tinta }]}>Código corto</Text><Text selectable style={styles.codigo}>{seleccion?.ejemplo}</Text>
      </View></View>
    </Modal>
  </View>;
}

// mantengo los estilos juntos para que sean fáciles de ubicar y modificar.
const styles = StyleSheet.create({
  pantalla: { flex: 1 }, cabecera: { paddingTop: 38, paddingHorizontal: 24, paddingBottom: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }, cabeceraFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  etiqueta: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginBottom: 8 }, titulo: { fontSize: 29, lineHeight: 34, fontWeight: '800' }, descripcion: { fontSize: 15, lineHeight: 22, marginTop: 10 }, contador: { fontSize: 12, marginTop: 12 },
  lista: { padding: 18, paddingBottom: 40 }, grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, cardWrap: { marginBottom: 14 }, card: { borderRadius: 17, padding: 15, minHeight: 145, justifyContent: 'space-between', shadowColor: '#1d2939', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }, enFila: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icono: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, iconoTexto: { color: '#344054', fontSize: 22, fontWeight: '800' }, nombre: { fontSize: 17, fontWeight: '700', marginBottom: 3 }, cardDescripcion: { fontSize: 13, lineHeight: 18 }, botonPequeno: { alignSelf: 'flex-end', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18, backgroundColor: '#eeedff', marginTop: 12 }, botonPequenoTexto: { color: '#5148c8', fontWeight: '700', fontSize: 12 },
  pie: { borderRadius: 16, padding: 18, marginTop: 5 }, pieTitulo: { fontWeight: '700', fontSize: 16, marginBottom: 7 }, fuente: { fontSize: 12, textAlign: 'center', marginTop: 16 }, detalle: { width: '100%', maxWidth: 560, alignSelf: 'center', borderRadius: 22, padding: 22, maxHeight: '90%' }, tituloDetalle: { fontSize: 24, fontWeight: '800' }, cerrar: { color: '#635bdb', fontWeight: '700' }, zonaDemo: { padding: 18, borderRadius: 15, minHeight: 95, justifyContent: 'center' }, codigo: { color: '#e6edf3', backgroundColor: '#202938', padding: 14, borderRadius: 12, overflow: 'hidden', fontFamily: 'monospace', fontSize: 12 }, cajaDemo: { padding: 18, backgroundColor: '#d9f5e9', borderRadius: 12 }, textoGrande: { fontSize: 20, fontWeight: '800', textAlign: 'center' }, imagePlaceholder: { alignItems: 'center', gap: 8 }, imagenDemo: { width: '100%', height: 110, borderRadius: 10 }, scrollDemo: { maxHeight: 145 }, fila: { padding: 10, backgroundColor: '#ffffffaa', borderRadius: 8, marginBottom: 5 }, input: { borderWidth: 1, borderRadius: 10, padding: 12, backgroundColor: '#ffffff55' }, boton: { backgroundColor: '#635bdb', borderRadius: 11, padding: 13, alignItems: 'center', gap: 5 }, botonTexto: { color: '#fff', fontWeight: '700' }, centrado: { alignItems: 'center', gap: 10, padding: 8 }, modal: { alignSelf: 'center', width: '100%', maxWidth: 360, borderRadius: 18, padding: 22 }, fondoModal: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }, subtitulo: { fontSize: 16, fontWeight: '700', marginTop: 14, marginBottom: 8 },
});
