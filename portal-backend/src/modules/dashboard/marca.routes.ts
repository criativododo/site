import { Router } from "express";
import { obterIndicadoresOperacionaisMarca } from "./dashboard.service.js";

export const dashboardMarcaRoutes = Router();

/** Visão operacional da campanha do Administrador da Marca (ADR-022) — ver dashboard.service.ts. */
dashboardMarcaRoutes.get("/", async (_req, res) => {
  res.json(await obterIndicadoresOperacionaisMarca());
});
