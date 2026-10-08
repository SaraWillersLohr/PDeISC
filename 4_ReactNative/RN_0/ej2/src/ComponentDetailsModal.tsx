import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Componente } from "../components";

type Props = {
  seleccion: Componente | null;
  onCerrar: () => void;
  oscuro: boolean;
  tarjeta: string;
  tinta: string;
  tenue: string;
  demo: React.ReactNode;
};

// Muestra los datos, la demostración y el código del componente elegido.
export function ComponentDetailsModal({
  seleccion,
  onCerrar,
  oscuro,
  tarjeta,
  tinta,
  tenue,
  demo,
}: Props) {
  // adapto el margen y el alto del detalle al espacio disponible.
  const { width, height } = useWindowDimensions();

  return (
    <Modal
      visible={seleccion !== null}
      transparent
      animationType="slide"
      onRequestClose={onCerrar}
    >
      <View style={[styles.fondoModal, { padding: width < 600 ? 12 : 32 }]}>
        <ScrollView
          style={[
            styles.detalle,
            {
              backgroundColor: tarjeta,
              maxHeight: height < 700 ? "94%" : "88%",
            },
          ]}
          contentContainerStyle={[
            styles.contenido,
            { padding: width < 600 ? 20 : 32 },
          ]}
        >
          <View style={styles.cabeceraFila}>
            <Text style={[styles.titulo, { color: tinta }]}>
              {seleccion?.nombre}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={onCerrar}
              style={[
                styles.botonCerrar,
                { backgroundColor: oscuro ? "#3b356c" : "#635bdb18" },
              ]}
            >
              <Text style={[styles.cerrar, { color: oscuro ? "#d2ccff" : "#635bdb" }]}>
                Cerrar ✕
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.descripcion, { color: tenue }]}>
            {seleccion?.descripcion}
          </Text>
          <Text style={[styles.subtitulo, { color: tinta }]}>Demostración</Text>
          <View
            style={[
              styles.zonaDemo,
              { backgroundColor: oscuro ? "#111827" : "#f4f2ff" },
            ]}
          >
            {demo}
          </View>
          <Text style={[styles.subtitulo, { color: tinta }]}>Código corto</Text>
          <Text selectable style={styles.codigo}>
            {seleccion?.ejemplo}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

// Reúne los estilos del modal y de su contenido.
const styles = StyleSheet.create({
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detalle: {
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
    borderRadius: 22,
    flexGrow: 0,
  },
  contenido: { padding: 22, paddingBottom: 28 },
  cabeceraFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titulo: { fontSize: 27, fontWeight: "800", flexShrink: 1 },
  botonCerrar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#635bdb18",
  },
  cerrar: { color: "#635bdb", fontWeight: "700", fontSize: 13 },
  descripcion: { fontSize: 15, lineHeight: 22, marginTop: 10 },
  subtitulo: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
  },
  zonaDemo: {
    padding: 22,
    borderRadius: 16,
    minHeight: 120,
    justifyContent: "center",
  },
  codigo: {
    color: "#e6edf3",
    backgroundColor: "#202938",
    padding: 18,
    borderRadius: 12,
    overflow: "hidden",
    fontFamily: "monospace",
    fontSize: 13,
  },
});
