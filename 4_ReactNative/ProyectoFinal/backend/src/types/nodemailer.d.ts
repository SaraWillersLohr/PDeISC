// declaro el contrato de nodemailer usado por el servicio de correo.
declare module 'nodemailer' {
  interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
  }

  interface Transporter {
    sendMail(options: MailOptions): Promise<unknown>;
  }

  interface TransportOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
  }

  const nodemailer: {
    createTransport(options: TransportOptions): Transporter;
  };

  export default nodemailer;
}
