import { Router } from "express";
import { registrarAuditoria } from "../middleware/auditoria.js";
import { bloquearParceiraIdDeCliente, parceiraDaSessao } from "../middleware/isolamento.js";
import { requireAdmin, requireAuth, requireContaAtiva } from "../middleware/requireAuth.js";
import { conteudoRoutes } from "../modules/conteudo/conteudo.routes.js";
import { dashboardRoutes } from "../modules/dashboard/dashboard.routes.js";
import { financeiroRoutes } from "../modules/financeiro/financeiro.routes.js";
import { adminRoutes } from "../modules/identidade/admin.routes.js";
import { lgpdAdminRoutes, lgpdRoutes } from "../modules/lgpd/lgpd.routes.js";
import { parceiraRoutes } from "../modules/parceira/parceira.routes.js";
import { perfilRoutes } from "../modules/perfil/perfil.routes.js";

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

/** EPIC 3 — Financeiro e Histórico (SPEC-030). */
apiRoutes.use("/portal/financeiro", financeiroRoutes);

/** EPIC 4 — Perfil (SPEC-032). */
apiRoutes.use("/portal/perfil", perfilRoutes);

/** EPIC 5, Feature 5.3 — Moderação administrativa (SPEC-035 Cap. 5.4/5.5, RN-04). */
apiRoutes.use("/admin", adminRoutes);

/** Backoffice administrativo — Gestão de Parceiras (SPEC-001/SPEC-002). */
apiRoutes.use("/admin/parceiras", requireAdmin, parceiraRoutes);

/** Backoffice administrativo — Dashboard (painel operacional, agregação só leitura). */
apiRoutes.use("/admin/dashboard", requireAdmin, dashboardRoutes);

/** LGPD (ADR-010) — direitos do titular: acesso/portabilidade e processo de expurgo. */
apiRoutes.use("/portal/lgpd", lgpdRoutes);
apiRoutes.use("/admin/lgpd", lgpdAdminRoutes);
