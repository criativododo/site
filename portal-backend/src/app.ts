import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { env } from "./config/env.js";
import { authRoutes } from "./modules/identidade/auth.routes.js";
import { apiRoutes } from "./routes/api.routes.js";

export const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

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
