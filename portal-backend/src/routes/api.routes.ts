import { Router } from "express";
import { registrarAuditoria } from "../middleware/auditoria.js";
import { bloquearParceiraIdDeCliente, parceiraDaSessao } from "../middleware/isolamento.js";
import { requireAdmin, requireAuth, requireContaAtiva } from "../middleware/requireAuth.js";
import { briefingAdminRoutes } from "../modules/briefing/admin.routes.js";
import { entregaAdminRoutes } from "../modules/conteudo/admin.routes.js";
import { conteudoRoutes } from "../modules/conteudo/conteudo.routes.js";
import { dashboardRoutes } from "../modules/dashboard/dashboard.routes.js";
import { financeiroRoutes } from "../modules/financeiro/financeiro.routes.js";
import { adminRoutes } from "../modules/identidade/admin.routes.js";
import { lgpdAdminRoutes, lgpdRoutes } from "../modules/lgpd/lgpd.routes.js";
import { parceiraRoutes } from "../modules/parceira/parceira.routes.js";
import { perfilRoutes } from "../modules/perfil/perfil.routes.js";

export const apiRoutes = Router();

/**
 * Toda rota nasce sob esta cadeia: autenticar → exigir conta ACTIVE → auditar. `bloquearParceiraIdDeCliente`
 * NÃO entra aqui — seu escopo é só as rotas do Portal (self-service da Parceira, Feature 1.3),
 * nunca as administrativas: o Administrador precisa poder referenciar qualquer `parceiraId` no
 * corpo da requisição (é o próprio propósito do Backoffice), restrito só por `requireAdmin`.
 */
apiRoutes.use(requireAuth, requireContaAtiva, registrarAuditoria);

/**
 * Rota de verificação da fundação (EPIC 1) — não é uma feature de produto (isso é EPIC 4,
 * SPEC-032). Só demonstra que o isolamento por sessão funciona antes que exista qualquer
 * agregado Parceira real para consultar.
 */
apiRoutes.get("/fundacao/whoami", (req, res) => {
  res.json({ parceiraId: parceiraDaSessao(req) });
});

/** EPIC 2 — Conteúdo e Pendências (SPEC-027). */
apiRoutes.use("/portal", bloquearParceiraIdDeCliente, conteudoRoutes);

/** EPIC 3 — Financeiro e Histórico (SPEC-030). */
apiRoutes.use("/portal/financeiro", bloquearParceiraIdDeCliente, financeiroRoutes);

/** EPIC 4 — Perfil (SPEC-032). */
apiRoutes.use("/portal/perfil", bloquearParceiraIdDeCliente, perfilRoutes);

/** EPIC 5, Feature 5.3 — Moderação administrativa (SPEC-035 Cap. 5.4/5.5, RN-04). */
apiRoutes.use("/admin", adminRoutes);

/** Backoffice administrativo — Gestão de Parceiras (SPEC-001/SPEC-002). */
apiRoutes.use("/admin/parceiras", requireAdmin, parceiraRoutes);

/** Backoffice administrativo — Dashboard (painel operacional, agregação só leitura). */
apiRoutes.use("/admin/dashboard", requireAdmin, dashboardRoutes);

/** Backoffice administrativo — Entregas (criação administrativa; SPEC-012, preparação para CRUD completo). */
apiRoutes.use("/admin/entregas", requireAdmin, entregaAdminRoutes);

/** Backoffice administrativo — Briefing (CRUD completo, SPEC-009; sempre vinculado a uma Entrega existente). */
apiRoutes.use("/admin/briefings", requireAdmin, briefingAdminRoutes);

/** LGPD (ADR-010) — direitos do titular: acesso/portabilidade e processo de expurgo. */
apiRoutes.use("/portal/lgpd", bloquearParceiraIdDeCliente, lgpdRoutes);
apiRoutes.use("/admin/lgpd", lgpdAdminRoutes);
