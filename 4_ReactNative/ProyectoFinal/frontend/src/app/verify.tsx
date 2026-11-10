// Mantengo compatible el enlace de verificación; el formulario se comparte con el login.
import { router, useLocalSearchParams } from 'expo-router';
import { EmailVerificationModal } from '../components/EmailVerificationModal';
export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  return <EmailVerificationModal email={typeof email === 'string' ? email : ''} onClose={() => router.dismissTo('/')} />;
}
