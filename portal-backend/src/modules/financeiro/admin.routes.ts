import { Router } from "express";
import { logAviso } from "../../shared/log.js";
import {
  editarValorObrigacao,
  lancarObrigacao,
  liberarObrigacao,
  listarObrigacoesAdministrativas,
  marcarObrigacaoPaga,
  removerObrigacao,
  type MotivoRejeicaoEdicaoObrigacao,
  type MotivoRejeicaoLiberacao,
  type MotivoRejeicaoNovaObrigacao,
  type MotivoRejeicaoPagamento,
  type MotivoRejeicaoRemocaoObrigacao,
} from "./financeiro.service.js";

export const obrigacaoAdminRoutes = Router();

function mensagemDeErro(
  motivo:
    | MotivoRejeicaoNovaObrigacao
    | MotivoRejeicaoEdicaoObrigacao
    | MotivoRejeicaoLiberacao
    | MotivoRejeicaoPagamento
    | MotivoRejeicaoRemocaoObrigacao,
): string {
  switch (motivo) {
    case "MES_REFERENCIA_INVALIDO":
      return "mesReferencia deve estar no formato AAAA-MM.";
    case "VALOR_INVALIDO":
      return "valor deve ser um número positivo.";
    case "PARCEIRA_INEXISTENTE":
      return "Parceira não encontrada.";
    case "PARCEIRA_INATIVA":
      return "Parceira está inativa — Obrigação Mensal exige Parceira ativa.";
    case "OBRIGACAO_MENSAL_JA_EXISTE":
      return "já existe uma Obrigação Mensal para esta Parceira nesta competência.";
    case "NAO_ENCONTRADA":
      return "Obrigação Financeira não encontrada.";
    case "OBRIGACAO_ARQUIVADA":
      return "Obrigação já paga — arquivada e somente leitura.";
    case "TRANSICAO_INVALIDA":
      return "transição de estado inválida para o estado atual da Obrigação.";
    case "CONTEUDO_NAO_APROVADO":
      return "não é possível liberar: há Entregas da competência ainda não Aprovadas/Publicadas.";
    case "JA_LIBERADA":
      return "só é possível remover uma Obrigação ainda EM_ABERTO.";
  }
}

/** Backoffice — leitura irrestrita de todas as Obrigações, cada uma com as Entregas da competência e elegibilidade calculada. */
obrigacaoAdminRoutes.get("/", async (_req, res) => {
  res.json({ itens: await listarObrigacoesAdministrativas() });
});

/** Backoffice — lançamento (Mensal exige Parceira ATIVA e é único por competência; Avulso não). */
obrigacaoAdminRoutes.post("/", async (req, res) => {
  const { parceiraId, mesReferencia, valor, tipo } = req.body ?? {};

  // valor usa `=== undefined` (não a checagem genérica de truthiness) porque 0 é um valor
  // presente-mas-inválido que deve cair no motivo VALOR_INVALIDO do service, não aqui.
  if (!parceiraId || !mesReferencia || valor === undefined || !tipo) {
    logAviso("financeiro-admin", {
      rota: "POST /obrigacoes",
      motivo: "campos obrigatórios ausentes (parceiraId, mesReferencia, valor, tipo)",
      requestId: req.requestId,
    });
    res.status(400).json({ error: "não foi possível lançar a obrigação." });
    return;
  }
  if (tipo !== "MENSAL" && tipo !== "AVULSO") {
    logAviso("financeiro-admin", {
      rota: "POST /obrigacoes",
      motivo: "tipo inválido",
      tipoRecebido: String(tipo),
      requestId: req.requestId,
    });
    res.status(400).json({ error: "não foi possível lançar a obrigação." });
    return;
  }

  const resultado = await lancarObrigacao({ parceiraId, mesReferencia, valor: Number(valor), tipo });

  if (!resultado.ok) {
    const status = resultado.motivo === "PARCEIRA_INEXISTENTE" ? 404 : 400;
    res.status(status).json({ error: mensagemDeErro(resultado.motivo) });
    return;
  }

  res.status(201).json(resultado.obrigacao);
});

/** Backoffice — edição de valor (recusada se a Obrigação já estiver PAGA/arquivada). */
obrigacaoAdminRoutes.patch("/:id", async (req, res) => {
  const { valor } = req.body ?? {};
  if (valor === undefined) {
    res.status(400).json({ error: "informe o valor." });
    return;
  }

  const resultado = await editarValorObrigacao(req.params.id, Number(valor));

  if (!resultado.ok) {
    const status = resultado.motivo === "NAO_ENCONTRADA" ? 404 : 409;
    res.status(status).json({ error: mensagemDeErro(resultado.motivo) });
    return;
  }

  res.json(resultado.obrigacao);
});

/** Backoffice — liberar (EM_ABERTO → APROVADO); Mensal passa pelo gate de elegibilidade (ADR-009). */
obrigacaoAdminRoutes.patch("/:id/liberar", async (req, res) => {
  const resultado = await liberarObrigacao(req.params.id);

  if (!resultado.ok) {
    const status = resultado.motivo === "NAO_ENCONTRADA" ? 404 : 409;
    res.status(status).json({ error: mensagemDeErro(resultado.motivo) });
    return;
  }

  res.json(resultado.obrigacao);
});

/** Backoffice — marcar como paga (APROVADO → PAGO), arquivando com dataArquivamento. */
obrigacaoAdminRoutes.patch("/:id/pagar", async (req, res) => {
  const resultado = await marcarObrigacaoPaga(req.params.id);

  if (!resultado.ok) {
    const status = resultado.motivo === "NAO_ENCONTRADA" ? 404 : 409;
    res.status(status).json({ error: mensagemDeErro(resultado.motivo) });
    return;
  }

  res.json(resultado.obrigacao);
});

/** Backoffice — remoção só permitida enquanto EM_ABERTO (antes de qualquer liberação/cobrança). */
obrigacaoAdminRoutes.delete("/:id", async (req, res) => {
  const resultado = await removerObrigacao(req.params.id);

  if (!resultado.ok) {
    const status = resultado.motivo === "NAO_ENCONTRADA" ? 404 : 409;
    res.status(status).json({ error: mensagemDeErro(resultado.motivo) });
    return;
  }

  res.status(204).send();
});
