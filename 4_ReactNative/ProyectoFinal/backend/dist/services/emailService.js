// envío correos con Gmail API o con el servidor SMTP configurado.
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
// Nodemailer arma el mensaje MIME localmente; Gmail API lo envía por HTTPS.
async function sendWithGmail(message, from) {
    const { gmailClientId, gmailClientSecret, gmailRefreshToken } = env.email;
    if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken) {
        throw new Error('faltan GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET o GMAIL_REFRESH_TOKEN');
    }
    const client = new OAuth2Client(gmailClientId, gmailClientSecret);
    client.setCredentials({ refresh_token: gmailRefreshToken });
    const { token } = await client.getAccessToken();
    if (!token)
        throw new Error('Gmail no entregó un token de acceso');
    const composer = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
    const { message: mime } = await composer.sendMail({ from, ...message });
    if (!mime)
        throw new Error('no se pudo preparar el mensaje para Gmail');
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: mime.toString('base64url') }),
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(`Gmail API rechazó el envío (${response.status}): ${result?.error?.message ?? 'sin detalle'}`);
    }
}
async function sendEmail(message) {
    const { provider, smtpHost, smtpPort, smtpUser, smtpPassword, mailFrom } = env.email;
    if (!mailFrom)
        throw new Error('falta configurar MAIL_FROM');
    if (provider === 'gmail_api')
        return sendWithGmail(message, mailFrom);
    if (provider !== 'smtp')
        throw new Error('EMAIL_PROVIDER debe ser gmail_api o smtp');
    if (!smtpHost || !smtpUser || !smtpPassword)
        throw new Error('faltan SMTP_HOST, SMTP_USER o SMTP_PASS');
    await nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPassword },
    }).sendMail({ from: mailFrom, ...message });
}
// envío un código temporal para verificar el correo de una solicitud de acceso.
export async function sendVerificationCode(email, name, code) {
    await sendEmail({
        to: email,
        subject: 'Verificá tu correo para EstanciaApp',
        text: `Hola ${name}. Tu código para verificar el correo es ${code}. Vence en 10 minutos. Si no pediste acceso, ignorá este mensaje.`,
    });
}
// envío el código de acceso de un solo uso después de que el administrador aprueba la solicitud.
export async function sendAccessCode(email, name, code) {
    await sendEmail({
        to: email,
        subject: 'Tu acceso a EstanciaApp fue aprobado',
        text: `Hola ${name}. El administrador aprobó tu acceso. Ingresá con tu correo y este código de un solo uso: ${code}. Vence en 10 minutos.`,
    });
}
// envío un código temporal para recuperar la contraseña de una cuenta activa.
export async function sendPasswordRecoveryCode(email, name, code) {
    await sendEmail({
        to: email,
        subject: 'Recuperá tu contraseña de EstanciaApp',
        text: `Hola ${name}. Tu código para recuperar la contraseña es ${code}. Vence en 10 minutos. Si no lo pediste, ignorá este mensaje.`,
    });
}
// envío una notificación al administrador cuando una solicitud confirma su correo.
export async function sendNewRequestNotice(email, name, applicantEmail) {
    await sendEmail({
        to: email,
        subject: 'Nueva solicitud de acceso a EstanciaApp',
        text: `${name} (${applicantEmail}) verificó su correo y espera aprobación. Ingresá a la sección Equipo para revisar la solicitud.`,
    });
}
// informo por correo que una solicitud de acceso fue rechazada.
export async function sendRegistrationRejection(email, name) {
    await sendEmail({
        to: email,
        subject: 'Actualización de tu solicitud a EstanciaApp',
        text: `Hola ${name}. El administrador revisó tu solicitud de acceso y no fue aprobada. Si creés que hubo un error, comunicate con el equipo de la estancia.`,
    });
}
