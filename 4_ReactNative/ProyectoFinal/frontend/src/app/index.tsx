// ingreso principal; el fondo verde ocupa toda la pantalla y la tarjeta mantiene el formulario legible.
import { friendlyErrorMessage } from '../services/apiErrors';
import { forest, s } from './LoginStyles';
import NetInfo from "@react-native-community/netinfo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandWordmark } from "../components/BrandWordmark";
import { BrandLoadingScreen } from "../components/BrandLoadingScreen";
import { PasswordRecoveryModal } from "../components/PasswordRecoveryModal";
import { AccountRequestModal } from "../components/AccountRequestModal";
import { AccountActivationModal } from "../components/AccountActivationModal";
import { SocialLoginButton } from "../components/SocialLoginButton";
import { useSession } from "../context/SessionContext";
import { initializeOfflineDatabase } from "../services/offlineDatabase";
import { login } from "../services/authApi";
import { removeSession, saveSession } from "../services/sessionStorage";

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
  const [recoveryVisible, setRecoveryVisible] = useState(false);
  const [accountRequestVisible, setAccountRequestVisible] = useState(false);
  const [accountActivationVisible, setAccountActivationVisible] = useState(false);

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
                    onPress={() => setRecoveryVisible(true)}
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
                    onPress={() => setAccountRequestVisible(true)}
                  >
                    <Text style={[s.link, desktop && s.desktopSecondaryText]}>
                      Solicitar acceso
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => setAccountActivationVisible(true)}
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
      <PasswordRecoveryModal
        initialEmail={email.trim()}
        onClose={() => setRecoveryVisible(false)}
        visible={recoveryVisible}
      />
      <AccountRequestModal
        onClose={() => setAccountRequestVisible(false)}
        visible={accountRequestVisible}
      />
      <AccountActivationModal
        onClose={() => setAccountActivationVisible(false)}
        visible={accountActivationVisible}
      />
    </SafeAreaView>
  );
}

