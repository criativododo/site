import { Router } from "express";
import { obterPanoramaCampanha } from "./dashboard.service.js";

export const campanhaRoutes = Router();

/** Mesa da Campanha (ADR-023) — hub pós-login do Administrador. Ver dashboard.service.ts. */
campanhaRoutes.get("/", async (_req, res) => {
  res.json(await obterPanoramaCampanha());
});
