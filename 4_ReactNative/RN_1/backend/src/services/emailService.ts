// Archivo backend/src/services/emailService.ts: los correos de verificación, aprobación, acceso y rechazo. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import nodemailer from 'nodemailer';

// Envía el código sin exponerlo en respuestas ni logs.
export async function sendVerificationCode(email: string, code: string): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, REPLY_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    throw new Error('El servicio de correo no está configurado.');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 465),
    secure: SMTP_SECURE !== 'false',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: MAIL_FROM,
    replyTo: REPLY_TO || SMTP_USER,
    to: email,
    subject: 'Código para verificar tu correo — EstanciaApp',
    text: `Tu código de verificación es ${code}. Vence en 10 minutos. Si no solicitaste esta cuenta, ignorá este mensaje.`,
    html: `<div style="font-family:Arial,sans-serif;color:#243528"><h2>Verificá tu correo</h2><p>Ingresá este código en EstanciaApp:</p><p style="font-size:30px;font-weight:bold;letter-spacing:8px">${code}</p><p>Vence en 10 minutos. Si no solicitaste esta cuenta, ignorá este mensaje.</p></div>`,
  });
}
// Esta función prepara y envía el correo que comunica el rechazo de la solicitud sin revertir la decisión ya guardada. Recibe email, name como entrada.
export async function sendRegistrationRejection(email: string, name: string): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, REPLY_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) throw new Error('El servicio de correo no está configurado.');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: Number(SMTP_PORT ?? 465), secure: SMTP_SECURE !== 'false',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: MAIL_FROM, replyTo: REPLY_TO || SMTP_USER, to: email,
    subject: 'Actualización de tu solicitud — EstanciaApp',
    text: `Hola ${name}, el administrador denegó tu solicitud de acceso. Si necesitás más información, contactá al establecimiento.`,
  });
}

// Envía el token temporal emitido tras la aprobación del administrador.
export async function sendAccessToken(email: string, name: string, token: string, setupPassword = false): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, REPLY_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) throw new Error('El servicio de correo no está configurado.');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: Number(SMTP_PORT ?? 465), secure: SMTP_SECURE !== 'false',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: MAIL_FROM, replyTo: REPLY_TO || SMTP_USER, to: email,
    subject: 'Tu acceso a EstanciaApp fue aprobado',
    text: `Hola ${name}, tu solicitud fue aprobada con el rol inicial de peón. Ingresá a EstanciaApp, elegí “Ingresar con código” y escribí este código de seis dígitos: ${token}. Vence en 10 minutos y solo se puede usar una vez. ${setupPassword ? 'Al canjearlo, la app te va a pedir crear una contraseña; después podrás ingresar con esa contraseña o con la cuenta social que usaste para registrarte.' : 'Después de canjearlo, podés iniciar sesión con tu correo y la contraseña que elegiste al registrarte.'} Si no solicitaste este acceso, ignorá este mensaje.`,
  });
}

// Esta función envía el código temporal de recuperación sin incluirlo en la respuesta de la API ni en logs del servidor.
export async function sendPasswordRecoveryCode(email: string, name: string, code: string): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, REPLY_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) throw new Error('El servicio de correo no está configurado.');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: Number(SMTP_PORT ?? 465), secure: SMTP_SECURE !== 'false',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: MAIL_FROM, replyTo: REPLY_TO || SMTP_USER, to: email,
    subject: 'Código para recuperar tu acceso — EstanciaApp',
    text: `Hola ${name}, ingresá este código de seis dígitos para cambiar tu contraseña: ${code}. Vence en 10 minutos, permite hasta cinco intentos y solo se puede usar una vez. Si no solicitaste este cambio, ignorá este correo; tu contraseña actual seguirá vigente.`,
    html: `<div style="font-family:Arial,sans-serif;color:#243528"><h2>Recuperá tu acceso</h2><p>Ingresá este código en EstanciaApp para cambiar tu contraseña:</p><p style="font-size:30px;font-weight:bold;letter-spacing:8px">${code}</p><p>Vence en 10 minutos y solo se puede usar una vez. Si no solicitaste este cambio, ignorá este correo.</p></div>`,
  });
}
// Esta función prepara y envía por correo el mensaje asociado con solicitud de registro; ante fallos, permite que la capa superior informe el resultado. Recibe adminEmail, applicantName, applicantEmail como entrada.
export async function sendAdministratorRegistrationNotice(adminEmail: string, applicantName: string, applicantEmail: string): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, REPLY_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) throw new Error('El servicio de correo no está configurado.');
  const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT ?? 465), secure: SMTP_SECURE !== 'false', auth: { user: SMTP_USER, pass: SMTP_PASS } });
  await transporter.sendMail({
    from: MAIL_FROM, replyTo: REPLY_TO || SMTP_USER, to: adminEmail,
    subject: 'Nueva solicitud de acceso — EstanciaApp',
    text: `${applicantName} (${applicantEmail}) verificó su correo y espera aprobación. Abrí EstanciaApp, sección Solicitudes, para aceptar o denegar el acceso.`,
  });
}
