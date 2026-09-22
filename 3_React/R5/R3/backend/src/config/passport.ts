// Configuración aislada de estrategias Passport para proveedores sociales.
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as TwitchStrategy } from 'passport-twitch-new';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import type { SocialProvider } from '../types';
import { authorizeSocialIdentity } from '../services/socialAuthService';

const apiUrl = process.env.SOCIAL_AUTH_API_URL ?? 'http://localhost:3001';

/** Extrae el primer correo recibido por Passport sin asumir que todos los proveedores lo envían. */
function extractEmail(profile: { emails?: Array<{ value?: string }> }): string | null {
  return profile.emails?.find((email) => email.value)?.value?.toLowerCase().trim() ?? null;
}

/** Construye el callback de Passport que aplica la autorización propia de EstanciaApp. */
function verifySocialProfile(provider: SocialProvider) {
  return async (
    _accessToken: string,
    _refreshToken: string | undefined,
    profile: { id: string; emails?: Array<{ value?: string }> },
    done: (error: Error | null, user?: unknown, info?: { message: string }) => void,
  ): Promise<void> => {
    try {
      const user = await authorizeSocialIdentity({
        provider,
        providerUserId: profile.id,
        email: extractEmail(profile),
      });
      done(null, user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'no se pudo validar la cuenta social';
      done(null, false, { message });
    }
  };
}

/** Indica si el proveedor está configurado completamente y puede exponerse al navegador. */
export function isSocialProviderEnabled(provider: SocialProvider): boolean {
  const keys: Record<SocialProvider, [string, string]> = {
    google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    facebook: ['FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET'],
    github: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
    discord: ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET'],
    twitch: ['TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET'],
    twitter: ['TWITTER_CONSUMER_KEY', 'TWITTER_CONSUMER_SECRET'],
  };
  return keys[provider].every((key) => Boolean(process.env[key]?.trim()));
}

/** Registra únicamente las estrategias que poseen sus credenciales de entorno. */
export function configurePassport(): void {
  if (isSocialProviderEnabled('google')) {
    passport.use(new GoogleStrategy({ clientID: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!, callbackURL: `${apiUrl}/api/auth/google/callback` }, verifySocialProfile('google') as any));
  }
  if (isSocialProviderEnabled('facebook')) {
    passport.use(new FacebookStrategy({ clientID: process.env.FACEBOOK_CLIENT_ID!, clientSecret: process.env.FACEBOOK_CLIENT_SECRET!, callbackURL: `${apiUrl}/api/auth/facebook/callback`, profileFields: ['id', 'displayName', 'emails'] }, verifySocialProfile('facebook') as any));
  }
  if (isSocialProviderEnabled('github')) {
    passport.use(new GitHubStrategy({ clientID: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET!, callbackURL: `${apiUrl}/api/auth/github/callback`, scope: ['user:email'] }, verifySocialProfile('github')));
  }
  if (isSocialProviderEnabled('discord')) {
    passport.use(new DiscordStrategy({ clientID: process.env.DISCORD_CLIENT_ID!, clientSecret: process.env.DISCORD_CLIENT_SECRET!, callbackURL: `${apiUrl}/api/auth/discord/callback`, scope: ['identify', 'email'] }, verifySocialProfile('discord')));
  }
  if (isSocialProviderEnabled('twitch')) {
    passport.use(new TwitchStrategy({ clientID: process.env.TWITCH_CLIENT_ID!, clientSecret: process.env.TWITCH_CLIENT_SECRET!, callbackURL: `${apiUrl}/api/auth/twitch/callback`, scope: 'user:read:email' }, verifySocialProfile('twitch')));
  }
  if (isSocialProviderEnabled('twitter')) {
    passport.use(new TwitterStrategy({ consumerKey: process.env.TWITTER_CONSUMER_KEY!, consumerSecret: process.env.TWITTER_CONSUMER_SECRET!, callbackURL: `${apiUrl}/api/auth/twitter/callback`, includeEmail: true }, verifySocialProfile('twitter')));
  }
}
