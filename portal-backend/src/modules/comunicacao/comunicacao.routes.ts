import { Router } from "express";
import {
  obterHistoricoGeral,
  obterHistoricoPorParceira,
  obterReferenciaModelos,
  prepararMensagem,
} from "./comunicacao.service.js";
import type { CategoriaMensagemPreparada } from "./comunicacao.types.js";

const CATEGORIAS_VALIDAS: CategoriaMensagemPreparada[] = [
  "BOAS_VINDAS",
  "BRIEFING",
  "LEMBRETE",
  "APROVACAO",
  "NOTA_FISCAL",
  "PAGAMENTO",
  "LOGISTICA",
  "ENCERRAMENTO",
  "PERSONALIZADA",
];

export const comunicacaoRoutes = Router();

/** Referência da tela Comunicação: modelos por categoria + variáveis suportadas. */
comunicacaoRoutes.get("/modelos", (_req, res) => {
  res.json(obterReferenciaModelos());
});

/** "Mensagens recentes" — histórico geral, todas as Parceiras. */
comunicacaoRoutes.get("/", async (_req, res) => {
  res.json({ itens: await obterHistoricoGeral() });
});

/** Histórico contextual, exibido dentro da Ficha de uma Parceira. */
comunicacaoRoutes.get("/parceira/:parceiraId", async (req, res) => {
  res.json({ itens: await obterHistoricoPorParceira(req.params.parceiraId) });
});

/**
 * Registra uma mensagem preparada (RN: o Portal nunca envia — só prepara o texto e o
 * Administrador abre o WhatsApp por fora). `corpoFinal` já chega com as variáveis resolvidas
 * pelo cliente.
 */
comunicacaoRoutes.post("/preparar", async (req, res) => {
  const corpo = req.body ?? {};
  const { parceiraId, categoria, modeloId, corpoFinal } = corpo;

  if (typeof parceiraId !== "string" || !parceiraId) {
    res.status(400).json({ error: "parceiraId é obrigatório." });
    return;
  }
  if (typeof categoria !== "string" || !CATEGORIAS_VALIDAS.includes(categoria as CategoriaMensagemPreparada)) {
    res.status(400).json({ error: "categoria inválida." });
    return;
  }
  if (typeof corpoFinal !== "string" || !corpoFinal.trim()) {
    res.status(400).json({ error: "corpoFinal é obrigatório." });
    return;
  }

  const resultado = await prepararMensagem({
    parceiraId,
    categoria: categoria as CategoriaMensagemPreparada,
    modeloId: typeof modeloId === "string" ? modeloId : null,
    corpoFinal,
    preparadoPor: req.sessao?.email ?? "desconhecido",
  });

  if (!resultado.ok) {
    res.status(404).json({ error: "parceira não encontrada." });
    return;
  }
  res.status(201).json(resultado.mensagem);
});
