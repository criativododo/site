import { Router } from "express";
import { parceiraDaSessao } from "../../middleware/isolamento.js";
import { logAviso } from "../../shared/log.js";
import { requireAdmin } from "../../middleware/requireAuth.js";
import { decidirExclusao, listarSolicitacoesPendentes, solicitarExclusao } from "./exclusao.service.js";
import { exportarDadosDaParceira } from "./exportacao.service.js";

export const lgpdRoutes = Router();

/** ADR-010 ponto 5 (acesso/portabilidade). */
lgpdRoutes.get("/exportar", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  res.json(await exportarDadosDaParceira(parceiraId));
});

/** ADR-010 ponto 7 (processo de expurgo): só registra o pedido, nunca apaga na hora. */
lgpdRoutes.post("/exclusao", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const solicitacao = await solicitarExclusao(parceiraId);
  res.status(201).json(solicitacao);
});

/** ADR-010 ponto 7: fila e decisão de exclusão são exclusivas do Administrador. */
export const lgpdAdminRoutes = Router();
lgpdAdminRoutes.use(requireAdmin);

lgpdAdminRoutes.get("/exclusao/pendentes", async (_req, res) => {
  res.json({ itens: await listarSolicitacoesPendentes() });
});

lgpdAdminRoutes.patch("/exclusao/:id/decidir", async (req, res) => {
  const { aprovada, fundamentoJuridico, responsavelAnalise } = req.body ?? {};

  if (typeof aprovada !== "boolean" || !fundamentoJuridico || !responsavelAnalise) {
    logAviso("lgpd-admin", {
      rota: "PATCH /lgpd/exclusao/:id/decidir",
      motivo: "campos obrigatórios ausentes (aprovada, fundamentoJuridico, responsavelAnalise)",
      requestId: req.requestId,
    });
    res.status(400).json({ error: "não foi possível registrar a decisão sobre a exclusão." });
    return;
  }

  const resultado = await decidirExclusao(req.params.id, { aprovada, fundamentoJuridico, responsavelAnalise });

  if (!resultado.ok) {
    if (resultado.motivo === "NAO_ENCONTRADA") {
      res.status(404).json({ error: "solicitação não encontrada." });
      return;
    }
    res.status(409).json({ error: "esta solicitação já foi decidida." });
    return;
  }

  res.json(resultado.solicitacao);
});
