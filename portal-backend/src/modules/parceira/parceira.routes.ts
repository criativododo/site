import { Router } from "express";
import { logAviso } from "../../shared/log.js";
import { mensagemDeCamposObrigatoriosAusentes } from "../../shared/validacaoCampos.js";
import { obterFichaParceira } from "../dashboard/dashboard.service.js";
import {
  alterarStatusParceira,
  cadastrarParceira,
  editarParceira,
  listarParceiras,
} from "./parceira.service.js";

export const parceiraRoutes = Router();

/** UC-002.03 · Consultar base (Ativa/Inativa). */
parceiraRoutes.get("/", async (_req, res) => {
  res.json({ itens: await listarParceiras() });
});

/** Central de Influenciadoras (Sprint 2) — ficha completa de uma Parceira, agregação só leitura. */
parceiraRoutes.get("/:id/ficha", async (req, res) => {
  const ficha = await obterFichaParceira(req.params.id);
  if (!ficha) {
    res.status(404).json({ error: "parceira não encontrada." });
    return;
  }
  res.json(ficha);
});

/** RF-001/RN-01: cadastro administrativo — nasce sempre `INATIVA`. */
parceiraRoutes.post("/", async (req, res) => {
  const corpo = req.body ?? {};
  const { chave, nome, email, cnpj, pix, condicaoComercial } = corpo;

  const erroCampos = mensagemDeCamposObrigatoriosAusentes(corpo, [
    "chave",
    "nome",
    "email",
    "condicaoComercial",
  ]);
  if (erroCampos) {
    res.status(400).json({ error: erroCampos });
    return;
  }

  const parceira = await cadastrarParceira({
    chave,
    nome,
    email,
    cnpj: cnpj ?? "",
    pix: pix ?? "",
    condicaoComercial,
  });
  res.status(201).json(parceira);
});

/** UC-002.02: edição de dados cadastrais e Condição Comercial. */
parceiraRoutes.patch("/:id", async (req, res) => {
  const resultado = await editarParceira(req.params.id, req.body ?? {});
  if (!resultado.ok) {
    res.status(404).json({ error: "parceira não encontrada." });
    return;
  }
  res.json(resultado.parceira);
});

/** UC-002.01: alterar vínculo Ativa/Inativa (nunca exclui o registro). */
parceiraRoutes.patch("/:id/status", async (req, res) => {
  const { status } = req.body ?? {};
  if (status !== "ATIVA" && status !== "INATIVA") {
    logAviso("parceira-admin", {
      rota: "PATCH /parceiras/:id/status",
      motivo: "status inválido",
      statusRecebido: String(status),
      requestId: req.requestId,
    });
    res.status(400).json({ error: "não foi possível atualizar o status da parceira." });
    return;
  }

  const resultado = await alterarStatusParceira(req.params.id, status);
  if (!resultado.ok) {
    res.status(404).json({ error: "parceira não encontrada." });
    return;
  }
  res.json(resultado.parceira);
});
