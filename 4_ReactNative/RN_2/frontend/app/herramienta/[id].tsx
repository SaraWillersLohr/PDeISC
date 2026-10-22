import { Accelerometer, Gyroscope, Magnetometer, Pedometer } from "expo-sensors";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as LocalAuthentication from "expo-local-authentication";
import * as Location from "expo-location";
import { Stack, useLocalSearchParams, useIsFocused } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ThemeToggle } from "../../src/components/ThemeToggle";
import { functions, type FunctionId } from "../../src/data/functions";
import type { AppColors } from "../../src/theme/colors";
import { useAppTheme } from "../../src/theme/useAppTheme";

// Define una forma común para mostrar las tres coordenadas de cada sensor.
type Axes = { x: number; y: number; z: number };

// Convierte los errores técnicos en mensajes breves dentro de la pantalla actual.
function errorText(error: unknown) {
  return error instanceof Error ? error.message : "No se pudo completar la acción.";
}

// Muestra una demostración de hardware y mantiene su estado dentro de la ficha elegida.
export default function FunctionScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const focused = useIsFocused();
  const selected = functions.find((item) => item.id === id);
  const functionId = selected?.id as FunctionId | undefined;
  const [permission, askCameraPermission] = useCameraPermissions();
  const camera = useRef<CameraView | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [codeResult, setCodeResult] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [coordinates, setCoordinates] = useState<Location.LocationObject | null>(null);
  const [accelerometer, setAccelerometer] = useState<Axes>({ x: 0, y: 0, z: 0 });
  const [gyroscope, setGyroscope] = useState<Axes>({ x: 0, y: 0, z: 0 });
  const [magnetometer, setMagnetometer] = useState<Axes>({ x: 0, y: 0, z: 0 });
  const [headingDegrees, setHeadingDegrees] = useState<number | null>(null);
  const [steps, setSteps] = useState<number | null>(null);
  const [sensorsRunning, setSensorsRunning] = useState(false);

  // Detiene las lecturas cuando se cierra la ficha o deja de estar visible.
  useEffect(() => {
    if (!focused || (functionId !== "movimiento" && functionId !== "brujula" && functionId !== "pasos") || !sensorsRunning) return;
    let active = true;
    let accelerometerListener: ReturnType<typeof Accelerometer.addListener> | undefined;
    let gyroscopeListener: ReturnType<typeof Gyroscope.addListener> | undefined;
    let magnetometerListener: ReturnType<typeof Magnetometer.addListener> | undefined;
    let stepListener: ReturnType<typeof Pedometer.watchStepCount> | undefined;

    // Comprueba primero el hardware para explicar si el teléfono no tiene ese sensor.
    async function connectSensor() {
      try {
        if (functionId === "movimiento") {
          const [hasAccelerometer, hasGyroscope] = await Promise.all([Accelerometer.isAvailableAsync(), Gyroscope.isAvailableAsync()]);
          if (!active) return;
          if (!hasAccelerometer || !hasGyroscope) throw new Error("Este teléfono no ofrece acelerómetro y giroscopio.");
          Accelerometer.setUpdateInterval(200);
          Gyroscope.setUpdateInterval(200);
          accelerometerListener = Accelerometer.addListener(setAccelerometer);
          gyroscopeListener = Gyroscope.addListener(setGyroscope);
        }
        if (functionId === "brujula") {
          if (!(await Magnetometer.isAvailableAsync())) throw new Error("Este teléfono no tiene magnetómetro disponible.");
          if (!active) return;
          Magnetometer.setUpdateInterval(200);
          magnetometerListener = Magnetometer.addListener((reading) => {
            setMagnetometer(reading);
            // Convierte los ejes magnéticos en un rumbo de norte relativo al teléfono.
            const heading = (Math.atan2(-reading.x, reading.y) * 180 / Math.PI + 360) % 360;
            setHeadingDegrees(heading);
          });
        }
        if (functionId === "pasos") {
          if (!(await Pedometer.isAvailableAsync())) throw new Error("Este teléfono no tiene podómetro disponible.");
          if (!active) return;
          // Solicita el permiso de actividad antes de suscribirse al podómetro.
          const access = await Pedometer.requestPermissionsAsync();
          if (!active) return;
          if (!access.granted) throw new Error("No se otorgó permiso de actividad. Habilitalo en los ajustes del teléfono.");
          stepListener = Pedometer.watchStepCount((result) => setSteps(result.steps));
          setMessage("Empezá a caminar con el teléfono encima para registrar pasos.");
        }
        if (functionId !== "pasos") setMessage("");
      } catch (error) {
        if (active) setMessage(errorText(error));
      }
    }

    void connectSensor();
    return () => {
      active = false;
      accelerometerListener?.remove();
      gyroscopeListener?.remove();
      magnetometerListener?.remove();
      stepListener?.remove();
    };
  }, [focused, functionId, sensorsRunning]);

  // Solicita acceso en primer plano y muestra coordenadas solo con permiso concedido.
  async function readLocation() {
    setLoading(true);
    setMessage("");
    try {
      const access = await Location.requestForegroundPermissionsAsync();
      if (!access.granted) {
        setMessage("No se otorgó permiso de ubicación. Podés habilitarlo en Ajustes del teléfono.");
        return;
      }
      setCoordinates(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    } catch (error) {
      setMessage(errorText(error));
    } finally {
      setLoading(false);
    }
  }

  // Guarda una foto temporal y muestra una vista previa debajo de la cámara.
  async function takePhoto() {
    try {
      const photo = await camera.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) setPhotoUri(photo.uri);
    } catch (error) {
      setMessage(errorText(error));
    }
  }

  // Conserva un solo resultado por lectura y prepara la cámara para escanear de nuevo.
  function handleBarcodeScanned(result: { data: string; type: string }) {
    setCodeResult(`${result.data} · ${result.type}`);
  }

  // Comprueba el lector biométrico, los datos configurados y los métodos compatibles.
  async function checkBiometrics() {
    setLoading(true);
    setMessage("");
    try {
      const [hasHardware, isConfigured, methods] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
      ]);
      if (!hasHardware) {
        setMessage("Este dispositivo no cuenta con un lector biométrico compatible.");
        return;
      }
      if (!isConfigured) {
        setMessage("Hay hardware biométrico, pero todavía no se configuró una huella o rostro en el teléfono.");
        return;
      }
      const names = methods.map((method) => {
        if (method === LocalAuthentication.AuthenticationType.FINGERPRINT) return "huella";
        if (method === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) return "reconocimiento facial";
        return "iris";
      });
      setMessage(`Métodos configurados: ${names.join(", ")}.`);
    } catch (error) {
      setMessage(errorText(error));
    } finally {
      setLoading(false);
    }
  }

  // Abre la autenticación del sistema y comunica el resultado en esta pantalla.
  async function authenticate() {
    setLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Probá la biometría del dispositivo", cancelLabel: "Cancelar" });
      setMessage(result.success ? "Autenticación correcta." : `No se completó la autenticación (${result.error || "cancelada"}).`);
    } catch (error) {
      setMessage(errorText(error));
    } finally {
      setLoading(false);
    }
  }

  // Explica cómo volver si se abre una ruta incorrecta o inexistente.
  if (!selected) {
    return <View style={styles.center}><Text style={styles.pageTitle}>Función no encontrada</Text><Text style={styles.body}>Volvé al catálogo y elegí una herramienta disponible.</Text></View>;
  }

  // Activa la cámara solo mientras la ficha está visible para liberar el recurso al salir.
  const cameraTool = functionId === "camara" || functionId === "lector";
  const sensorTool = functionId === "movimiento" || functionId === "brujula" || functionId === "pasos";

  return (
    <>
      <Stack.Screen options={{ title: selected.title }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.page}>
        {/* Explica qué función del dispositivo se puede probar en esta ficha. */}
        <View style={styles.pageTop}>
          <Text style={styles.eyebrow}>{selected.category}</Text>
          <ThemeToggle />
        </View>
        <Text style={styles.pageTitle}>{selected.title}</Text>
        <Text style={styles.body}>{selected.summary}</Text>

        {/* El contenido cambia según la función de hardware seleccionada. */}
        <View style={styles.demo}>
          {cameraTool && (
            <>
              {!permission ? <ActivityIndicator color={colors.accent} /> : !permission.granted ? (
                <View style={styles.permissionBox}>
                  <Text style={styles.body}>Se necesita permiso para usar la cámara.</Text>
                  <ActionButton styles={styles} colors={colors} label="Permitir cámara" onPress={() => void askCameraPermission()} />
                </View>
              ) : focused ? (
                <>
                  <View style={styles.cameraFrame}>
                    <CameraView
                      ref={camera}
                      style={StyleSheet.absoluteFill}
                      facing="back"
                      enableTorch={functionId === "camara" && torchEnabled}
                      barcodeScannerSettings={{ barcodeTypes: functionId === "lector" ? ["qr", "ean13", "ean8", "code128", "upc_a", "upc_e"] : [] }}
                      onCameraReady={() => setCameraReady(true)}
                      onMountError={(event) => setMessage(`No se pudo iniciar la cámara: ${event.message}`)}
                      onBarcodeScanned={functionId === "lector" && cameraReady && !codeResult ? handleBarcodeScanned : undefined}
                    />
                    {functionId === "lector" && <View pointerEvents="none" style={styles.scanFrame} />}
                  </View>
                  {functionId === "camara" ? (
                    <View style={styles.buttonRow}>
                      <ActionButton styles={styles} colors={colors} label={torchEnabled ? "Apagar flash" : "Encender flash"} kind="secondary" onPress={() => setTorchEnabled((value) => !value)} />
                      <ActionButton styles={styles} colors={colors} label="Tomar foto" onPress={() => void takePhoto()} />
                    </View>
                  ) : (
                    <>
                      <Text style={styles.helper}>{codeResult ? "Código leído:" : cameraReady ? "Centrá el código dentro del marco y mantené el teléfono quieto." : "Preparando la cámara…"}</Text>
                      {codeResult ? <Text selectable style={styles.result}>{codeResult}</Text> : null}
                      <ActionButton styles={styles} colors={colors} label="Leer otro código" kind="secondary" onPress={() => setCodeResult("")} />
                    </>
                  )}
                </>
              ) : <ActivityIndicator color={colors.accent} />}
              {photoUri ? <Image accessibilityLabel="Foto tomada con la cámara" source={{ uri: photoUri }} style={styles.photoPreview} /> : null}
            </>
          )}

          {functionId === "ubicacion" && (
            <>
              <ActionButton styles={styles} colors={colors} label={loading ? "Buscando ubicación…" : "Obtener ubicación actual"} disabled={loading} onPress={() => void readLocation()} />
              {coordinates && (
                <View style={styles.dataCard}>
                  <DataLine styles={styles} label="Latitud" value={coordinates.coords.latitude.toFixed(6)} />
                  <DataLine styles={styles} label="Longitud" value={coordinates.coords.longitude.toFixed(6)} />
                  <DataLine styles={styles} label="Precisión" value={`±${Math.round(coordinates.coords.accuracy ?? 0)} m`} />
                </View>
              )}
            </>
          )}

          {functionId === "movimiento" && (
            <>
              <ToggleButton styles={styles} colors={colors} active={sensorsRunning} onPress={() => { setMessage(""); setSensorsRunning((value) => !value); }} />
              {sensorsRunning && <><AxesCard styles={styles} title="Acelerómetro" axes={accelerometer} unit="g" /><AxesCard styles={styles} title="Giroscopio" axes={gyroscope} unit="rad/s" /></>}
            </>
          )}

          {functionId === "brujula" && (
            <>
              <ToggleButton styles={styles} colors={colors} active={sensorsRunning} onPress={() => { setMessage(""); setSensorsRunning((value) => !value); }} />
              {sensorsRunning && <Compass styles={styles} heading={headingDegrees} axes={magnetometer} />}
            </>
          )}

          {functionId === "pasos" && (
            <>
              <ToggleButton styles={styles} colors={colors} active={sensorsRunning} onPress={() => { setMessage(""); setSteps(null); setSensorsRunning((value) => !value); }} />
              {sensorsRunning && <View style={styles.stepCard}><Text style={styles.stepNumber}>{steps ?? 0}</Text><Text style={styles.body}>pasos detectados desde que iniciaste esta prueba</Text></View>}
            </>
          )}

          {functionId === "biometria" && (
            <>
              <ActionButton styles={styles} colors={colors} label={loading ? "Comprobando…" : "Comprobar biometría"} disabled={loading} onPress={() => void checkBiometrics()} />
              {message.startsWith("Métodos configurados") && <ActionButton styles={styles} colors={colors} label={loading ? "Esperando…" : "Probar autenticación"} disabled={loading} onPress={() => void authenticate()} />}
            </>
          )}
        </View>

        {/* Muestra permisos, disponibilidad y resultados dentro de la interfaz. */}
        {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
        <Text style={styles.disclaimer}>La lectura se realiza en el dispositivo y se muestra solo durante esta demostración.</Text>
      </ScrollView>
    </>
  );
}

