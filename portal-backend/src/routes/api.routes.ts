import { Router } from "express";
import { registrarAuditoria } from "../middleware/auditoria.js";
import { bloquearParceiraIdDeCliente, parceiraDaSessao } from "../middleware/isolamento.js";
import { requireAuth, requireContaAtiva } from "../middleware/requireAuth.js";
import { conteudoRoutes } from "../modules/conteudo/conteudo.routes.js";

export const apiRoutes = Router();

/**
 * Toda rota de negócio do Portal nasce sob esta cadeia (Feature 1.3): autenticar → exigir
 * conta ACTIVE → bloquear parceiraId vindo do cliente → auditar. Nenhuma rota de EPIC 2/3/4
 * deve ser adicionada a este router sem passar pelos mesmos quatro middlewares.
 */
apiRoutes.use(requireAuth, requireContaAtiva, bloquearParceiraIdDeCliente, registrarAuditoria);

/**
 * Rota de verificação da fundação (EPIC 1) — não é uma feature de produto (isso é EPIC 4,
 * SPEC-032). Só demonstra que o isolamento por sessão funciona antes que exista qualquer
 * agregado Parceira real para consultar.
 */
apiRoutes.get("/fundacao/whoami", (req, res) => {
  res.json({ parceiraId: parceiraDaSessao(req) });
});

/** EPIC 2 — Conteúdo e Pendências (SPEC-027). */
apiRoutes.use("/portal", conteudoRoutes);
