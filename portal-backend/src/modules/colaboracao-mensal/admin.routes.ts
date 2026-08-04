import { Router } from "express";
import { mensagemDeCamposObrigatoriosAusentes } from "../../shared/validacaoCampos.js";
import { buscarColaboracaoMensal, compilarCompetencia, listarColaboracoesDaParceira } from "./colaboracaoMensal.service.js";

export const colaboracaoMensalAdminRoutes = Router();

/** DTO do corpo de `POST /compilar` (ADR-016 item 2 — gatilho manual do Administrador). */
interface CompilarCompetenciaRequestBody {
  mesReferencia?: string;
}

/**
 * Backoffice — gatilho manual de compilação de competência (ADR-016 item 2). Controller
 * fino: toda a regra vive em `compilarCompetencia` (colaboracaoMensal.service.ts) — aqui só
 * validação de shape do request e tradução do `Resultado` para HTTP. Não gera Entregas/
 * Briefings/Obrigações automaticamente (decisão de escopo do Service, não desta rota); só
 * materializa a Colaboração Mensal (snapshot da Condição Comercial) para cada Parceira ATIVA
 * e vincula o que já existir para aquela competência. Idempotente: repetir a chamada para a
 * mesma competência não duplica nem altera o snapshot já gravado.
 */
colaboracaoMensalAdminRoutes.post("/compilar", async (req, res) => {
  const corpo: Record<string, unknown> = req.body ?? {};

  const erroCampos = mensagemDeCamposObrigatoriosAusentes(corpo, ["mesReferencia"]);
  if (erroCampos) {
    res.status(400).json({ error: erroCampos });
    return;
  }

  const { mesReferencia } = corpo as CompilarCompetenciaRequestBody;
  const resultado = await compilarCompetencia(mesReferencia as string, req.sessao!.subProvider);

  if (!resultado.ok) {
    res.status(400).json({ error: "a competência deve estar no formato aaaa-mm." });
    return;
  }

  res.status(200).json(resultado.estatisticas);
});

/** Backoffice — leitura das Colaborações Mensais de uma Parceira (histórico de competências). */
colaboracaoMensalAdminRoutes.get("/", async (req, res) => {
  const parceiraId = typeof req.query.parceiraId === "string" ? req.query.parceiraId : undefined;
  if (!parceiraId) {
    console.error("GET /colaboracoes-mensais: parâmetro obrigatório ausente (parceiraId)");
    res.status(400).json({ error: "não foi possível carregar o histórico da parceira." });
    return;
  }

  res.json({ itens: await listarColaboracoesDaParceira(parceiraId) });
});

/** Backoffice — leitura de uma Colaboração Mensal específica (Parceira × competência). */
colaboracaoMensalAdminRoutes.get("/:parceiraId/:mesReferencia", async (req, res) => {
  const colaboracao = await buscarColaboracaoMensal(req.params.parceiraId, req.params.mesReferencia);

  if (!colaboracao) {
    res.status(404).json({ error: "colaboração mensal não encontrada." });
    return;
  }

  res.json(colaboracao);
});
