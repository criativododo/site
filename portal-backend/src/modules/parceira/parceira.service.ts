import { randomUUID } from "node:crypto";
import { parceiraRepositorio } from "./parceira.repository.js";
import type { CondicaoComercial, Parceira } from "./parceira.types.js";

export interface DadosCadastroParceira {
  chave: string;
  nome: string;
  email: string;
  cnpj: string;
  pix: string;
  condicaoComercial: CondicaoComercial;
}

/** RN-01 (SPEC-001/SPEC-002): toda Parceira nasce `INATIVA` — ativação é decisão manual. */
export async function cadastrarParceira(dados: DadosCadastroParceira): Promise<Parceira> {
  const parceira: Parceira = {
    id: randomUUID(),
    ...dados,
    status: "INATIVA",
    dataCriacao: new Date().toISOString(),
  };
  return parceiraRepositorio.criar(parceira);
}

export async function listarParceiras(): Promise<Parceira[]> {
  return parceiraRepositorio.listarTodas();
}

export async function buscarParceira(id: string): Promise<Parceira | null> {
  return parceiraRepositorio.buscarPorId(id);
}

export type CamposEditaveisParceira = Pick<Parceira, "nome" | "email" | "cnpj" | "pix" | "condicaoComercial">;

export type ResultadoEdicaoParceira = { ok: true; parceira: Parceira } | { ok: false; motivo: "NAO_ENCONTRADA" };

/** UC-002.02: edição da Condição Comercial e dos dados cadastrais (GP-01 se inexistente). */
export async function editarParceira(
  id: string,
  campos: Partial<CamposEditaveisParceira>,
): Promise<ResultadoEdicaoParceira> {
  const existente = await parceiraRepositorio.buscarPorId(id);
  if (!existente) {
    return { ok: false, motivo: "NAO_ENCONTRADA" };
  }

  const atualizada = await parceiraRepositorio.atualizar({ ...existente, ...campos });
  return { ok: true, parceira: atualizada };
}

/** UC-002.01 (RN-11/INV-02): alternar vínculo Ativa/Inativa nunca exclui o registro. */
export async function alterarStatusParceira(
  id: string,
  status: "ATIVA" | "INATIVA",
): Promise<ResultadoEdicaoParceira> {
  const existente = await parceiraRepositorio.buscarPorId(id);
  if (!existente) {
    return { ok: false, motivo: "NAO_ENCONTRADA" };
  }

  const atualizada = await parceiraRepositorio.atualizar({ ...existente, status });
  return { ok: true, parceira: atualizada };
}
