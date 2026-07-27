import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import multer, { MulterError } from "multer";
import { parceiraDaSessao } from "../../middleware/isolamento.js";
import { enviarMaterial, listarPendencias, obterBriefingDaEntrega } from "./conteudo.service.js";

export const conteudoRoutes = Router();

/**
 * Limite de tamanho e tipo — não é regra de negócio, é proteção de infraestrutura: todo
 * material de Reel/Carrossel/Stories é imagem ou vídeo, nunca executável/script.
 */
const TAMANHO_MAXIMO_MATERIAL_BYTES = 20 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_MATERIAL_BYTES },
  fileFilter(_req, file, callback) {
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
      callback(new MulterError("LIMIT_UNEXPECTED_FILE", "arquivo"));
      return;
    }
    callback(null, true);
  },
});

/**
 * UC-027.01 · Ver pendências. Monta sob apiRoutes (routes/api.routes.ts), portanto já passou
 * por requireAuth + requireContaAtiva + bloquearParceiraIdDeCliente + auditoria — a Parceira
 * só pode ser a da própria sessão (RN-01).
 */
conteudoRoutes.get("/pendencias", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const resultado = await listarPendencias(parceiraId);
  res.json(resultado);
});

/** UC-027.02 · Ler briefing do item. PC-02: id de outra Parceira → 404 genérico (não revela existência). */
conteudoRoutes.get("/entregas/:entregaId/briefing", async (req, res) => {
  const parceiraId = parceiraDaSessao(req);
  const resultado = await obterBriefingDaEntrega(parceiraId, req.params.entregaId);

  if (!resultado) {
    res.status(404).json({ error: "Entrega não encontrada." });
    return;
  }

  res.json(resultado);
});

/**
 * UC-027.03 · Enviar material. PC-03: se a gravação falhar, `conteudo.service.ts` nunca
 * chega a transicionar o estado — este handler só reflete o que o service decidiu.
 */
conteudoRoutes.post("/entregas/:entregaId/material", upload.single("arquivo"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Nenhum arquivo enviado (campo esperado: 'arquivo')." });
    return;
  }

  const parceiraId = parceiraDaSessao(req);
  const resultado = await enviarMaterial(parceiraId, String(req.params.entregaId), {
    buffer: req.file.buffer,
    nomeOriginal: req.file.originalname,
  });

  if (!resultado.ok) {
    if (resultado.motivo === "NAO_ENCONTRADA") {
      res.status(404).json({ error: "Entrega não encontrada." });
      return;
    }
    res.status(409).json({ error: "Esta Entrega não está aguardando material." });
    return;
  }

  res.json({ entrega: resultado.entrega });
});

/** Erros do multer (ex.: arquivo acima do limite) chegam aqui em vez do handler default HTML. */
conteudoRoutes.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(415).json({ error: "Tipo de arquivo não suportado — envie imagem ou vídeo." });
      return;
    }
    res.status(413).json({ error: "Arquivo excede o tamanho máximo permitido (20MB)." });
    return;
  }
  next(err);
});
