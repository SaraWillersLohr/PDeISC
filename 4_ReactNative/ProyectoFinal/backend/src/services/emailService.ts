// envío códigos de verificación y acceso mediante el servidor smtp configurado.
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// creo el transportador al momento de enviar para que la app pueda iniciar aunque smtp aún no esté configurado.
function createMailer() {
  const { smtpHost, smtpPort, smtpUser, smtpPassword, mailFrom } = env.email;
  if (!smtpHost || !smtpUser || !smtpPassword || !mailFrom) {
    throw new Error('el registro requiere configurar smtp_host, smtp_user, smtp_pass y mail_from');
  }
  return {
    from: mailFrom,
    transporter: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPassword },
    }),
  };
}

// envío un código temporal para verificar el correo de una solicitud de acceso.
export async function sendVerificationCode(email: string, name: string, code: string): Promise<void> {
  const mailer = createMailer();
  await mailer.transporter.sendMail({
    from: mailer.from,
    to: email,
    subject: 'Verificá tu correo para EstanciaApp',
    text: `Hola ${name}. Tu código para verificar el correo es ${code}. Vence en 10 minutos. Si no pediste acceso, ignorá este mensaje.`,
  });
}

// envío el código de acceso de un solo uso después de que el administrador aprueba la solicitud.
export async function sendAccessCode(email: string, name: string, code: string): Promise<void> {
  const mailer = createMailer();
  await mailer.transporter.sendMail({
    from: mailer.from,
    to: email,
    subject: 'Tu acceso a EstanciaApp fue aprobado',
    text: `Hola ${name}. El administrador aprobó tu acceso. Ingresá con tu correo y este código de un solo uso: ${code}. Vence en 10 minutos.`,
  });
}

// envío un código temporal para recuperar la contraseña de una cuenta activa.
export async function sendPasswordRecoveryCode(email: string, name: string, code: string): Promise<void> {
  const mailer = createMailer();
  await mailer.transporter.sendMail({
    from: mailer.from,
    to: email,
    subject: 'Recuperá tu contraseña de EstanciaApp',
    text: `Hola ${name}. Tu código para recuperar la contraseña es ${code}. Vence en 10 minutos. Si no lo pediste, ignorá este mensaje.`,
  });
}
// envío una notificación al administrador cuando una solicitud confirma su correo.
export async function sendNewRequestNotice(email: string, name: string, applicantEmail: string): Promise<void> {
  const mailer = createMailer();
  await mailer.transporter.sendMail({
    from: mailer.from,
    to: email,
    subject: 'Nueva solicitud de acceso a EstanciaApp',
    text: `${name} (${applicantEmail}) verificó su correo y espera aprobación. Ingresá a la sección Equipo para revisar la solicitud.`,
  });
}

// informo por correo que una solicitud de acceso fue rechazada.
export async function sendRegistrationRejection(email: string, name: string): Promise<void> {
  const mailer = createMailer();
  await mailer.transporter.sendMail({
    from: mailer.from,
    to: email,
    subject: 'Actualización de tu solicitud a EstanciaApp',
    text: `Hola ${name}. El administrador revisó tu solicitud de acceso y no fue aprobada. Si creés que hubo un error, comunicate con el equipo de la estancia.`,
  });
}
