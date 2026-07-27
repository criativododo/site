import type { Response } from "express";
import { Router } from "express";
import { requireAdmin } from "../../middleware/requireAuth.js";
import { aprovarConta, listarContasPendentes, rejeitarConta } from "./identidade.service.js";
import type { ResultadoModeracao } from "./identidade.service.js";

export const adminRoutes = Router();

adminRoutes.use(requireAdmin);

/** Feature 5.3 · Fila de moderação (RN-04): contas PENDING aguardando decisão. */
adminRoutes.get("/identidades/pendentes", async (_req, res) => {
  const pendentes = await listarContasPendentes();
  res.json({
    itens: pendentes.map((identidade) => ({
      subProvider: identidade.subProvider,
      email: identidade.emailPerfil,
      nome: identidade.nomeCompleto,
      papelAtor: identidade.papelAtor,
      dataCriacao: identidade.dataCriacao,
    })),
  });
});

function responderModeracao(resultado: ResultadoModeracao, res: Response) {
  if (!resultado.ok) {
    if (resultado.motivo === "NAO_ENCONTRADA") {
      res.status(404).json({ error: "Conta não encontrada." });
      return;
    }
    res.status(409).json({ error: "Conta não está com status Pendente." });
    return;
  }
  res.json({ subProvider: resultado.identidade.subProvider, estadoConta: resultado.identidade.estadoConta });
}

/** Feature 5.3 · Aprovar: PENDING → ACTIVE. */
adminRoutes.patch("/identidades/:subProvider/aprovar", async (req, res) => {
  responderModeracao(await aprovarConta(req.params.subProvider), res);
});

/** Feature 5.3 · Rejeitar: PENDING → REJECTED. */
adminRoutes.patch("/identidades/:subProvider/rejeitar", async (req, res) => {
  responderModeracao(await rejeitarConta(req.params.subProvider), res);
});
