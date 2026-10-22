// Archivo src/screens/EmailVerificationScreen.tsx: la captura y reenvío del código de verificación del correo. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { AuthPage } from "../components/AuthPage";

// Contrato de datos Props: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface Props {
  email: string;
  busy: boolean;
  error: string | null;
  notice: string | null;
  onBack: () => void;
  onVerify: (code: string) => void;
  onResend: () => void;
}
// Esta función renderiza el bloque de interfaz EmailVerificationScreen dentro de la pantalla y conecta sus props con las acciones disponibles. Recibe email, busy, error, notice, onBack, onVerify, onResend como entrada.
export function EmailVerificationScreen({
  email,
  busy,
  error,
  notice,
  onBack,
  onVerify,
  onResend,
}: Props) {
  const { width } = useWindowDimensions();
  const gutter = Math.max(18, Math.min(36, width * 0.07));
  const [code, setCode] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  // Esta función comprueba que el código tenga seis dígitos antes de pasarlo a la acción de verificación recibida por props.
  const verify = () => {
    if (!/^\d{6}$/.test(code)) {
      setValidation("Ingresá el código de 6 dígitos.");
      return;
    }
    setValidation(null);
    onVerify(code);
  };
  return (
    <AuthPage>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.page, { paddingHorizontal: gutter }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.eyebrow}>ESTANCIA APP</Text>
          <Text style={styles.title}>Verificá tu correo</Text>
          <Text style={styles.subtitle}>
            Enviamos un código de verificación a {email}. Vence en 10 minutos y
            solo confirma tu correo; no permite ingresar. Cuando el
            administrador apruebe tu solicitud, te llegará otro token para
            habilitar el acceso.
          </Text>
          <TextInput
            accessibilityLabel="Código de verificación"
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={setCode}
            value={code}
            placeholder="000000"
            style={styles.input}
          />
          {validation || error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {validation ?? error}
            </Text>
          ) : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <PrimaryButton
            label="Verificar correo"
            onPress={verify}
            loading={busy}
          />
          <Pressable disabled={busy} onPress={onResend} style={styles.button}>
            <Text style={styles.link}>Reenviar código</Text>
          </Pressable>
          <Pressable onPress={onBack} style={styles.button}>
            <Text style={styles.link}>Volver al ingreso</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthPage>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "transparent" },
  page: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 28,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    gap: 14,
  },
  eyebrow: { color: "#52765a", fontWeight: "800", letterSpacing: 2 },
  title: { color: "#1a3020", fontSize: 32, fontWeight: "800" },
  subtitle: { color: "#6b756b", fontSize: 15, lineHeight: 22 },
  input: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#e1e7e1",
    borderRadius: 13,
    backgroundColor: "#f9faf8",
    paddingHorizontal: 15,
    color: "#1a3020",
    fontSize: 26,
    letterSpacing: 8,
    textAlign: "center",
  },
  error: {
    color: "#a33232",
    backgroundColor: "#fff0ed",
    padding: 10,
    borderRadius: 10,
  },
  notice: {
    color: "#315a3c",
    backgroundColor: "#eef5ed",
    padding: 10,
    borderRadius: 10,
  },
  button: { alignItems: "center", padding: 7 },
  link: { color: "#2d5a27", fontWeight: "700" },
});