// Reutiliza un botón accesible con el mismo estilo en todas las demostraciones.
type ThemeStyles = ReturnType<typeof createStyles>;

function ActionButton({ styles, colors, label, onPress, kind = "primary", disabled = false }: { styles: ThemeStyles; colors: AppColors; label: string; onPress: () => void; kind?: "primary" | "secondary"; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, kind === "secondary" && styles.buttonSecondary, disabled && styles.disabled, pressed && !disabled && styles.pressed]}><Text style={[styles.buttonText, kind === "secondary" && { color: colors.accent }]}>{label}</Text></Pressable>;
}

// Ofrece un control común para iniciar y detener las lecturas de sensores.
function ToggleButton({ styles, colors, active, onPress }: { styles: ThemeStyles; colors: AppColors; active: boolean; onPress: () => void }) {
  return <ActionButton styles={styles} colors={colors} label={active ? "Detener lectura" : "Iniciar lectura"} kind={active ? "secondary" : "primary"} onPress={onPress} />;
}

// Formatea las tres lecturas en vivo del acelerómetro, giroscopio o magnetómetro.
function AxesCard({ styles, title, axes, unit }: { styles: ThemeStyles; title: string; axes: Axes; unit: string }) {
  return <View style={styles.dataCard}><Text style={styles.dataTitle}>{title}</Text><Text style={styles.axes}>{`X  ${axes.x.toFixed(2)}   Y  ${axes.y.toFixed(2)}   Z  ${axes.z.toFixed(2)} ${unit}`}</Text></View>;
}

