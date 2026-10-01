import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Componente } from "../components";

type Props = {
  item: Componente;
  ancho: number | `${number}%`;
  tarjeta: string;
  tinta: string;
  tenue: string;
  onSeleccionar: () => void;
};

// Muestra la información de un componente y permite abrir su ejemplo.
export function ComponentCard({
  item,
  ancho,
  tarjeta,
  tinta,
  tenue,
  onSeleccionar,
}: Props) {
  return (
    <View style={[styles.cardWrap, { width: ancho }]}>
      <View style={[styles.card, { backgroundColor: tarjeta }]}>
        <View style={styles.fila}>
          <View style={[styles.icono, { backgroundColor: item.color }]}>
            <Text style={styles.iconoTexto}>{item.icono}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.nombre, { color: tinta }]}>{item.nombre}</Text>
            <Text style={[styles.descripcion, { color: tenue }]}>
              {item.descripcion}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onSeleccionar}
          style={styles.boton}
        >
          <Text style={styles.botonTexto}>Ver ejemplo →</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Reúne los estilos de la tarjeta y sus controles.
const styles = StyleSheet.create({
  cardWrap: { marginBottom: 14 },
  card: {
    borderRadius: 17,
    padding: 15,
    minHeight: 145,
    justifyContent: "space-between",
    shadowColor: "#1d2939",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  iconoTexto: { color: "#344054", fontSize: 22, fontWeight: "800" },
  nombre: { fontSize: 17, fontWeight: "700", marginBottom: 3 },
  descripcion: { fontSize: 13, lineHeight: 18 },
  boton: {
    alignSelf: "flex-end",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#eeedff",
    marginTop: 12,
  },
  botonTexto: { color: "#5148c8", fontWeight: "700", fontSize: 12 },
});
