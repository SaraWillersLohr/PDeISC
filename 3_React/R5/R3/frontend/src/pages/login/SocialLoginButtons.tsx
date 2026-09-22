// Botones de inicio social que redirigen la ventana completa al backend OAuth.
import { type FormEvent } from 'react';
import { Disc3, Github, Twitch } from 'lucide-react';
import styles from './SocialLoginButtons.module.css';

interface SocialLoginButtonsProps { rememberMe: boolean; }
interface ProviderButton { id: string; label: string; className: string; icon?: 'github' | 'discord' | 'twitch'; }

const providers: ProviderButton[] = [
  { id: 'google', label: 'Google', className: styles.google }, { id: 'facebook', label: 'Facebook', className: styles.facebook },
  { id: 'github', label: 'GitHub', className: styles.github, icon: 'github' }, { id: 'discord', label: 'Discord', className: styles.discord, icon: 'discord' },
  { id: 'twitch', label: 'Twitch', className: styles.twitch, icon: 'twitch' }, { id: 'twitter', label: 'X', className: styles.twitter },
];

/** Devuelve el icono disponible para los proveedores cuyo logotipo está en la librería visual. */
function ProviderIcon({ provider }: { provider: ProviderButton }): JSX.Element | null {
  if (provider.icon === 'github') return <Github size={17} aria-hidden="true" />;
  if (provider.icon === 'discord') return <Disc3 size={17} aria-hidden="true" />;
  if (provider.icon === 'twitch') return <Twitch size={17} aria-hidden="true" />;
  return null;
}

/** Inicia OAuth en el servidor y conserva la preferencia "recordarme" dentro de la sesión temporal. */
function redirectToProvider(event: FormEvent<HTMLButtonElement>, provider: string, rememberMe: boolean): void {
  event.preventDefault();
  const apiUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api';
  window.location.assign(`${apiUrl}/auth/${provider}?remember=${rememberMe ? '1' : '0'}`);
}

/** Renderiza opciones sociales como complemento no sustituto del login por contraseña. */
export function SocialLoginButtons({ rememberMe }: SocialLoginButtonsProps) {
  return <section className={styles.section} aria-label="iniciar sesión con una cuenta social"><p>o continuá con</p><div className={styles.grid}>{providers.map((provider) => <button key={provider.id} type="button" className={`${styles.providerButton} ${provider.className}`} onClick={(event) => redirectToProvider(event, provider.id, rememberMe)}><ProviderIcon provider={provider} />{provider.label}</button>)}</div></section>;
}
