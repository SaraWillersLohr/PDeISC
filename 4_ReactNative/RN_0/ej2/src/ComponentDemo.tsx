import React from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  SectionList,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Componente } from "../components";

type Props = {
  item: Componente | null;
  oscuro: boolean;
  tarjeta: string;
  tinta: string;
  tenue: string;
  texto: string;
  onCambiarTexto: (texto: string) => void;
  cuenta: number;
  onCambiarCuenta: (cuenta: number) => void;
  activo: boolean;
  onCambiarActivo: (activo: boolean) => void;
  mensaje: string;
  onCambiarMensaje: (mensaje: string) => void;
  mostrarCarga: boolean;
  onCambiarCarga: (mostrar: boolean) => void;
};

// Dibuja la demostración correspondiente al componente seleccionado.
export function ComponentDemo(props: Props) {
  // Separa las propiedades para usarlas en cada demostración.
  const {
    item,
    oscuro,
    tarjeta,
    tinta,
    tenue,
    texto,
    onCambiarTexto,
    cuenta,
    onCambiarCuenta,
    activo,
    onCambiarActivo,
    mensaje,
    onCambiarMensaje,
    mostrarCarga,
    onCambiarCarga,
  } = props;
  const colorAcento = oscuro ? "#b5adff" : "#635bdb";

  switch (item?.nombre) {
    case "View":
      return (
        <View
          style={[
            styles.cajaDemo,
            { backgroundColor: oscuro ? "#26384a" : "#d9f5e9" },
          ]}
        >
          <Text style={{ color: tinta }}>
            Este contenedor agrupa texto y espacio.
          </Text>
        </View>
      );
    case "Text":
      return (
        <Text style={[styles.textoGrande, { color: colorAcento }]}>
          Hola, estoy aprendiendo
        </Text>
      );
    case "Image":
      return (
        <View style={styles.imagePlaceholder}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=500",
            }}
            style={styles.imagenDemo}
          />
          <Text style={{ color: tenue }}>Image muestra recursos visuales.</Text>
        </View>
      );
    case "ScrollView":
      return (
        <ScrollView style={styles.scrollDemo}>
          {[
            "Primer elemento",
            "Segundo elemento",
            "Tercer elemento",
            "Cuarto elemento",
            "Quinto elemento",
          ].map(
            /* Muestra cada texto de la lista desplazable. */ (fila) => (
              <Text
                key={fila}
                style={[
                  styles.fila,
                  { color: tinta, backgroundColor: oscuro ? "#273449" : "#ffffff" },
                ]}
              >
                {fila}
              </Text>
            ),
          )}
        </ScrollView>
      );
    case "TextInput":
      return (
        <TextInput
          value={texto}
          onChangeText={onCambiarTexto}
          placeholder="Escribí algo..."
          placeholderTextColor={tenue}
          style={[
            styles.input,
            {
              color: tinta,
              borderColor: oscuro ? "#64748b" : "#d8deea",
              backgroundColor: oscuro ? "#273449" : "#ffffff",
            },
          ]}
        />
      );
    case "Button":
      return (
        <View>
          <Button
            title="Cambiar texto"
            onPress={
              /* Cambia el mensaje al tocar el botón. */ () =>
                onCambiarMensaje("¡El botón ejecutó su acción!")
            }
          />
          <Text style={[styles.centrado, { color: tinta }]}>{mensaje}</Text>
        </View>
      );
    case "Pressable":
      return (
        <Pressable
          onPress={
            /* Suma un toque al contador. */ () => onCambiarCuenta(cuenta + 1)
          }
          style={styles.boton}
        >
          <Text style={styles.botonTexto}>Presioname</Text>
          <Text style={styles.botonTexto}>Toques: {cuenta}</Text>
        </Pressable>
      );
    case "Switch":
      return (
        <View style={styles.enFila}>
          <Text style={{ color: tinta }}>
            Estado: {activo ? "activado" : "desactivado"}
          </Text>
          <Switch
            value={activo}
            onValueChange={onCambiarActivo}
            trackColor={{ false: oscuro ? "#475569" : "#d0d5dd", true: colorAcento }}
            thumbColor={activo ? "#ffffff" : oscuro ? "#cbd5e1" : "#f9fafb"}
          />
        </View>
      );
    case "FlatList":
      return (
        <FlatList
          scrollEnabled={false}
          data={["🍎  Manzana", "🍌  Banana", "🍊  Naranja"]}
          keyExtractor={
            /* Usa el nombre de la fruta como clave. */ (fruta) => fruta
          }
          renderItem={
            /* Dibuja una fila por cada fruta. */ ({ item: fruta }) => (
              <Text
                style={[
                  styles.fila,
                  { color: tinta, backgroundColor: oscuro ? "#273449" : "#ffffff" },
                ]}
              >
                {fruta}
              </Text>
            )
          }
        />
      );
    case "SectionList":
      return (
        <SectionList
          scrollEnabled={false}
          sections={[
            { title: "Frutas", data: ["Manzana", "Pera"] },
            { title: "Verduras", data: ["Zanahoria", "Tomate"] },
          ]}
          keyExtractor={
            /* Usa el texto de la fila como clave. */ (fila) => fila
          }
          renderSectionHeader={
            /* Muestra el título de cada sección. */ ({ section }) => (
              <Text style={[styles.subtitulo, { color: colorAcento }]}>
                {section.title}
              </Text>
            )
          }
          renderItem={
            /* Dibuja una fila dentro de la sección. */ ({ item: fila }) => (
              <Text style={{ color: tinta, padding: 5 }}>• {fila}</Text>
            )
          }
        />
      );
    case "ActivityIndicator":
      return (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={colorAcento} />
          <Button
            title={mostrarCarga ? "Ocultar carga" : "Mostrar carga"}
            onPress={
              /* Alterna el mensaje de carga. */ () =>
                onCambiarCarga(!mostrarCarga)
            }
          />
          {mostrarCarga && (
            <Text style={{ color: tenue }}>Cargando datos...</Text>
          )}
        </View>
      );
    case "Modal":
      return (
        <View>
          <Text style={{ color: tinta, marginBottom: 12 }}>
            Una ventana encima del contenido.
          </Text>
          <Button
            title="Abrir ventana"
            onPress={/* Abre el modal de ejemplo. */ () => onCambiarCarga(true)}
          />
          <Modal
            visible={mostrarCarga}
            transparent
            animationType="fade"
            onRequestClose={
              /* Cierra el modal al solicitar el cierre. */ () =>
                onCambiarCarga(false)
            }
          >
            <View style={styles.fondoModal}>
              <View style={[styles.modal, { backgroundColor: tarjeta }]}>
                <Text style={[styles.subtitulo, { color: tinta }]}>
                  ¡Hola desde el Modal!
                </Text>
                <Button
                  title="Cerrar"
                  onPress={
                    /* Cierra el modal al tocar el botón. */ () =>
                      onCambiarCarga(false)
                  }
                />
              </View>
            </View>
          </Modal>
        </View>
      );
    case "StatusBar":
      return (
        <View>
          <StatusBar barStyle={oscuro ? "light-content" : "dark-content"} />
          <Text style={{ color: tinta }}>
            La barra superior adapta su contenido al tema.
          </Text>
        </View>
      );
    default:
      return null;
  }
}

// Reúne los estilos compartidos por las demostraciones.
const styles = StyleSheet.create({
  cajaDemo: { padding: 18, borderRadius: 12 },
  textoGrande: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  imagePlaceholder: { alignItems: "center", gap: 8 },
  imagenDemo: { width: "100%", height: 110, borderRadius: 10 },
  scrollDemo: { maxHeight: 145 },
  fila: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#ffffff55",
  },
  boton: {
    backgroundColor: "#635bdb",
    borderRadius: 11,
    padding: 13,
    alignItems: "center",
    gap: 5,
  },
  botonTexto: { color: "#fff", fontWeight: "700" },
  centrado: { alignItems: "center", gap: 10, padding: 8 },
  enFila: { flexDirection: "row", alignItems: "center", gap: 12 },
  modal: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    padding: 22,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
  },
});
