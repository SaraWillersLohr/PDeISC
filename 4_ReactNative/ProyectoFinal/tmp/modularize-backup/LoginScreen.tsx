// ingreso principal; el fondo verde ocupa toda la pantalla y la tarjeta mantiene el formulario legible.
import { friendlyErrorMessage } from '../services/apiErrors';
import NetInfo from "@react-native-community/netinfo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandWordmark } from "../components/BrandWordmark";
import { BrandLoadingScreen } from "../components/BrandLoadingScreen";
import { SocialLoginButton } from "../components/SocialLoginButton";
import { useSession } from "../context/SessionContext";
import { initializeOfflineDatabase } from "../services/offlineDatabase";
import { login } from "../services/authApi";
import { removeSession, saveSession } from "../services/sessionStorage";

const forest = "#123824";

export default function LoginScreen() {
  const { session, setSession, restoring } = useSession();
  const { width, height } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 900;
  const compact = width < 430;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void initializeOfflineDatabase().catch(() => undefined);
    const unsubscribe = NetInfo.addEventListener((state) =>
      setOnline(Boolean(state.isConnected)),
    );
    return unsubscribe;
  }, []);

  async function submit(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Ingresá un correo electrónico válido.");
      return;
    }
    if (!password) {
      setError("Ingresá tu contraseña.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const nextSession = await login({ email: cleanEmail, password });
      if (remember) await saveSession(nextSession);
      else await removeSession();
      setSession(nextSession);
      setPassword("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? friendlyErrorMessage(cause, 'No se pudo iniciar sesión. Revisá tus datos e intentá de nuevo.')
          : "No se pudo iniciar sesión. Revisá tus datos e intentá de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function acceptSocialSession(
    nextSession: import("../types/auth").Session,
  ): Promise<void> {
    if (remember) await saveSession(nextSession);
    else await removeSession();
    setSession(nextSession);
  }

  if (restoring) return <BrandLoadingScreen />;
  if (session) return <Redirect href="/(app)/home" />;

  return (
    <SafeAreaView style={s.safe}>
      <ImageBackground
        imageStyle={s.backgroundImage}
        resizeMode="cover"
        source={
          desktop
            ? require("../../assets/login-bg-angus-wide.png")
            : require("../../assets/login-bg-angus.png")
        }
        style={s.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.flex}
        >
          <ScrollView
            contentContainerStyle={[
              s.page,
              desktop ? s.desktopPage : s.mobilePage,
              compact && s.compactPage,
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {desktop ? (
              <View style={[s.intro, height >= 760 && s.desktopIntroRaised]}>
                <BrandWordmark
                  containerStyle={s.desktopLogoWrap}
                  mode="dark"
                  style={s.desktopLogo}
                />
                <Text style={s.introEyebrow}>GESTIÓN DE CAMPO</Text>
                <Text style={s.introTitle}>
                  Tu estancia,{"\n"}siempre cerca.
                </Text>
                <Text style={s.introCopy}>
                  La información de tu equipo y tus animales, en un solo lugar.
                </Text>
              </View>
            ) : null}

            <View style={[s.card, desktop ? s.desktopCard : s.mobileCard]}>
              {!desktop ? (
                <View style={s.mobileBrand}>
                  <BrandWordmark mode="light" />
                </View>
              ) : null}
              <View style={s.form}>
                <Text style={[s.title, desktop && s.desktopCompactTitle]}>
                  Ingresá a tu cuenta
                </Text>
                <Text style={[s.subtitle, desktop && s.desktopCompactSubtitle]}>
                  Usá el correo asociado a tu estancia.
                </Text>

                {!online ? (
                  <Text style={s.offline}>
                    Sin conexión. Para iniciar sesión necesitás conectarte a
                    internet.
                  </Text>
                ) : null}
                <Text style={[s.label, desktop && s.desktopCompactLabel]}>
                  CORREO ELECTRÓNICO
                </Text>
                <TextInput
                  accessibilityLabel="Correo electrónico"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={(value) => {
                    setEmail(value);
                    setError("");
                  }}
                  onSubmitEditing={() => void submit()}
                  placeholder="nombre@estancia.com"
                  placeholderTextColor="#9aa49b"
                  returnKeyType="next"
                  style={[
                    s.input,
                    desktop && s.desktopCompactInput,
                    desktop && s.desktopInputText,
                  ]}
                  textContentType="emailAddress"
                  value={email}
                />

                <Text style={[s.label, desktop && s.desktopCompactLabel]}>
                  CONTRASEÑA
                </Text>
                <View
                  style={[s.passwordWrap, desktop && s.desktopCompactInput]}
                >
                  <TextInput
                    accessibilityLabel="Contraseña"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    onChangeText={(value) => {
                      setPassword(value);
                      setError("");
                    }}
                    onSubmitEditing={() => void submit()}
                    placeholder="Tu contraseña"
                    placeholderTextColor="#9aa49b"
                    returnKeyType="go"
                    secureTextEntry={!showPassword}
                    style={[s.passwordInput, desktop && s.desktopInputText]}
                    textContentType="password"
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    accessibilityRole="button"
                    onPress={() => setShowPassword(!showPassword)}
                    style={s.eye}
                  >
                    <MaterialCommunityIcons
                      color="#758278"
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                    />
                  </Pressable>
                </View>

                <View
                  style={[
                    s.options,
                    compact && s.optionsCompact,
                    desktop && s.desktopCompactOptions,
                  ]}
                >
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: remember }}
                    onPress={() => setRemember(!remember)}
                    style={s.rememberRow}
                  >
                    <View style={[s.checkbox, remember && s.checkboxChecked]}>
                      {remember ? (
                        <MaterialCommunityIcons
                          color="#fff"
                          name="check"
                          size={13}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        s.rememberText,
                        desktop && s.desktopSecondaryText,
                      ]}
                    >
                      Mantener sesión iniciada
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="link"
                    onPress={() =>
                      router.push({
                        pathname: "/recover",
                        params: { email: email.trim() },
                      })
                    }
                    style={s.forgotLink}
                  >
                    <Text style={[s.forgot, desktop && s.desktopSecondaryText]}>
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </Pressable>
                </View>

                {error ? (
                  <Text accessibilityRole="alert" style={s.error}>
                    {error}
                  </Text>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => void submit()}
                  style={[
                    s.primary,
                    desktop && s.desktopCompactPrimary,
                    busy && s.disabled,
                  ]}
                >
                  {busy ? (
                    <ActivityIndicator color={forest} />
                  ) : (
                    <Text
                      style={[s.primaryText, desktop && s.desktopInputText]}
                    >
                      Ingresar <Text style={s.arrow}>→</Text>
                    </Text>
                  )}
                </Pressable>

                <View
                  style={[s.socialDivider, desktop && s.desktopCompactSocial]}
                >
                  <View style={s.dividerLine} />
                  <Text style={s.dividerText}>O CONTINUÁ CON</Text>
                  <View style={s.dividerLine} />
                </View>
                <View
                  style={[
                    s.socialButtons,
                    desktop && s.desktopCompactSocialButtons,
                  ]}
                >
                  <SocialLoginButton
                    compact={desktop}
                    provider="google"
                    disabled={busy || !online}
                    onError={setError}
                    onSuccess={acceptSocialSession}
                  />
                  <SocialLoginButton
                    compact={desktop}
                    provider="facebook"
                    disabled={busy || !online}
                    onError={setError}
                    onSuccess={acceptSocialSession}
                  />
                  <SocialLoginButton
                    compact={desktop}
                    provider="github"
                    disabled={busy || !online}
                    onError={setError}
                    onSuccess={acceptSocialSession}
                  />
                </View>

                <View style={[s.links, desktop && s.desktopCompactLinks]}>
                  <Text style={[s.joinText, desktop && s.desktopSecondaryText]}>
                    ¿Todavía no tenés cuenta?
                  </Text>
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => router.push("/register")}
                  >
                    <Text style={[s.link, desktop && s.desktopSecondaryText]}>
                      Solicitar acceso
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => router.push("/access")}
                  style={[s.accessLink, desktop && s.desktopCompactAccess]}
                >
                  <Text style={s.accessText}>
                    ¿Ya aprobaron tu solicitud? Activá tu acceso
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { backgroundColor: forest, flex: 1 },
  flex: { flex: 1 },
  background: { flex: 1 },
  backgroundImage: { opacity: 0.92 },
  page: {
    backgroundColor: "rgba(18, 56, 36, 0.38)",
    flexGrow: 1,
    minHeight: "100%",
  },
  desktopPage: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: "6%",
    paddingVertical: 20,
  },
  mobilePage: {
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    paddingVertical: 26,
  },
  compactPage: { paddingHorizontal: 10, paddingVertical: 14 },
  intro: { flex: 1, maxWidth: 430, paddingHorizontal: 16, paddingRight: 40 },
  desktopIntroRaised: { transform: [{ translateY: -120 }] },
  desktopLogoWrap: { alignItems: "flex-start" },
  desktopLogo: { height: 100, marginBottom: 26, width: 100 },
  introEyebrow: {
    color: "#dcebc6",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  introTitle: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 45,
  },
  introCopy: {
    color: "#d3dfd4",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 340,
  },
  card: { backgroundColor: "#fff", overflow: "hidden" },
  desktopCard: {
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 24,
    maxWidth: 620,
    paddingHorizontal: 44,
    paddingVertical: 32,
    width: "54%",
  },
  mobileCard: {
    borderRadius: 28,
    maxWidth: 520,
    paddingHorizontal: 28,
    paddingBottom: 28,
    paddingTop: 28,
    width: "100%",
  },
  mobileBrand: { alignItems: "center", marginBottom: 28 },
  form: { alignSelf: "center", maxWidth: 480, width: "100%" },
  title: {
    color: "#1e2b22",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: { color: "#788279", fontSize: 12, marginTop: 6 },
  label: {
    color: "#58665c",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 26,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#dce3db",
    borderRadius: 15,
    borderWidth: 1,
    color: "#223027",
    fontSize: 14,
    height: 56,
    paddingHorizontal: 17,
    width: "100%",
  },
  passwordWrap: {
    alignItems: "center",
    borderColor: "#dce3db",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    height: 56,
    paddingRight: 14,
  },
  passwordInput: {
    color: "#223027",
    flex: 1,
    fontSize: 14,
    height: "100%",
    paddingHorizontal: 17,
  },
  eye: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    width: 36,
  },
  options: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 17,
  },
  optionsCompact: { alignItems: "flex-start", flexDirection: "column", gap: 2 },
  rememberRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    minHeight: 40,
  },
  checkbox: {
    alignItems: "center",
    borderColor: "#9baa9d",
    borderRadius: 5,
    borderWidth: 1,
    height: 19,
    justifyContent: "center",
    width: 19,
  },
  checkboxChecked: { backgroundColor: "#214d35", borderColor: "#214d35" },
  rememberText: { color: "#59665d", fontSize: 12 },
  forgotLink: { justifyContent: "center", minHeight: 40 },
  forgot: { color: "#214d35", fontSize: 12, fontWeight: "700" },
  offline: {
    backgroundColor: "#fff3d9",
    borderRadius: 10,
    color: "#765918",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 18,
    padding: 11,
  },
  error: {
    backgroundColor: "#fff0ed",
    borderRadius: 10,
    color: "#9b3d36",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
    padding: 11,
  },
  primary: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#dcefc2",
    borderRadius: 999,
    height: 56,
    justifyContent: "center",
    marginTop: 24,
    width: "100%",
  },
  disabled: { opacity: 0.7 },
  primaryText: { color: "#214d35", fontSize: 14, fontWeight: "800" },
  arrow: { fontSize: 16 },
  socialDivider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
    marginTop: 22,
  },
  dividerLine: { backgroundColor: "#e7ebe6", flex: 1, height: 1 },
  dividerText: {
    color: "#89938b",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  socialButtons: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    marginTop: 16,
  },
  links: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    justifyContent: "center",
    marginTop: 27,
  },
  joinText: { color: "#778179", fontSize: 12 },
  link: { color: "#214d35", fontSize: 12, fontWeight: "800" },
  accessLink: {
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  accessText: { color: "#627068", fontSize: 11, textAlign: "center" },
  footer: {
    color: "#839087",
    fontSize: 11,
    marginTop: 43,
    textAlign: "center",
  },
  desktopCompactTitle: { fontSize: 22, lineHeight: 28 },
  desktopCompactSubtitle: { fontSize: 12, marginTop: 5 },
  desktopInputText: { fontSize: 13 },
  desktopSecondaryText: { fontSize: 11 },
  desktopCompactLabel: { marginBottom: 6, marginTop: 12 },
  desktopCompactInput: { borderRadius: 12, height: 44 },
  desktopCompactOptions: {
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 0,
    marginTop: 6,
  },
  desktopCompactPrimary: { height: 44, marginTop: 12 },
  desktopCompactSocial: { marginTop: 12 },
  desktopCompactSocialButtons: { gap: 12, marginTop: 8 },
  desktopCompactLinks: { marginTop: 14 },
  desktopCompactAccess: { paddingVertical: 8 },
  desktopCompactFooter: { fontSize: 10, marginTop: 12 },
});
