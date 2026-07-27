import { Router } from "express";
import {
  criarBriefingParaEntrega,
  editarBriefing,
  listarBriefingsAdministrativos,
  removerBriefing,
  type MotivoRejeicaoEdicaoBriefing,
  type MotivoRejeicaoNovoBriefing,
  type MotivoRejeicaoRemocaoBriefing,
} from "./briefing.service.js";

export const briefingAdminRoutes = Router();

function mensagemDeErroConteudo(
  motivo: MotivoRejeicaoNovoBriefing | MotivoRejeicaoEdicaoBriefing,
): string {
  switch (motivo) {
    case "LOOK_OBRIGATORIO":
      return "look é obrigatório.";
    case "ORIENTACAO_OBRIGATORIA":
      return "orientacao é obrigatória.";
    case "DATA_ENTREGA_INVALIDA":
      return "dataEntrega deve estar no formato AAAA-MM-DD.";
    case "DATA_POSTAGEM_INVALIDA":
      return "dataPostagem deve estar no formato AAAA-MM-DD.";
    case "ENTREGA_INEXISTENTE":
      return "Entrega não encontrada.";
    case "BRIEFING_JA_EXISTE_PARA_ENTREGA":
      return "já existe um Briefing para esta Entrega — edite o existente em vez de criar outro.";
    case "NAO_ENCONTRADO":
      return "Briefing não encontrado.";
  }
}

function mensagemDeErroRemocao(motivo: MotivoRejeicaoRemocaoBriefing): string {
  switch (motivo) {
    case "NAO_ENCONTRADO":
      return "Briefing não encontrado.";
    case "ENTREGA_EM_ANDAMENTO":
      return "a Entrega vinculada já saiu de 'aguardando material' — remover o Briefing perderia o rastro do que a orientou.";
  }
}

/** Backoffice — leitura irrestrita de todos os Blocos, cada um com a Entrega vinculada (se houver). */
briefingAdminRoutes.get("/", async (_req, res) => {
  res.json({ itens: await listarBriefingsAdministrativos() });
});

/** Backoffice — criação sempre vinculada a uma Entrega existente (nunca por parceiraId/mesReferencia/formato soltos). */
briefingAdminRoutes.post("/", async (req, res) => {
  const { entregaId, look, dataEntrega, dataPostagem, orientacao } = req.body ?? {};

  if (!entregaId || !look || !dataEntrega || !dataPostagem || !orientacao) {
    res.status(400).json({
      error: "Campos obrigatórios: entregaId, look, dataEntrega, dataPostagem, orientacao.",
    });
    return;
  }

  const resultado = await criarBriefingParaEntrega({ entregaId, look, dataEntrega, dataPostagem, orientacao });

  if (!resultado.ok) {
    const status =
      resultado.motivo === "ENTREGA_INEXISTENTE"
        ? 404
        : resultado.motivo === "BRIEFING_JA_EXISTE_PARA_ENTREGA"
          ? 409
          : 400;
    res.status(status).json({ error: mensagemDeErroConteudo(resultado.motivo) });
    return;
  }

  res.status(201).json(resultado.briefing);
});

/** Backoffice — edição de conteúdo (nunca reatribui a chave natural parceiraId/mesReferencia/formato). */
briefingAdminRoutes.patch("/:id", async (req, res) => {
  const resultado = await editarBriefing(req.params.id, req.body ?? {});

  if (!resultado.ok) {
    const status = resultado.motivo === "NAO_ENCONTRADO" ? 404 : 400;
    res.status(status).json({ error: mensagemDeErroConteudo(resultado.motivo) });
    return;
  }

  res.json(resultado.briefing);
});

/** Backoffice — remoção só permitida enquanto a Entrega vinculada estiver AGUARDANDO_MATERIAL. */
briefingAdminRoutes.delete("/:id", async (req, res) => {
  const resultado = await removerBriefing(req.params.id);

  if (!resultado.ok) {
    const status = resultado.motivo === "NAO_ENCONTRADO" ? 404 : 409;
    res.status(status).json({ error: mensagemDeErroRemocao(resultado.motivo) });
    return;
  }

  res.status(204).send();
});
