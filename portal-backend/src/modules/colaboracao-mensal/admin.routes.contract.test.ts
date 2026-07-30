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

async function criarParceiraAtivaHttp(cookie: string, sufixo: string) {
  const criada = await request(app)
    .post("/api/admin/parceiras")
    .set("Cookie", cookie)
    .send({
      chave: `COLAB-HTTP-${sufixo}-${randomUUID()}`,
      nome: "Parceira Colaboração",
      email: `colab-http-${sufixo}-${randomUUID()}@dodo.dev`,
      condicaoComercial,
    });
  await request(app)
    .patch(`/api/admin/parceiras/${criada.body.id}/status`)
    .set("Cookie", cookie)
    .send({ status: "ATIVA" });
  return criada.body.id as string;
}

/**
 * Teste de contrato HTTP: shape de request/response de colaboracao-mensal/admin.routes.ts
 * (ADR-016, Etapa 4). Regra de negócio (idempotência, snapshot, vínculo) já coberta por
 * colaboracaoMensal.service.test.ts — aqui só o contrato HTTP em si.
 */
describe("Contrato HTTP — /api/admin/colaboracoes-mensais", () => {
  const cookieAdmin = cookieDeAdministrador();
  const cookieNaoAdmin = cookieDeSessao({ papelAtor: "INFLUENCIADORA" });

  it("POST /compilar sem sessão (401) e sem papel Administrador (403)", async () => {
    const semSessao = await request(app).post("/api/admin/colaboracoes-mensais/compilar").send({ mesReferencia: "2032-01" });
    expect(semSessao.status).toBe(401);

    const semPermissao = await request(app)
      .post("/api/admin/colaboracoes-mensais/compilar")
      .set("Cookie", cookieNaoAdmin)
      .send({ mesReferencia: "2032-01" });
    expect(semPermissao.status).toBe(403);
  });

  it("POST /compilar valida corpo: mesReferencia ausente (400) e fora do formato AAAA-MM (400)", async () => {
    const semCampo = await request(app)
      .post("/api/admin/colaboracoes-mensais/compilar")
      .set("Cookie", cookieAdmin)
      .send({});
    expect(semCampo.status).toBe(400);
    expect(semCampo.body.error).toMatch(/mesReferencia/);

    const formatoInvalido = await request(app)
      .post("/api/admin/colaboracoes-mensais/compilar")
      .set("Cookie", cookieAdmin)
      .send({ mesReferencia: "2032-13" });
    expect(formatoInvalido.status).toBe(400);
  });

  it("POST /compilar (200) cria Colaboração Mensal para Parceira ATIVA; GET single reflete o snapshot", async () => {
    const parceiraId = await criarParceiraAtivaHttp(cookieAdmin, "1");

    const compilacao = await request(app)
      .post("/api/admin/colaboracoes-mensais/compilar")
      .set("Cookie", cookieAdmin)
      .send({ mesReferencia: "2032-02" });

    expect(compilacao.status).toBe(200);
    expect(compilacao.body.colaboracoesCriadas).toBeGreaterThanOrEqual(1);

    const busca = await request(app)
      .get(`/api/admin/colaboracoes-mensais/${parceiraId}/2032-02`)
      .set("Cookie", cookieAdmin);
    expect(busca.status).toBe(200);
    expect(busca.body.status).toBe("COMPILADA");
    expect(busca.body.condicaoComercial).toEqual(condicaoComercial);
  });

  it("POST /compilar é idempotente via HTTP: segunda chamada não sobrescreve o snapshot", async () => {
    const parceiraId = await criarParceiraAtivaHttp(cookieAdmin, "2");

    await request(app)
      .post("/api/admin/colaboracoes-mensais/compilar")
      .set("Cookie", cookieAdmin)
      .send({ mesReferencia: "2032-03" });
    const primeiraBusca = await request(app)
      .get(`/api/admin/colaboracoes-mensais/${parceiraId}/2032-03`)
      .set("Cookie", cookieAdmin);

    const segundaCompilacao = await request(app)
      .post("/api/admin/colaboracoes-mensais/compilar")
      .set("Cookie", cookieAdmin)
      .send({ mesReferencia: "2032-03" });
    const segundaBusca = await request(app)
      .get(`/api/admin/colaboracoes-mensais/${parceiraId}/2032-03`)
      .set("Cookie", cookieAdmin);

    expect(segundaCompilacao.status).toBe(200);
    expect(segundaCompilacao.body.colaboracoesJaExistentes).toBeGreaterThanOrEqual(1);
    expect(segundaBusca.body).toEqual(primeiraBusca.body);
  });

  it("GET /:parceiraId/:mesReferencia retorna 404 para combinação inexistente", async () => {
    const resposta = await request(app)
      .get("/api/admin/colaboracoes-mensais/parceira-inexistente/2032-04")
      .set("Cookie", cookieAdmin);
    expect(resposta.status).toBe(404);
  });

  it("GET / exige parceiraId (400) e lista as Colaborações da Parceira quando informado (200)", async () => {
    const semQuery = await request(app).get("/api/admin/colaboracoes-mensais").set("Cookie", cookieAdmin);
    expect(semQuery.status).toBe(400);

    const parceiraId = await criarParceiraAtivaHttp(cookieAdmin, "3");
    await request(app)
      .post("/api/admin/colaboracoes-mensais/compilar")
      .set("Cookie", cookieAdmin)
      .send({ mesReferencia: "2032-05" });

    const lista = await request(app)
      .get(`/api/admin/colaboracoes-mensais?parceiraId=${parceiraId}`)
      .set("Cookie", cookieAdmin);
    expect(lista.status).toBe(200);
    expect(lista.body.itens.map((item: { mesReferencia: string }) => item.mesReferencia)).toContain("2032-05");
  });
});
