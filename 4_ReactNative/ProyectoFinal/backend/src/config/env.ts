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

// acepto temporalmente los nombres previos para no invalidar instalaciones existentes.
function requiredEnvironmentAlias(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }

  throw new Error(`falta una de las variables de entorno: ${names.join(', ')}`);
}

// centralizo la configuración externa para evitar valores hardcodeados.
export const env = {
  nodeEnv: process.env.NODE_ENV?.trim() ?? 'development',
  port: Number(requiredEnvironment('PORT')),
  frontendOrigin: requiredEnvironmentAlias('FRONTEND_ORIGIN', 'CORS_ORIGIN'),
  database: {
    host: requiredEnvironment('DB_HOST'),
    port: Number(requiredEnvironment('DB_PORT')),
    user: requiredEnvironment('DB_USER'),
    password: requiredEnvironment('DB_PASSWORD'),
    name: requiredEnvironment('DB_NAME'),
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    accessSecret: requiredEnvironmentAlias('JWT_ACCESS_SECRET', 'JWT_SECRET'),
    accessExpiresIn: requiredEnvironmentAlias('JWT_ACCESS_EXPIRES_IN', 'JWT_EXPIRES_IN'),
    refreshSecret: requiredEnvironmentAlias('JWT_REFRESH_SECRET', 'JWT_SECRET'),
    refreshExpiresIn: requiredEnvironmentAlias('JWT_REFRESH_EXPIRES_IN', 'JWT_EXPIRES_IN'),
  },
  email: {
    smtpHost: process.env.SMTP_HOST?.trim(),
    smtpPort: Number(process.env.SMTP_PORT ?? 465),
    smtpUser: process.env.SMTP_USER?.trim(),
    smtpPassword: process.env.SMTP_PASS,
    mailFrom: process.env.MAIL_FROM?.trim(),
    verificationCodeSecret: process.env.VERIFICATION_CODE_SECRET,
  },
  socialAuth: {
    googleClientIds: (process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || '').split(',').map((value) => value.trim()).filter(Boolean),
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim(),
    facebookAppId: process.env.FACEBOOK_APP_ID?.trim(),
    facebookAppSecret: (process.env.FACEBOOK_APP_SECRET || process.env.FACEBOOK_CLIENT_SECRET)?.trim(),
    githubClientId: process.env.GITHUB_CLIENT_ID?.trim(),
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET?.trim(),
  },
};