// Alinea cada etiqueta con su valor para coordenadas y precisión.
function DataLine({ styles, label, value }: { styles: ThemeStyles; label: string; value: string }) {
  return <View style={styles.dataLine}><Text style={styles.dataLabel}>{label}</Text><Text selectable style={styles.dataValue}>{value}</Text></View>;
}

// Dibuja una brújula circular y gira la aguja hacia el norte magnético.
function Compass({ styles, heading, axes }: { styles: ThemeStyles; heading: number | null; axes: Axes }) {
  const direction = heading === null ? "--" : `${Math.round(heading)}°`;
  return (
    <View style={styles.compassCard}>
      <View accessibilityLabel={`Brújula: rumbo ${direction}`} style={styles.compassCircle}>
        <Text style={[styles.cardinal, styles.north]}>N</Text>
        <Text style={[styles.cardinal, styles.east]}>E</Text>
        <Text style={[styles.cardinal, styles.south]}>S</Text>
        <Text style={[styles.cardinal, styles.west]}>O</Text>
        <View style={[styles.needle, heading !== null && { transform: [{ rotate: `${heading}deg` }] }]}>
          <Text style={styles.needleNorth}>▲</Text>
          <View style={styles.needleSouth} />
        </View>
        <View style={styles.compassCenter} />
      </View>
      <Text style={styles.headingValue}>{direction}</Text>
      <Text style={styles.helper}>Norte magnético</Text>
          <AxesCard styles={styles} title="Magnetómetro" axes={axes} unit="µT" />
    </View>
  );
}

