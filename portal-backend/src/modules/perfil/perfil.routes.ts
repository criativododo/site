import { Router } from "express";
import { parceiraDaSessao } from "../../middleware/isolamento.js";
import { atualizarContato, atualizarEndereco, obterPerfil } from "./perfil.service.js";

export const perfilRoutes = Router();

/** UC-032.01 · Ver perfil. */
perfilRoutes.get("/", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const perfil = await obterPerfil(parceiraId);

  if (!perfil) {
    res.status(404).json({ error: "Perfil não encontrado." });
    return;
  }

  res.json(perfil);
});

/** UC-032.02 · Editar PIX/e-mail. RN-04/CB-02: campo comercial/não permitido → 400. */
perfilRoutes.patch("/contato", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const resultado = await atualizarContato(parceiraId, req.body ?? {});

  if (!resultado.ok) {
    res.status(400).json({ error: `Campo não permitido: '${resultado.campo}'.` });
    return;
  }

  res.json(resultado.perfil);
});

/** UC-032.03 · Editar endereço por CEP. RN-02: falha do CEP não impede salvar (degradável). */
perfilRoutes.patch("/endereco", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const { cep, numero, complemento } = req.body ?? {};

  const resultado = await atualizarEndereco(parceiraId, {
    cep: typeof cep === "string" ? cep : "",
    numero: typeof numero === "string" ? numero : "",
    complemento: typeof complemento === "string" ? complemento : "",
  });

  res.json({ perfil: resultado.perfil, cepResolvido: resultado.cepResolvido });
});
