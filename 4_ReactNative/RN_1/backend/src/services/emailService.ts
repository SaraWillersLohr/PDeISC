import nodemailer from 'nodemailer';

/** Envía el código sin exponerlo en respuestas ni logs. */
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

export async function sendRegistrationDecision(email: string, name: string, approved: boolean): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, REPLY_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) throw new Error('El servicio de correo no está configurado.');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: Number(SMTP_PORT ?? 465), secure: SMTP_SECURE !== 'false',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const subject = approved ? 'Tu solicitud fue aceptada — EstanciaApp' : 'Actualización de tu solicitud — EstanciaApp';
  const text = approved
    ? `Hola ${name}, tu solicitud fue aceptada. Tu cuenta ya está activa con el rol inicial de peón. Ingresá con el correo y la contraseña que elegiste al registrarte.`
    : `Hola ${name}, el administrador resolvió tu solicitud de acceso. Si necesitás más información, contactá al establecimiento.`;
  await transporter.sendMail({ from: MAIL_FROM, replyTo: REPLY_TO || SMTP_USER, to: email, subject, text });
}

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
