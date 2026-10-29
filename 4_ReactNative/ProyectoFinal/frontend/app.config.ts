import type { ConfigContext, ExpoConfig } from 'expo/config';

// publico únicamente los identificadores OAuth; los secretos quedan en el servidor.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'EstanciaApp',
  slug: config.slug ?? 'estanciaapp',
  extra: {
    ...config.extra,
    socialAuth: {
      googleClientIdWeb: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || process.env.GOOGLE_CLIENT_ID,
      googleClientIdAndroid: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
      googleClientIdIos: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
      facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || process.env.FACEBOOK_CLIENT_ID,
      githubClientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID,
    },
  },
});
