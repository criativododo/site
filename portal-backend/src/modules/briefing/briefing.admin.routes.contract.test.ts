import { randomUUID } from "node:crypto";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../app.js";
import { cookieDeAdministrador, cookieDeSessao } from "../../test-utils/sessaoDeTeste.js";

const condicaoComercial = {
  valorMensal: 2500,
  entregaveisReel: 2,
  entregaveisCarrossel: 1,
  entregaveisStories: 4,
  prazoUsoImagemDias: 90,
};

async function criarEntregaDeTesteHttp(cookie: string) {
  const parceira = await request(app)
    .post("/api/admin/parceiras")
    .set("Cookie", cookie)
    .send({
      chave: `CONTRATO-BRIEFING-${randomUUID()}`,
      nome: "Parceira Briefing",
      email: `contrato-briefing-${randomUUID()}@dodo.dev`,
      condicaoComercial,
    });
  await request(app)
    .patch(`/api/admin/parceiras/${parceira.body.id}/status`)
    .set("Cookie", cookie)
    .send({ status: "ATIVA" });

  const entrega = await request(app)
    .post("/api/admin/entregas")
    .set("Cookie", cookie)
    .send({ parceiraId: parceira.body.id, mesReferencia: "2026-07", formato: "Reel", dataEntrega: "2026-07-10" });
  return entrega.body.id as string;
}

/**
 * Teste de contrato HTTP: shape de request/response de briefing.routes.ts, incluindo o campo
 * derivado `dataAprovacaoInterna` (Fase 1 do Plano Mestre) — regra de cálculo em si já coberta
 * por briefing.calculadoraAprovacao.test.ts.
 */
describe("Contrato HTTP — /api/admin/briefings", () => {
  const cookie = cookieDeAdministrador();

  it("POST cria Briefing com dataAprovacaoInterna derivada, nunca aceita valor informado no corpo", async () => {
    const entregaId = await criarEntregaDeTesteHttp(cookie);

    const criado = await request(app)
      .post("/api/admin/briefings")
      .set("Cookie", cookie)
      .send({
        entregaId,
        look: "Look 1",
        dataEntrega: "2026-07-10",
        dataPostagem: "2026-07-20",
        orientacao: "Reel de unboxing.",
        dataAprovacaoInterna: "2099-01-01", // tentativa de forçar valor arbitrário — deve ser ignorada
      });

    expect(criado.status).toBe(201);
    expect(criado.body.dataAprovacaoInterna).toBe("2026-07-13");
    expect(criado.body.entregaId).toBe(entregaId);
  });

  it("POST rejeita segundo Briefing para a mesma Entrega (409)", async () => {
    const entregaId = await criarEntregaDeTesteHttp(cookie);
    const dadosBriefing = {
      entregaId,
      look: "Look 1",
      dataEntrega: "2026-07-10",
      dataPostagem: "2026-07-20",
      orientacao: "Reel de unboxing.",
    };

    const primeiro = await request(app).post("/api/admin/briefings").set("Cookie", cookie).send(dadosBriefing);
    expect(primeiro.status).toBe(201);

    const segundo = await request(app).post("/api/admin/briefings").set("Cookie", cookie).send(dadosBriefing);
    expect(segundo.status).toBe(409);
  });

  it("PATCH recalcula dataAprovacaoInterna ao editar dataPostagem", async () => {
    const entregaId = await criarEntregaDeTesteHttp(cookie);
    const criado = await request(app)
      .post("/api/admin/briefings")
      .set("Cookie", cookie)
      .send({
        entregaId,
        look: "Look 1",
        dataEntrega: "2026-07-10",
        dataPostagem: "2026-07-20",
        orientacao: "Reel de unboxing.",
      });

    const editado = await request(app)
      .patch(`/api/admin/briefings/${criado.body.id}`)
      .set("Cookie", cookie)
      .send({ ...criado.body, dataPostagem: "2026-07-11" });

    expect(editado.status).toBe(200);
    expect(editado.body.dataAprovacaoInterna).toBe("2026-07-06");
  });

  it("DELETE permite remover Briefing enquanto a Entrega ainda está AGUARDANDO_MATERIAL (204)", async () => {
    const entregaId = await criarEntregaDeTesteHttp(cookie);
    const briefing = await request(app)
      .post("/api/admin/briefings")
      .set("Cookie", cookie)
      .send({
        entregaId,
        look: "Look 1",
        dataEntrega: "2026-07-10",
        dataPostagem: "2026-07-20",
        orientacao: "Reel de unboxing.",
      });

    const remocao = await request(app).delete(`/api/admin/briefings/${briefing.body.id}`).set("Cookie", cookie);
    expect(remocao.status).toBe(204);
  });

  it("DELETE recusa remover Briefing cuja Entrega já saiu de AGUARDANDO_MATERIAL (409)", async () => {
    const parceira = await request(app)
      .post("/api/admin/parceiras")
      .set("Cookie", cookie)
      .send({
        chave: `CONTRATO-BRIEFING-DEL-${randomUUID()}`,
        nome: "Parceira Briefing Del",
        email: `contrato-briefing-del-${randomUUID()}@dodo.dev`,
        condicaoComercial,
      });
    await request(app)
      .patch(`/api/admin/parceiras/${parceira.body.id}/status`)
      .set("Cookie", cookie)
      .send({ status: "ATIVA" });
    const entrega = await request(app)
      .post("/api/admin/entregas")
      .set("Cookie", cookie)
      .send({ parceiraId: parceira.body.id, mesReferencia: "2026-07", formato: "Reel", dataEntrega: "2026-07-10" });
    const briefing = await request(app)
      .post("/api/admin/briefings")
      .set("Cookie", cookie)
      .send({
        entregaId: entrega.body.id,
        look: "Look 1",
        dataEntrega: "2026-07-10",
        dataPostagem: "2026-07-20",
        orientacao: "Reel de unboxing.",
      });

    const cookieParceira = cookieDeSessao({ papelAtor: "INFLUENCIADORA", parceiraId: parceira.body.id });
    await request(app)
      .post(`/api/portal/entregas/${entrega.body.id}/material`)
      .set("Cookie", cookieParceira)
      .attach("arquivo", Buffer.from("conteudo-fake"), { filename: "reel.mp4", contentType: "video/mp4" });

    const remocaoRecusada = await request(app)
      .delete(`/api/admin/briefings/${briefing.body.id}`)
      .set("Cookie", cookie);
    expect(remocaoRecusada.status).toBe(409);
  });
});
