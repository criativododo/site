import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { authRoutes } from "./modules/identidade/auth.routes.js";
import { apiRoutes } from "./routes/api.routes.js";

export const app = express();

/**
 * Necessário para que rate limiting e `req.ip` funcionem corretamente atrás de um proxy
 * reverso (nginx, padrão já usado neste projeto — `knowledge/Deploy/INFRAESTRUTURA.md`).
 * Sem isso, express-rate-limit erra ao ler X-Forwarded-For e todos os usuários compartilham
 * o mesmo limite. Ajustar a contagem de hops quando a topologia real de produção for confirmada.
 */
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrls,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/** Proteção de infraestrutura contra abuso/força-bruta — não é regra de negócio (RN-17 é N/A para OIDC). */
const limitadorAuth = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 });
const limitadorApi = rateLimit({ windowMs: 15 * 60 * 1000, limit: 600 });

app.use("/auth", limitadorAuth, authRoutes);
app.use("/api", limitadorApi, apiRoutes);

/** Todo endpoint deste backend é JSON — inclusive o que não existe e o que falha. */
app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (!env.isProduction) {
    console.error(err);
  }
  res.status(500).json({ error: "Erro interno do servidor." });
});
