import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../app.js";
import { cookieDeAdministrador, cookieDeSessao } from "../test-utils/sessaoDeTeste.js";

/**
 * Teste de contrato HTTP (dívida P1, docs/handoff/PROJECT_STATUS.md #2): garante que a
 * cadeia `requireAuth → requireContaAtiva → requireAdmin` de api.routes.ts realmente recusa
 * requisição sem sessão e sessão sem papel Administrador, para as rotas administrativas.
 * Não testa regra de negócio de cada módulo (isso é dos `*.service.test.ts`) — só o contrato
 * HTTP (status code + shape de erro) na borda da API.
 */
describe("Contrato HTTP — borda de autenticação/autorização (api.routes.ts)", () => {
  it("recusa acesso a rota administrativa sem cookie de sessão (401)", async () => {
    const resposta = await request(app).get("/api/admin/parceiras");
    expect(resposta.status).toBe(401);
    expect(resposta.body).toEqual({ error: expect.any(String) });
  });

  it("recusa acesso a rota administrativa para sessão INFLUENCIADORA (403)", async () => {
    const cookie = cookieDeSessao({ papelAtor: "INFLUENCIADORA", parceiraId: "parceira-x" });
    const resposta = await request(app).get("/api/admin/parceiras").set("Cookie", cookie);
    expect(resposta.status).toBe(403);
    expect(resposta.body).toEqual({ error: expect.any(String) });
  });

  it("recusa qualquer rota /api para conta não ACTIVE (403)", async () => {
    const cookie = cookieDeSessao({ papelAtor: "ADMINISTRADOR", estadoConta: "PENDING" });
    const resposta = await request(app).get("/api/admin/parceiras").set("Cookie", cookie);
    expect(resposta.status).toBe(403);
  });

  it("aceita Administrador ACTIVE em rota administrativa (200)", async () => {
    const resposta = await request(app).get("/api/admin/parceiras").set("Cookie", cookieDeAdministrador());
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ itens: expect.any(Array) });
  });

  it("rota inexistente sempre responde JSON 404 (nunca HTML)", async () => {
    const resposta = await request(app).get("/api/rota-que-nao-existe").set("Cookie", cookieDeAdministrador());
    expect(resposta.status).toBe(404);
    expect(resposta.headers["content-type"]).toMatch(/json/);
  });
});
