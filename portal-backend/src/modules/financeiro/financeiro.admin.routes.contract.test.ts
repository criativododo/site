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

async function criarParceiraAtivaHttp(cookie: string, sufixo: string) {
  const criada = await request(app)
    .post("/api/admin/parceiras")
    .set("Cookie", cookie)
    .send({
      chave: `CONTRATO-OBRIGACAO-${sufixo}-${randomUUID()}`,
      nome: "Parceira Obrigação",
      email: `contrato-obrigacao-${sufixo}-${randomUUID()}@dodo.dev`,
      condicaoComercial,
    });
  await request(app)
    .patch(`/api/admin/parceiras/${criada.body.id}/status`)
    .set("Cookie", cookie)
    .send({ status: "ATIVA" });
  return criada.body.id as string;
}

/**
 * Teste de contrato HTTP: shape de request/response de financeiro/admin.routes.ts. Regra de
 * gate de elegibilidade (ADR-009) já coberta por financeiro.service.test.ts.
 */
describe("Contrato HTTP — /api/admin/obrigacoes", () => {
  const cookie = cookieDeAdministrador();

  it("POST rejeita tipo fora do enum (400) e valor ausente (400)", async () => {
    const parceiraId = await criarParceiraAtivaHttp(cookie, "1");

    const semValor = await request(app)
      .post("/api/admin/obrigacoes")
      .set("Cookie", cookie)
      .send({ parceiraId, mesReferencia: "2026-07", tipo: "AVULSO" });
    expect(semValor.status).toBe(400);

    const tipoInvalido = await request(app)
      .post("/api/admin/obrigacoes")
      .set("Cookie", cookie)
      .send({ parceiraId, mesReferencia: "2026-07", valor: 500, tipo: "QUALQUER_COISA" });
    expect(tipoInvalido.status).toBe(400);
  });

  it("POST AVULSO nasce EM_ABERTO; PATCH /liberar recusado para MENSAL com Entregas pendentes (409)", async () => {
    const parceiraId = await criarParceiraAtivaHttp(cookie, "2");

    const avulsa = await request(app)
      .post("/api/admin/obrigacoes")
      .set("Cookie", cookie)
      .send({ parceiraId, mesReferencia: "2026-07", valor: 300, tipo: "AVULSO" });
    expect(avulsa.status).toBe(201);
    expect(avulsa.body.estado).toBe("EM_ABERTO");

    // Entrega pendente na mesma competência bloqueia o gate de elegibilidade (ADR-009) de uma Obrigação MENSAL.
    await request(app)
      .post("/api/admin/entregas")
      .set("Cookie", cookie)
      .send({ parceiraId, mesReferencia: "2026-07", formato: "Reel", dataEntrega: "2026-07-10" });

    const mensal = await request(app)
      .post("/api/admin/obrigacoes")
      .set("Cookie", cookie)
      .send({ parceiraId, mesReferencia: "2026-07", valor: 2500, tipo: "MENSAL" });
    expect(mensal.status).toBe(201);

    const liberarRecusado = await request(app)
      .patch(`/api/admin/obrigacoes/${mensal.body.id}/liberar`)
      .set("Cookie", cookie);
    expect(liberarRecusado.status).toBe(409);
  });

  it("ciclo AVULSO: liberar (EM_ABERTO→APROVADO) → pagar (APROVADO→PAGO, arquiva) → editar recusado (409)", async () => {
    const parceiraId = await criarParceiraAtivaHttp(cookie, "3");
    const criada = await request(app)
      .post("/api/admin/obrigacoes")
      .set("Cookie", cookie)
      .send({ parceiraId, mesReferencia: "2026-07", valor: 500, tipo: "AVULSO" });

    const liberada = await request(app)
      .patch(`/api/admin/obrigacoes/${criada.body.id}/liberar`)
      .set("Cookie", cookie);
    expect(liberada.status).toBe(200);
    expect(liberada.body.estado).toBe("APROVADO");

    const paga = await request(app).patch(`/api/admin/obrigacoes/${criada.body.id}/pagar`).set("Cookie", cookie);
    expect(paga.status).toBe(200);
    expect(paga.body.estado).toBe("PAGO");
    expect(paga.body.dataArquivamento).toEqual(expect.any(String));

    const edicaoRecusada = await request(app)
      .patch(`/api/admin/obrigacoes/${criada.body.id}`)
      .set("Cookie", cookie)
      .send({ valor: 999 });
    expect(edicaoRecusada.status).toBe(409);

    const remocaoRecusada = await request(app)
      .delete(`/api/admin/obrigacoes/${criada.body.id}`)
      .set("Cookie", cookie);
    expect(remocaoRecusada.status).toBe(409);
  });

  it("DELETE remove Obrigação ainda EM_ABERTO (204)", async () => {
    const parceiraId = await criarParceiraAtivaHttp(cookie, "4");
    const criada = await request(app)
      .post("/api/admin/obrigacoes")
      .set("Cookie", cookie)
      .send({ parceiraId, mesReferencia: "2026-07", valor: 500, tipo: "AVULSO" });

    const remocao = await request(app).delete(`/api/admin/obrigacoes/${criada.body.id}`).set("Cookie", cookie);
    expect(remocao.status).toBe(204);
  });
});
