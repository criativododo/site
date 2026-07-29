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

async function criarParceiraAtivaHttp(cookie: string) {
  const criada = await request(app)
    .post("/api/admin/parceiras")
    .set("Cookie", cookie)
    .send({
      chave: `CONTRATO-ENTREGA-${randomUUID()}`,
      nome: "Parceira Entrega",
      email: `contrato-entrega-${randomUUID()}@dodo.dev`,
      condicaoComercial,
    });
  await request(app)
    .patch(`/api/admin/parceiras/${criada.body.id}/status`)
    .set("Cookie", cookie)
    .send({ status: "ATIVA" });
  return criada.body.id as string;
}

/**
 * Teste de contrato HTTP: cobre o ciclo completo de Entrega pela API (criação → aprovar →
 * publicar), incluindo a rota `/publicar` desta mesma sessão (Fase 1 do Plano Mestre). Regra
 * de negócio já coberta por conteudo.service.test.ts — aqui valida-se status code e shape.
 */
describe("Contrato HTTP — /api/admin/entregas", () => {
  const cookie = cookieDeAdministrador();

  it("POST rejeita Parceira inexistente (404) e Parceira inativa (400)", async () => {
    const inexistente = await request(app)
      .post("/api/admin/entregas")
      .set("Cookie", cookie)
      .send({ parceiraId: "id-que-nao-existe", mesReferencia: "2026-07", formato: "Reel", dataEntrega: "2026-07-10" });
    expect(inexistente.status).toBe(404);

    const inativaCriada = await request(app)
      .post("/api/admin/parceiras")
      .set("Cookie", cookie)
      .send({
        chave: `CONTRATO-INATIVA-${randomUUID()}`,
        nome: "Parceira Inativa",
        email: `contrato-inativa-${randomUUID()}@dodo.dev`,
        condicaoComercial,
      });
    const comParceiraInativa = await request(app)
      .post("/api/admin/entregas")
      .set("Cookie", cookie)
      .send({
        parceiraId: inativaCriada.body.id,
        mesReferencia: "2026-07",
        formato: "Reel",
        dataEntrega: "2026-07-10",
      });
    expect(comParceiraInativa.status).toBe(400);
  });

  it("ciclo completo: cria (AGUARDANDO_MATERIAL) → aprovar rejeitado (409) → força EM_REVISAO → aprovar → publicar", async () => {
    const parceiraId = await criarParceiraAtivaHttp(cookie);

    const criada = await request(app)
      .post("/api/admin/entregas")
      .set("Cookie", cookie)
      .send({ parceiraId, mesReferencia: "2026-07", formato: "Reel", dataEntrega: "2026-07-10" });
    expect(criada.status).toBe(201);
    expect(criada.body.estado).toBe("AGUARDANDO_MATERIAL");
    expect(criada.body.dataArquivamento).toBeNull();

    const aprovarCedoDemais = await request(app)
      .patch(`/api/admin/entregas/${criada.body.id}/aprovar`)
      .set("Cookie", cookie);
    expect(aprovarCedoDemais.status).toBe(409);

    const publicarCedoDemais = await request(app)
      .patch(`/api/admin/entregas/${criada.body.id}/publicar`)
      .set("Cookie", cookie);
    expect(publicarCedoDemais.status).toBe(409);

    // UC-027.03 (Portal da Parceira): envio de material transiciona AGUARDANDO_MATERIAL → EM_REVISAO.
    const cookieParceira = cookieDeSessao({ papelAtor: "INFLUENCIADORA", parceiraId });
    const upload = await request(app)
      .post(`/api/portal/entregas/${criada.body.id}/material`)
      .set("Cookie", cookieParceira)
      .attach("arquivo", Buffer.from("conteudo-fake-de-teste"), {
        filename: "reel.mp4",
        contentType: "video/mp4",
      });
    expect(upload.status).toBe(200);
    expect(upload.body.entrega.estado).toBe("EM_REVISAO");

    const aprovada = await request(app)
      .patch(`/api/admin/entregas/${criada.body.id}/aprovar`)
      .set("Cookie", cookie);
    expect(aprovada.status).toBe(200);
    expect(aprovada.body.estado).toBe("APROVADO");

    const publicada = await request(app)
      .patch(`/api/admin/entregas/${criada.body.id}/publicar`)
      .set("Cookie", cookie);
    expect(publicada.status).toBe(200);
    expect(publicada.body.estado).toBe("PUBLICADO");
    expect(publicada.body.dataArquivamento).toEqual(expect.any(String));

    const republicar = await request(app)
      .patch(`/api/admin/entregas/${criada.body.id}/publicar`)
      .set("Cookie", cookie);
    expect(republicar.status).toBe(409);
  });

  it("publicar rejeita id inexistente (404)", async () => {
    const resposta = await request(app)
      .patch("/api/admin/entregas/id-inexistente/publicar")
      .set("Cookie", cookie);
    expect(resposta.status).toBe(404);
  });
});
