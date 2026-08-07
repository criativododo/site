import { describe, expect, it } from "vitest";
import { formatarData } from "./formatters";

describe("formatarData", () => {
	it("não desvia um dia para data pura AAAA-MM-DD sob fuso negativo (America/Sao_Paulo, UTC-3)", () => {
		// Bug de hardening (2026-08-06): `new Date("2026-08-06")` nasce em meia-noite UTC;
		// formatado no fuso local (UTC-3) sem tratamento, virava "05/08/2026" — um dia antes do
		// valor real que o backend enviou. Este teste roda sob TZ=America/Sao_Paulo
		// (vitest.config.ts não fixa TZ; o ambiente de CI/dev deste projeto já usa esse fuso —
		// ver `Intl.DateTimeFormat().resolvedOptions().timeZone` no ambiente local).
		expect(formatarData("2026-08-06")).toBe("06/08/2026");
		expect(formatarData("2026-01-01")).toBe("01/01/2026");
		expect(formatarData("2026-12-31")).toBe("31/12/2026");
	});

	it("mantém o comportamento existente para timestamp ISO completo (dataCriacao/geradoEm/criadoEm)", () => {
		// Diferente da data pura: aqui o fuso local do navegador É o comportamento correto (data-
		// calendário local do instante real em que o evento ocorreu) — não deve usar UTC.
		expect(formatarData("2026-08-06T23:30:00.000Z")).toBe(
			new Date("2026-08-06T23:30:00.000Z").toLocaleDateString("pt-BR"),
		);
		expect(formatarData("2026-08-06T02:00:00.000Z")).toBe(
			new Date("2026-08-06T02:00:00.000Z").toLocaleDateString("pt-BR"),
		);
	});
});
