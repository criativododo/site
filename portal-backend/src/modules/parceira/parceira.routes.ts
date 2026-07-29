import { Router } from "express";
import { mensagemDeCamposObrigatoriosAusentes } from "../../shared/validacaoCampos.js";
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
    res.status(404).json({ error: "Parceira não encontrada." });
    return;
  }
  res.json(resultado.parceira);
});

/** UC-002.01: alterar vínculo Ativa/Inativa (nunca exclui o registro). */
parceiraRoutes.patch("/:id/status", async (req, res) => {
  const { status } = req.body ?? {};
  if (status !== "ATIVA" && status !== "INATIVA") {
    res.status(400).json({ error: "status deve ser 'ATIVA' ou 'INATIVA'." });
    return;
  }

  const resultado = await alterarStatusParceira(req.params.id, status);
  if (!resultado.ok) {
    res.status(404).json({ error: "Parceira não encontrada." });
    return;
  }
  res.json(resultado.parceira);
});
