import { Router } from "express";
import {
  criarEntregaAdministrativa,
  listarTodasEntregas,
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

/** Backoffice — leitura irrestrita de todas as Entregas (Administrador vê tudo, sem isolamento por Parceira). */
entregaAdminRoutes.get("/", async (_req, res) => {
  res.json({ itens: await listarTodasEntregas() });
});

/** Backoffice — criação administrativa (RN análoga à RN-01 de Parceira: nasce sempre AGUARDANDO_MATERIAL). */
entregaAdminRoutes.post("/", async (req, res) => {
  const { parceiraId, mesReferencia, formato, dataEntrega } = req.body ?? {};

  if (!parceiraId || !mesReferencia || !formato || !dataEntrega) {
    res.status(400).json({ error: "Campos obrigatórios: parceiraId, mesReferencia, formato, dataEntrega." });
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
