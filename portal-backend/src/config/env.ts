import { execSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config();
/**
 * Testes (`vitest`, que define `NODE_ENV=test`) usam `.env.test` — banco de dados isolado do
 * de desenvolvimento, mesma disciplina de nunca misturar dado de teste com dado real. As
 * demais variáveis (segredos OIDC, etc.) continuam vindas de `.env` — só sobrepomos o que
 * `.env.test` declarar explicitamente.
 */
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test", override: true });
}

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${nome}`);
  }
  return valor;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * SHA curto do commit em execução — correlaciona erro de produção com o deploy que o causou
 * (sprint de observabilidade). `GIT_SHA` permite injeção externa (ex.: build futuro fora de um
 * clone git); na ausência, lê `git rev-parse` do próprio checkout (é como este projeto é
 * deployado hoje — `deploy/deploy.sh` faz `git pull` direto no diretório servido). Nunca deve
 * derrubar o boot: falha aqui vira "desconhecida", não exceção.
 */
function obterVersao(): string {
  if (process.env.GIT_SHA) return process.env.GIT_SHA;
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "desconhecida";
  }
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  versao: obterVersao(),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  frontendUrls: (process.env.FRONTEND_URLS ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),

  sessionSecret: obrigatoria("SESSION_SECRET"),

  /** Fase 2 do Plano Mestre (persistência real) — string de conexão do PostgreSQL. */
  databaseUrl: obrigatoria("DATABASE_URL"),

  google: {
    clientId: obrigatoria("GOOGLE_CLIENT_ID"),
    clientSecret: obrigatoria("GOOGLE_CLIENT_SECRET"),
    redirectUri: obrigatoria("GOOGLE_REDIRECT_URI"),
  },

  /**
   * OAuth dedicado ao Google Drive (ADR-017, início da Fase 4) — conta única administrada,
   * distinta do client de login acima. Opcional (não usa `obrigatoria()`): ainda não é
   * exigido pelo boot da aplicação em nenhum ambiente, só pelo helper de
   * `shared/googleDrive` quando efetivamente chamado.
   */
  googleDrive: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET ?? "",
    refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN ?? "",
  },

  /**
   * Storage (Fase 4, Gate 3, `docs/TDD_STORAGE_GOOGLE_DRIVE.md` §3.3) — raiz do Portal no
   * Google Drive, provisionada uma única vez fora de tempo de request (`npm run
   * drive:provisionar-raiz`). Opcional (não usa `obrigatoria()`): só é exigido quando
   * `ServicoDeArmazenamento` é efetivamente chamado, não pelo boot da aplicação.
   */
  storage: {
    tipo: "google-drive" as const,
    googleDrive: {
      pastaRaizId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? "",
    },
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
   *
   * Travado em produção no próprio código (não só por convenção de `.env`): mesmo que a
   * variável fique setada por engano, `isProduction` força os campos a string vazia.
   */
  parceiraSeed: {
    email: isProduction ? "" : (process.env.PARCEIRA_SEED_EMAIL ?? "").trim().toLowerCase(),
    id: isProduction ? "" : (process.env.PARCEIRA_SEED_ID ?? ""),
  },
};
