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

  /**
   * Seed de desenvolvimento/QA (não é produto): o modelo de Parceira e o fluxo real de
   * vinculação Identidade↔Parceira (SPEC-035 §5.1-A, confirmação manual explícita) ainda não
   * existem fisicamente neste repositório. Sem isso, nenhuma conta INFLUENCIADORA consegue ter
   * `parceiraId` para exercitar EPIC 2/3/4. Se configurado, o primeiro login com este e-mail
   * nasce já ACTIVE e vinculado a este `parceiraId` fixo — só para viabilizar QA manual do
   * Portal antes do fluxo real existir. Vazio por padrão (inerte); nunca usar em produção real.
   */
  parceiraSeed: {
    email: (process.env.PARCEIRA_SEED_EMAIL ?? "").trim().toLowerCase(),
    id: process.env.PARCEIRA_SEED_ID ?? "",
  },
};
