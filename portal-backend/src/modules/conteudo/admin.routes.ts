import { Router } from "express";
import { mensagemDeCamposObrigatoriosAusentes } from "../../shared/validacaoCampos.js";
import {
  aprovarEntrega,
  criarEntregaAdministrativa,
  listarTodasEntregas,
  type MotivoRejeicaoAprovacao,
  type MotivoRejeicaoNovaEntrega,
} from "./conteudo.service.js";

export const entregaAdminRoutes = Router();

function mensagemDeErro(motivo: MotivoRejeicaoNovaEntrega): string {
  switch (motivo) {
    case "FORMATO_INVALIDO":
      return "formato deve ser Reel, Carrossel, Stories1 ou Stories2.";
    case "MES_REFERENCIA_INVALIDO":
      return "mesReferencia deve estar no formato AAAA-MM.";
    case "DATA_ENTREGA_INVALIDA":
      return "dataEntrega deve estar no formato AAAA-MM-DD.";
    case "PARCEIRA_INEXISTENTE":
      return "Parceira não encontrada.";
    case "PARCEIRA_INATIVA":
      return "Parceira está inativa — ative-a antes de criar Entregas.";
  }
}

function mensagemDeErroAprovacao(motivo: MotivoRejeicaoAprovacao): string {
  switch (motivo) {
    case "NAO_ENCONTRADA":
      return "Entrega não encontrada.";
    case "TRANSICAO_INVALIDA":
      return "só é possível aprovar uma Entrega que esteja 'em revisão'.";
  }
}

/** Backoffice — leitura irrestrita de todas as Entregas (Administrador vê tudo, sem isolamento por Parceira). */
entregaAdminRoutes.get("/", async (_req, res) => {
  res.json({ itens: await listarTodasEntregas() });
});

/** Backoffice — criação administrativa (RN análoga à RN-01 de Parceira: nasce sempre AGUARDANDO_MATERIAL). */
entregaAdminRoutes.post("/", async (req, res) => {
  const corpo = req.body ?? {};
  const { parceiraId, mesReferencia, formato, dataEntrega } = corpo;

  const erroCampos = mensagemDeCamposObrigatoriosAusentes(corpo, [
    "parceiraId",
    "mesReferencia",
    "formato",
    "dataEntrega",
  ]);
  if (erroCampos) {
    res.status(400).json({ error: erroCampos });
    return;
  }

  const resultado = await criarEntregaAdministrativa({ parceiraId, mesReferencia, formato, dataEntrega });

  if (!resultado.ok) {
    const status = resultado.motivo === "PARCEIRA_INEXISTENTE" ? 404 : 400;
    res.status(status).json({ error: mensagemDeErro(resultado.motivo) });
    return;
  }

  res.status(201).json(resultado.entrega);
});

/** Backoffice — aprovação (EM_REVISAO → APROVADO, UC-012.03 parte 1; CT-03 para qualquer outra origem). */
entregaAdminRoutes.patch("/:id/aprovar", async (req, res) => {
  const resultado = await aprovarEntrega(req.params.id);

  if (!resultado.ok) {
    const status = resultado.motivo === "NAO_ENCONTRADA" ? 404 : 409;
    res.status(status).json({ error: mensagemDeErroAprovacao(resultado.motivo) });
    return;
  }

  res.json(resultado.entrega);
});
