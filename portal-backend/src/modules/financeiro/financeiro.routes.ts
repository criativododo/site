import { Router } from "express";
import { parceiraDaSessao } from "../../middleware/isolamento.js";
import { listarPeriodosComAtividade, obterHistorico, obterResumoFinanceiro } from "./financeiro.service.js";

export const financeiroRoutes = Router();

/** UC-030.03 · Selecionar período: só competências com atividade real da Parceira (RN-04). */
financeiroRoutes.get("/periodos", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const periodos = await listarPeriodosComAtividade(parceiraId);
  res.json({ periodos });
});

/** UC-030.01 · Ver financeiro do período. PF-02: período sem atividade da Parceira → 404. */
financeiroRoutes.get("/:mesReferencia/resumo", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const resumo = await obterResumoFinanceiro(parceiraId, req.params.mesReferencia);

  if (!resumo) {
    res.status(404).json({ error: "não há dados para este período." });
    return;
  }

  res.json(resumo);
});

/** UC-030.02 · Consultar histórico (INV-02: somente leitura). PF-02: mesmo tratamento do resumo. */
financeiroRoutes.get("/:mesReferencia/historico", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const historico = await obterHistorico(parceiraId, req.params.mesReferencia);

  if (!historico) {
    res.status(404).json({ error: "não há dados para este período." });
    return;
  }

  res.json(historico);
});
