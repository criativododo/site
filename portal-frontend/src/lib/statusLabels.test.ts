import { describe, expect, it } from "vitest";
import {
	ROTULOS_ESTADO_ENTREGA,
	ROTULOS_ESTADO_OBRIGACAO,
	ROTULOS_FORMATO_ENTREGA,
	ROTULOS_STATUS_DOCUMENTO,
	ROTULOS_STATUS_PARCEIRA,
	ROTULOS_TIPO_DOCUMENTO,
	ROTULOS_TIPO_OBRIGACAO,
	rotuloEstadoEntrega,
	rotuloEstadoObrigacao,
	rotuloFormatoEntrega,
	rotuloStatusDocumento,
	rotuloStatusParceira,
	rotuloTipoDocumento,
	rotuloTipoObrigacao,
} from "./statusLabels";

describe("rotuloFormatoEntrega", () => {
	it("traduz todos os formatos conhecidos", () => {
		expect(rotuloFormatoEntrega("Reel")).toBe("reel");
		expect(rotuloFormatoEntrega("Carrossel")).toBe("carrossel");
		expect(rotuloFormatoEntrega("Stories1")).toBe("stories 1");
		expect(rotuloFormatoEntrega("Stories2")).toBe("stories 2");
	});

	it("cai no valor bruto para formato desconhecido (fallback, sem lançar erro)", () => {
		expect(rotuloFormatoEntrega("FormatoInexistente")).toBe("FormatoInexistente");
	});
});

describe("rotuloEstadoEntrega", () => {
	it("traduz todos os estados conhecidos", () => {
		expect(rotuloEstadoEntrega("AGUARDANDO_MATERIAL")).toBe("aguardando material");
		expect(rotuloEstadoEntrega("EM_REVISAO")).toBe("em revisão");
		expect(rotuloEstadoEntrega("APROVADO")).toBe("aprovado");
		expect(rotuloEstadoEntrega("PUBLICADO")).toBe("publicado");
	});

	it("cai no valor bruto para estado desconhecido", () => {
		// @ts-expect-error valor fora do union, simulando drift backend/frontend
		expect(rotuloEstadoEntrega("ESTADO_INEXISTENTE")).toBe("ESTADO_INEXISTENTE");
	});
});

describe("rotuloEstadoObrigacao", () => {
	it("traduz todos os estados conhecidos", () => {
		expect(rotuloEstadoObrigacao("EM_ABERTO")).toBe("em aberto");
		expect(rotuloEstadoObrigacao("APROVADO")).toBe("aprovado");
		expect(rotuloEstadoObrigacao("PAGO")).toBe("pago");
	});

	it("cai no valor bruto para estado desconhecido", () => {
		// @ts-expect-error valor fora do union, simulando drift backend/frontend
		expect(rotuloEstadoObrigacao("ESTADO_INEXISTENTE")).toBe("ESTADO_INEXISTENTE");
	});
});

describe("rotuloTipoObrigacao", () => {
	it("traduz todos os tipos conhecidos", () => {
		expect(rotuloTipoObrigacao("MENSAL")).toBe("mensal");
		expect(rotuloTipoObrigacao("AVULSO")).toBe("avulso");
	});
});

describe("rotuloTipoDocumento", () => {
	it("traduz todos os tipos conhecidos", () => {
		expect(rotuloTipoDocumento("CONTRATO")).toBe("contrato");
		expect(rotuloTipoDocumento("ADITIVO")).toBe("aditivo");
		expect(rotuloTipoDocumento("DISTRATO")).toBe("distrato");
		expect(rotuloTipoDocumento("PROPOSTA")).toBe("proposta");
		expect(rotuloTipoDocumento("RECIBO")).toBe("recibo");
		expect(rotuloTipoDocumento("DECLARACAO")).toBe("declaração");
	});
});

describe("rotuloStatusDocumento", () => {
	it("traduz todos os status conhecidos", () => {
		expect(rotuloStatusDocumento("NAO_GERADO")).toBe("não gerado");
		expect(rotuloStatusDocumento("GERADO")).toBe("gerado");
		expect(rotuloStatusDocumento("BAIXADO")).toBe("baixado");
		expect(rotuloStatusDocumento("ENVIADO")).toBe("enviado");
		expect(rotuloStatusDocumento("VISUALIZADO")).toBe("visualizado");
		expect(rotuloStatusDocumento("ASSINADO")).toBe("assinado");
		expect(rotuloStatusDocumento("FINALIZADO")).toBe("finalizado");
		expect(rotuloStatusDocumento("ARQUIVADO")).toBe("arquivado");
	});
});

describe("rotuloStatusParceira", () => {
	it("traduz todos os status conhecidos", () => {
		expect(rotuloStatusParceira("ATIVA")).toBe("ativa");
		expect(rotuloStatusParceira("INATIVA")).toBe("inativa");
	});
});

describe("consistência com os Records exportados", () => {
	it("toda chave de ROTULOS_FORMATO_ENTREGA é resolvida por rotuloFormatoEntrega", () => {
		for (const [chave, rotulo] of Object.entries(ROTULOS_FORMATO_ENTREGA)) {
			expect(rotuloFormatoEntrega(chave)).toBe(rotulo);
		}
	});

	it("toda chave de ROTULOS_ESTADO_ENTREGA é resolvida por rotuloEstadoEntrega", () => {
		for (const [chave, rotulo] of Object.entries(ROTULOS_ESTADO_ENTREGA)) {
			expect(rotuloEstadoEntrega(chave as keyof typeof ROTULOS_ESTADO_ENTREGA)).toBe(rotulo);
		}
	});

	it("toda chave de ROTULOS_ESTADO_OBRIGACAO é resolvida por rotuloEstadoObrigacao", () => {
		for (const [chave, rotulo] of Object.entries(ROTULOS_ESTADO_OBRIGACAO)) {
			expect(rotuloEstadoObrigacao(chave as keyof typeof ROTULOS_ESTADO_OBRIGACAO)).toBe(rotulo);
		}
	});

	it("toda chave de ROTULOS_TIPO_OBRIGACAO é resolvida por rotuloTipoObrigacao", () => {
		for (const [chave, rotulo] of Object.entries(ROTULOS_TIPO_OBRIGACAO)) {
			expect(rotuloTipoObrigacao(chave as keyof typeof ROTULOS_TIPO_OBRIGACAO)).toBe(rotulo);
		}
	});

	it("toda chave de ROTULOS_TIPO_DOCUMENTO é resolvida por rotuloTipoDocumento", () => {
		for (const [chave, rotulo] of Object.entries(ROTULOS_TIPO_DOCUMENTO)) {
			expect(rotuloTipoDocumento(chave as keyof typeof ROTULOS_TIPO_DOCUMENTO)).toBe(rotulo);
		}
	});

	it("toda chave de ROTULOS_STATUS_DOCUMENTO é resolvida por rotuloStatusDocumento", () => {
		for (const [chave, rotulo] of Object.entries(ROTULOS_STATUS_DOCUMENTO)) {
			expect(rotuloStatusDocumento(chave as keyof typeof ROTULOS_STATUS_DOCUMENTO)).toBe(rotulo);
		}
	});

	it("toda chave de ROTULOS_STATUS_PARCEIRA é resolvida por rotuloStatusParceira", () => {
		for (const [chave, rotulo] of Object.entries(ROTULOS_STATUS_PARCEIRA)) {
			expect(rotuloStatusParceira(chave as keyof typeof ROTULOS_STATUS_PARCEIRA)).toBe(rotulo);
		}
	});
});