// Mantiene legibles los controles en móvil y aprovecha el espacio de escritorio.
function createStyles(colors: AppColors) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  page: { padding: 20, paddingBottom: 38, width: "100%", maxWidth: 960, alignSelf: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 24, backgroundColor: colors.background },
  pageTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.3 },
  pageTitle: { color: colors.ink, fontSize: 27, lineHeight: 34, fontWeight: "800", marginTop: 7 },
  body: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 8 },
  demo: { gap: 13, marginTop: 22 },
  permissionBox: { alignItems: "stretch", gap: 12 },
  cameraFrame: { width: "100%", height: 420, maxHeight: 520, borderRadius: 20, overflow: "hidden", backgroundColor: colors.camera, justifyContent: "center", alignItems: "center" },
  scanFrame: { width: "68%", aspectRatio: 1, borderColor: "white", borderWidth: 3, borderRadius: 18 },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  button: { minHeight: 50, paddingHorizontal: 17, borderRadius: 14, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", flexGrow: 1 },
  buttonSecondary: { backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1 },
  buttonText: { color: colors.background, fontSize: 14, fontWeight: "800", textAlign: "center" },
  buttonSecondaryText: { color: colors.accent },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.78 },
  helper: { color: colors.muted, textAlign: "center", lineHeight: 21 },
  result: { color: colors.ink, backgroundColor: colors.hero, padding: 15, borderRadius: 13, lineHeight: 22, overflow: "hidden" },
  photoPreview: { width: "100%", aspectRatio: 4 / 3, borderRadius: 18, backgroundColor: colors.hero },
  dataCard: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, gap: 12 },
  dataLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  dataTitle: { color: colors.ink, fontWeight: "800", fontSize: 15 },
  dataLabel: { color: colors.muted, fontSize: 14 },
  dataValue: { color: colors.ink, fontWeight: "700", fontVariant: ["tabular-nums"] },
  axes: { color: colors.ink, fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"], lineHeight: 22 },
  compassCard: { alignItems: "center", gap: 10, padding: 18, borderRadius: 18, backgroundColor: colors.hero },
  compassCircle: { width: 270, maxWidth: "100%", aspectRatio: 1, borderRadius: 999, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center" },
  cardinal: { position: "absolute", color: colors.ink, fontSize: 17, fontWeight: "900" },
  north: { top: 12, color: colors.accent },
  east: { right: 17 },
  south: { bottom: 12 },
  west: { left: 17 },
  needle: { width: 40, height: 155, alignItems: "center", justifyContent: "space-between" },
  needleNorth: { color: colors.accent, fontSize: 38, lineHeight: 42 },
  needleSouth: { width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderTopWidth: 38, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: colors.muted },
  compassCenter: { position: "absolute", width: 14, height: 14, borderRadius: 7, backgroundColor: colors.ink },
  headingValue: { color: colors.ink, fontSize: 28, fontWeight: "900", fontVariant: ["tabular-nums"] },
  stepCard: { alignItems: "center", padding: 24, borderRadius: 18, backgroundColor: colors.hero },
  stepNumber: { color: colors.accent, fontSize: 56, fontWeight: "800" },
  message: { color: colors.warning, marginTop: 14, padding: 13, borderRadius: 12, backgroundColor: colors.warningBackground, lineHeight: 21 },
  disclaimer: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 24 },
  });
}
