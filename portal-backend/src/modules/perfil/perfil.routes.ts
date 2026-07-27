import { Router } from "express";
import { parceiraDaSessao } from "../../middleware/isolamento.js";
import { atualizarContato, obterPerfil } from "./perfil.service.js";

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
    if (resultado.motivo === "PERFIL_NAO_ENCONTRADO") {
      res.status(404).json({ error: "Perfil não encontrado." });
      return;
    }
    res.status(400).json({ error: `Campo não permitido: '${resultado.campo}'.` });
    return;
  }

  res.json(resultado.perfil);
});
