// Botones de inicio social que redirigen la ventana completa al backend OAuth.
import { type FormEvent } from 'react';
import { Github, Twitch } from 'lucide-react';
import styles from './SocialLoginButtons.module.css';

interface SocialLoginButtonsProps { rememberMe: boolean; }
interface ProviderButton { id: string; label: string; className: string; }

const providers: ProviderButton[] = [
  { id: 'google', label: 'Google', className: styles.google }, { id: 'facebook', label: 'Facebook', className: styles.facebook },
  { id: 'github', label: 'GitHub', className: styles.github }, { id: 'discord', label: 'Discord', className: styles.discord },
  { id: 'twitch', label: 'Twitch', className: styles.twitch }, { id: 'twitter', label: 'X', className: styles.twitter },
];

/** Logotipos reconocibles de cada proveedor, dibujados en SVG para evitar dependencias externas. */
function ProviderIcon({ provider }: { provider: ProviderButton }): JSX.Element {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': true as const, focusable: false as const };
  if (provider.id === 'google') return <svg {...common} viewBox="0 0 48 48"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20.4 20.4 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.7a12.2 12.2 0 0 1 0-7.4V15H5.8a20.4 20.4 0 0 0 0 18Z"/><path fill="#EA4335" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8A19.3 19.3 0 0 0 24 4 20.4 20.4 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"/></svg>;
  if (provider.id === 'facebook') return <svg {...common} viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.875 11.85v-8.38H7.078V12h3.047V9.356c0-3.007 1.792-4.67 4.533-4.67 1.312 0 2.686.234 2.686.234v2.953h-1.513c-1.49 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.38A12 12 0 0 0 24 12Z"/><path fill="#fff" d="M16.67 15.47 17.2 12h-3.33V9.75c0-.95.47-1.88 1.96-1.88h1.51V4.92s-1.37-.23-2.68-.23c-2.75 0-4.54 1.66-4.54 4.67V12H7.08v3.47h3.04v8.38a12 12 0 0 0 3.75 0v-8.38h2.8Z"/></svg>;
  if (provider.id === 'github') return <Github size={18} aria-hidden="true" />;
  if (provider.id === 'discord') return <svg {...common}><path fill="#5865F2" d="M19.73 5.11A18.2 18.2 0 0 0 15.25 3.7a12.9 12.9 0 0 0-.57 1.17 16.8 16.8 0 0 0-5.36 0 12.9 12.9 0 0 0-.57-1.17 18.2 18.2 0 0 0-4.48 1.41C1.43 9.3.66 13.39 1.04 17.43a18.3 18.3 0 0 0 5.49 2.77c.44-.6.83-1.24 1.17-1.91-.64-.24-1.25-.54-1.83-.89l.44-.35c3.52 1.65 7.34 1.65 10.82 0l.44.35c-.58.35-1.19.65-1.83.89.34.67.73 1.31 1.17 1.91a18.3 18.3 0 0 0 5.49-2.77c.45-4.69-.77-8.74-3.67-12.32ZM8.9 14.7c-1.08 0-1.96-.99-1.96-2.2s.86-2.2 1.96-2.2 1.98.99 1.96 2.2c0 1.21-.86 2.2-1.96 2.2Zm6.2 0c-1.08 0-1.96-.99-1.96-2.2s.86-2.2 1.96-2.2 1.98.99 1.96 2.2c0 1.21-.86 2.2-1.96 2.2Z"/></svg>;
  if (provider.id === 'twitch') return <Twitch size={18} aria-hidden="true" />;
  return <svg {...common}><path fill="currentColor" d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.64h2.04L6.48 3.1H4.29l13.32 17.69Z"/></svg>;
}

/** Inicia OAuth en el servidor y conserva la preferencia "recordarme" dentro de la sesión temporal. */
function redirectToProvider(event: FormEvent<HTMLButtonElement>, provider: string, rememberMe: boolean): void {
  event.preventDefault();
  const apiUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api';
  window.location.assign(`${apiUrl}/auth/${provider}?remember=${rememberMe ? '1' : '0'}`);
}

/** Renderiza opciones sociales como complemento no sustituto del login por contraseña. */
export function SocialLoginButtons({ rememberMe }: SocialLoginButtonsProps) {
  return <section className={styles.section} aria-label="iniciar sesión con una cuenta social"><p>o continuá con</p><div className={styles.grid}>{providers.map((provider) => <button key={provider.id} type="button" className={`${styles.providerButton} ${provider.className}`} aria-label={`Iniciar sesión con ${provider.label}`} title={provider.label} onClick={(event) => redirectToProvider(event, provider.id, rememberMe)}><ProviderIcon provider={provider} />{provider.id !== 'twitter' && provider.label}</button>)}</div></section>;
}
