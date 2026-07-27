import { Router } from "express";
import { obterIndicadoresAdministrativos } from "./dashboard.service.js";

export const dashboardRoutes = Router();

/** Painel operacional do Administrador — ver dashboard.service.ts. */
dashboardRoutes.get("/", async (_req, res) => {
  res.json(await obterIndicadoresAdministrativos());
});
