import { Router } from "express";
import { parceiraDaSessao } from "../../middleware/isolamento.js";
import { listarPendencias } from "./conteudo.service.js";

export const conteudoRoutes = Router();

/**
 * UC-027.01 · Ver pendências. Monta sob apiRoutes (routes/api.routes.ts), portanto já passou
 * por requireAuth + requireContaAtiva + bloquearParceiraIdDeCliente + auditoria — a Parceira
 * só pode ser a da própria sessão (RN-01).
 */
conteudoRoutes.get("/pendencias", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const resultado = await listarPendencias(parceiraId);
  res.json(resultado);
});
