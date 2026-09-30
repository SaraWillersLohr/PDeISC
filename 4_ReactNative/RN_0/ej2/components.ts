export type Componente = { nombre: string; descripcion: string; color: string; icono: string; ejemplo: string };

// guardo una descripción corta y una idea de ejemplo para cada componente.
export const componentes: Componente[] = [
  { nombre: 'View', descripcion: 'Agrupa elementos y organiza el diseño.', color: '#d9f5e9', icono: '▦', ejemplo: '<View style={styles.caja}>contenido</View>' },
  { nombre: 'Text', descripcion: 'Muestra texto y permite aplicarle estilos.', color: '#deebff', icono: 'T', ejemplo: '<Text>Hola, React Native</Text>' },
  { nombre: 'Image', descripcion: 'Muestra imágenes locales o de internet.', color: '#ffead0', icono: '▧', ejemplo: '<Image source={require("./foto.png")} />' },
  { nombre: 'ScrollView', descripcion: 'Permite recorrer contenido con scroll.', color: '#d9f5e9', icono: '↕', ejemplo: '<ScrollView>{contenido}</ScrollView>' },
  { nombre: 'TextInput', descripcion: 'Recibe texto que escribe la persona.', color: '#eee1ff', icono: '✎', ejemplo: '<TextInput value={texto} onChangeText={setTexto} />' },
  { nombre: 'Button', descripcion: 'Ofrece un botón con una acción sencilla.', color: '#deebff', icono: '▣', ejemplo: '<Button title="Tocar" onPress={alTocar} />' },
  { nombre: 'Pressable', descripcion: 'Detecta pulsaciones para crear controles.', color: '#ffe0e6', icono: '☝', ejemplo: '<Pressable onPress={alTocar}>...</Pressable>' },
  { nombre: 'Switch', descripcion: 'Cambia un valor entre activado y apagado.', color: '#d9f5e9', icono: '◉', ejemplo: '<Switch value={activo} onValueChange={setActivo} />' },
  { nombre: 'FlatList', descripcion: 'Muestra listas de forma eficiente.', color: '#ffead0', icono: '☷', ejemplo: '<FlatList data={frutas} renderItem={...} />' },
  { nombre: 'SectionList', descripcion: 'Agrupa elementos en secciones.', color: '#ffead0', icono: '▤', ejemplo: '<SectionList sections={grupos} renderItem={...} />' },
  { nombre: 'ActivityIndicator', descripcion: 'Indica que una tarea está cargando.', color: '#deebff', icono: '◌', ejemplo: '<ActivityIndicator size="large" />' },
  { nombre: 'Modal', descripcion: 'Presenta contenido sobre la pantalla actual.', color: '#ffe0e6', icono: '▢', ejemplo: '<Modal visible={abierto}>...</Modal>' },
  { nombre: 'StatusBar', descripcion: 'Controla la barra superior del dispositivo.', color: '#eee1ff', icono: '▰', ejemplo: '<StatusBar barStyle="dark-content" />' },
];
