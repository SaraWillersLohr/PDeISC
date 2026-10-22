// cargo y valido las variables necesarias para ejecutar el backend.
import 'dotenv/config';

// obtengo una variable obligatoria y detengo el inicio si falta.
function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`falta la variable de entorno ${name}`);
  }

  return value;
}

// centralizo la configuración externa para evitar valores hardcodeados.
export const env = {
  port: Number(requiredEnvironment('PORT')),
  frontendOrigin: requiredEnvironment('FRONTEND_ORIGIN'),
  database: {
    host: requiredEnvironment('DB_HOST'),
    port: Number(requiredEnvironment('DB_PORT')),
    user: requiredEnvironment('DB_USER'),
    password: requiredEnvironment('DB_PASSWORD'),
    name: requiredEnvironment('DB_NAME'),
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    accessSecret: requiredEnvironment('JWT_ACCESS_SECRET'),
    accessExpiresIn: requiredEnvironment('JWT_ACCESS_EXPIRES_IN'),
    refreshSecret: requiredEnvironment('JWT_REFRESH_SECRET'),
    refreshExpiresIn: requiredEnvironment('JWT_REFRESH_EXPIRES_IN'),
  },
  email: {
    smtpHost: process.env.SMTP_HOST?.trim(),
    smtpPort: Number(process.env.SMTP_PORT ?? 465),
    smtpUser: process.env.SMTP_USER?.trim(),
    smtpPassword: process.env.SMTP_PASS,
    mailFrom: process.env.MAIL_FROM?.trim(),
    verificationCodeSecret: process.env.VERIFICATION_CODE_SECRET,
  },
};
