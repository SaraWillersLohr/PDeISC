import React, { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { componentes, Componente } from "./components";
import { ComponentCard } from "./src/ComponentCard";
import { ComponentDemo } from "./src/ComponentDemo";
import { ComponentDetailsModal } from "./src/ComponentDetailsModal";
import { AppHeader } from "./src/AppHeader";

// Organiza la pantalla principal y mantiene el estado compartido.
export default function App() {
  // guardo el componente elegido y las opciones que puede cambiar la persona.
  // Lee el ancho disponible para adaptar el tamaño de las tarjetas.
  const { width } = useWindowDimensions();
  // Guarda la referencia para permitir volver al inicio de la lista.
  const listaRef = useRef<ScrollView>(null);
  // Recuerda qué componente se está mostrando en el modal.
  const [seleccion, setSeleccion] = useState<Componente | null>(null);
  // Guarda si está activo el tema oscuro.
  const [oscuro, setOscuro] = useState(false);
  // Controla la visibilidad del botón para subir.
  const [mostrarSubir, setMostrarSubir] = useState(false);
  // Guarda el texto escrito en la demo de TextInput.
  const [texto, setTexto] = useState("");
  // Cuenta las pulsaciones en la demo de Pressable.
  const [cuenta, setCuenta] = useState(0);
  // Guarda el valor de la demo de Switch.
  const [activo, setActivo] = useState(true);
  // Guarda el mensaje de la demo de Button.
  const [mensaje, setMensaje] = useState("Todavía no tocaste el botón.");
  // Controla las demos que muestran u ocultan carga o un modal.
  const [mostrarCarga, setMostrarCarga] = useState(false);
  // Elige el color de fondo de la pantalla según el tema.
  const fondo = oscuro ? "#111827" : "#f4f7fb";
  // Elige el color de las superficies según el tema.
  const tarjeta = oscuro ? "#1f2937" : "#ffffff";
  // Elige el color principal del texto según el tema.
  const tinta = oscuro ? "#f8fafc" : "#172033";
  // Elige el color secundario del texto según el tema.
  const tenue = oscuro ? "#c0cad8" : "#667085";
  // Ajusta el ancho de cada tarjeta al tamaño de la pantalla.
  const anchoCard = width > 1050 ? "31.5%" : width > 650 ? "47.5%" : "100%";

  // vuelvo a la lista cuando la persona cierra la demostración.
  const cerrar = () => setSeleccion(null);

  return (
    <View style={[styles.pantalla, { backgroundColor: fondo }]}>
      <StatusBar barStyle={oscuro ? "light-content" : "dark-content"} />
      <AppHeader
        oscuro={oscuro}
        onCambiarTema={setOscuro}
        tarjeta={tarjeta}
        tinta={tinta}
        tenue={tenue}
        cantidad={componentes.length}
      />
      <ScrollView
        ref={listaRef}
        contentContainerStyle={[
          styles.lista,
          { width: "100%", maxWidth: 1240, alignSelf: "center" },
        ]}
        onScroll={
          /* Muestra el botón cuando la lista baja lo suficiente. */ (evento) =>
            setMostrarSubir(evento.nativeEvent.contentOffset.y > 280)
        }
        scrollEventThrottle={16}
      >
        <View style={[styles.pie, { backgroundColor: tarjeta }]}>
          <Text style={[styles.pieTitulo, { color: tinta }]}>
            ¿Qué son los componentes nativos?
          </Text>
          <Text style={{ color: tenue, lineHeight: 21 }}>
            Son elementos de interfaz que React Native conecta con las vistas
            propias de Android y iOS. Esta guía toma como referencia la
            documentación oficial.
          </Text>
        </View>
        <View style={styles.grilla}>
          {componentes.map(
            /* Crea una tarjeta por componente del catálogo. */ (item) => (
              <ComponentCard
                key={item.nombre}
                item={item}
                ancho={anchoCard}
                tarjeta={tarjeta}
                tinta={tinta}
                tenue={tenue}
                onSeleccionar={
                  /* Abre el detalle del componente elegido. */ () => {
                    setSeleccion(item);
                    setMostrarCarga(false);
                  }
                }
              />
            ),
          )}
        </View>
        <Text style={[styles.fuente, { color: tenue }]}>
          Referencia: reactnative.dev · Expo + TypeScript
        </Text>
      </ScrollView>
      {mostrarSubir && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver arriba"
          onPress={
            /* Desplaza la lista hasta el comienzo. */ () =>
              listaRef.current?.scrollTo({ y: 0, animated: true })
          }
          style={styles.botonArriba}
        >
          <Text style={styles.flechaArriba}>↑</Text>
          <Text style={styles.textoArriba}>Arriba</Text>
        </Pressable>
      )}
      <ComponentDetailsModal
        seleccion={seleccion}
        onCerrar={cerrar}
        oscuro={oscuro}
        tarjeta={tarjeta}
        tinta={tinta}
        tenue={tenue}
        demo={
          <ComponentDemo
            item={seleccion}
            oscuro={oscuro}
            tarjeta={tarjeta}
            tinta={tinta}
            tenue={tenue}
            texto={texto}
            onCambiarTexto={setTexto}
            cuenta={cuenta}
            onCambiarCuenta={setCuenta}
            activo={activo}
            onCambiarActivo={setActivo}
            mensaje={mensaje}
            onCambiarMensaje={setMensaje}
            mostrarCarga={mostrarCarga}
            onCambiarCarga={setMostrarCarga}
          />
        }
      />
    </View>
  );
}

// mantengo los estilos juntos para que sean fáciles de ubicar y modificar.
// Reúne los estilos de la pantalla principal.
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  lista: { padding: 18, paddingBottom: 40 },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  pie: { borderRadius: 16, padding: 18, marginTop: 5, marginBottom: 18 },
  pieTitulo: { fontWeight: "700", fontSize: 16, marginBottom: 7 },
  fuente: { fontSize: 12, textAlign: "center", marginTop: 16 },
  botonArriba: {
    position: "absolute",
    right: 24,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#635bdb",
    elevation: 5,
    shadowColor: "#111827",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  flechaArriba: {
    color: "#ffffff",
    fontSize: 20,
    lineHeight: 21,
    fontWeight: "800",
  },
  textoArriba: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
});
