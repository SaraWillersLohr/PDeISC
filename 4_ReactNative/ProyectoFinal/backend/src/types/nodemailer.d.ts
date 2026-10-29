// declaro el contrato de nodemailer usado por el servicio de correo.
declare module 'nodemailer' {
  interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
  }

  interface Transporter {
    sendMail(options: MailOptions): Promise<{ message?: Buffer }>;
  }

  interface TransportOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
  }

  interface StreamTransportOptions {
    streamTransport: true;
    buffer: true;
    newline: 'unix';
  }

  const nodemailer: {
    createTransport(options: TransportOptions | StreamTransportOptions): Transporter;
  };

  export default nodemailer;
}
