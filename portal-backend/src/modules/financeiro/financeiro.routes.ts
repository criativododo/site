import { Router } from "express";
import { parceiraDaSessao } from "../../middleware/isolamento.js";
import { listarPeriodosComAtividade } from "./financeiro.service.js";

export const financeiroRoutes = Router();

/** UC-030.03 · Selecionar período: só competências com atividade real da Parceira (RN-04). */
financeiroRoutes.get("/periodos", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const periodos = await listarPeriodosComAtividade(parceiraId);
  res.json({ periodos });
});
