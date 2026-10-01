import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  oscuro: boolean;
  onCambiarTema: (oscuro: boolean) => void;
  tarjeta: string;
  tinta: string;
  tenue: string;
  cantidad: number;
};

// Muestra el título, el tema actual y el control para cambiarlo.
export function AppHeader({
  oscuro,
  onCambiarTema,
  tarjeta,
  tinta,
  tenue,
  cantidad,
}: Props) {
  return (
    <View style={[styles.cabecera, { backgroundColor: tarjeta }]}>
      <View style={styles.contenido}>
        <View style={styles.fila}>
          <View style={{ flex: 1 }}>
            <Text style={styles.etiqueta}>GUÍA INTERACTIVA</Text>
            <Text style={[styles.titulo, { color: tinta }]}>
              Componentes de{"\n"}React Native
            </Text>
          </View>
          <View style={styles.grupoTema}>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: oscuro }}
              accessibilityLabel={`Cambiar tema. Modo actual ${oscuro ? "oscuro" : "claro"}`}
              onPress={
                /* Cambia entre el tema claro y el oscuro. */ () =>
                  onCambiarTema(!oscuro)
              }
              style={[
                styles.interruptorTema,
                {
                  backgroundColor: oscuro ? "#e8e5ff" : "#f1efff",
                  borderColor: oscuro ? "#9b93ff" : "#635bdb",
                },
              ]}
            >
              <View
                style={[
                  styles.perillaTema,
                  oscuro && styles.perillaOscura,
                  { alignSelf: oscuro ? "flex-end" : "flex-start" },
                ]}
              >
                <Text style={styles.iconoTema}>{oscuro ? "🌙" : "☀️"}</Text>
              </View>
            </Pressable>
          </View>
        </View>
        <Text style={[styles.descripcion, { color: tenue }]}>
          Conocé las piezas principales para crear interfaces y probá qué hace
          cada una.
        </Text>
        <Text style={[styles.contador, { color: tenue }]}>
          {cantidad} componentes nativos · modo {oscuro ? "oscuro" : "claro"}
        </Text>
      </View>
    </View>
  );
}

// Reúne los estilos de la cabecera y el control de tema.
const styles = StyleSheet.create({
  cabecera: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  contenido: {
    width: "100%",
    maxWidth: 1240,
    alignSelf: "center",
    paddingTop: 38,
    paddingHorizontal: 18,
    paddingBottom: 22,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  etiqueta: {
    color: "#635bdb",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  titulo: { fontSize: 29, lineHeight: 34, fontWeight: "800" },
  descripcion: { fontSize: 15, lineHeight: 22, marginTop: 10 },
  contador: { fontSize: 12, marginTop: 12 },
  grupoTema: { alignItems: "center", marginLeft: 12 },
  interruptorTema: {
    width: 78,
    height: 42,
    justifyContent: "center",
    padding: 2,
    borderRadius: 24,
    borderWidth: 2,
  },
  perillaTema: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    shadowColor: "#29235e",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  perillaOscura: { backgroundColor: "#635bdb" },
  iconoTema: { fontSize: 18 },
});
