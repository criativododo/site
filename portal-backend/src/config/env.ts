import "dotenv/config";

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${nome}`);
  }
  return valor;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",

  sessionSecret: obrigatoria("SESSION_SECRET"),

  google: {
    clientId: obrigatoria("GOOGLE_CLIENT_ID"),
    clientSecret: obrigatoria("GOOGLE_CLIENT_SECRET"),
    redirectUri: obrigatoria("GOOGLE_REDIRECT_URI"),
  },

  adminBootstrapEmails: (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
};
