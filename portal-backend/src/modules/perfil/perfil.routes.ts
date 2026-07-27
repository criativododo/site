import { Router } from "express";
import { parceiraDaSessao } from "../../middleware/isolamento.js";
import { obterPerfil } from "./perfil.service.js";

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
