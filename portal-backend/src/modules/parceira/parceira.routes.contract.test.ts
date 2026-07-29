import { randomUUID } from "node:crypto";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../app.js";
import { cookieDeAdministrador } from "../../test-utils/sessaoDeTeste.js";

const condicaoComercial = {
  valorMensal: 2500,
  entregaveisReel: 2,
  entregaveisCarrossel: 1,
  entregaveisStories: 4,
  prazoUsoImagemDias: 90,
};

/**
 * Teste de contrato HTTP: shape de request/response de parceira.routes.ts, não regra de
 * negócio (coberta por parceira.service.test.ts). Cobre a dívida de "mesmo bug 2x" citada em
 * docs/handoff/PROJECT_STATUS.md #2 (rota de escrita devolvendo shape diferente do GET).
 */
describe("Contrato HTTP — /api/admin/parceiras", () => {
  const cookie = cookieDeAdministrador();

  it("POST cria Parceira sempre INATIVA (RN-01), mesmo se status for enviado no corpo", async () => {
    const resposta = await request(app)
      .post("/api/admin/parceiras")
      .set("Cookie", cookie)
      .send({
        chave: `CONTRATO-${randomUUID()}`,
        nome: "Parceira Contrato",
        email: `contrato-${randomUUID()}@dodo.dev`,
        condicaoComercial,
        status: "ATIVA",
      });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual(
      expect.objectContaining({ id: expect.any(String), status: "INATIVA" }),
    );
  });

  it("POST rejeita corpo sem campos obrigatórios (400)", async () => {
    const resposta = await request(app)
      .post("/api/admin/parceiras")
      .set("Cookie", cookie)
      .send({ nome: "Sem chave nem email" });

    expect(resposta.status).toBe(400);
    expect(resposta.body).toEqual({ error: expect.any(String) });
  });

  it("GET lista inclui a Parceira recém-criada, no mesmo shape do POST", async () => {
    const criada = await request(app)
      .post("/api/admin/parceiras")
      .set("Cookie", cookie)
      .send({
        chave: `CONTRATO-LISTA-${randomUUID()}`,
        nome: "Parceira Lista",
        email: `contrato-lista-${randomUUID()}@dodo.dev`,
        condicaoComercial,
      });

    const lista = await request(app).get("/api/admin/parceiras").set("Cookie", cookie);
    expect(lista.status).toBe(200);
    expect(lista.body.itens).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: criada.body.id })]),
    );
  });

  it("PATCH /:id/status altera Ativa/Inativa e rejeita valor fora do enum (400)", async () => {
    const criada = await request(app)
      .post("/api/admin/parceiras")
      .set("Cookie", cookie)
      .send({
        chave: `CONTRATO-STATUS-${randomUUID()}`,
        nome: "Parceira Status",
        email: `contrato-status-${randomUUID()}@dodo.dev`,
        condicaoComercial,
      });

    const invalido = await request(app)
      .patch(`/api/admin/parceiras/${criada.body.id}/status`)
      .set("Cookie", cookie)
      .send({ status: "QUALQUER_COISA" });
    expect(invalido.status).toBe(400);

    const ativada = await request(app)
      .patch(`/api/admin/parceiras/${criada.body.id}/status`)
      .set("Cookie", cookie)
      .send({ status: "ATIVA" });
    expect(ativada.status).toBe(200);
    expect(ativada.body).toEqual(expect.objectContaining({ status: "ATIVA" }));
  });

  it("PATCH /:id/status para id inexistente retorna 404", async () => {
    const resposta = await request(app)
      .patch("/api/admin/parceiras/id-inexistente/status")
      .set("Cookie", cookie)
      .send({ status: "ATIVA" });
    expect(resposta.status).toBe(404);
  });
});
