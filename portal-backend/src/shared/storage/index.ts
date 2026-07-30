import { env } from "../../config/env.js";
import { ProvedorDeArmazenamentoGoogleDrive } from "./googleDrive/provedorGoogleDrive.js";
import { ServicoDeArmazenamentoImpl } from "./servicoDeArmazenamento.js";
import type { ProvedorDeArmazenamento } from "./provedorDeArmazenamento.js";
import type { ServicoDeArmazenamento } from "./servicoDeArmazenamento.js";
import type { ConfiguracaoDeArmazenamento } from "./tipos.js";

export function criarProvedorDeArmazenamento(tipo: ConfiguracaoDeArmazenamento["tipo"]): ProvedorDeArmazenamento {
  switch (tipo) {
    case "google-drive":
      // Sem parâmetro de credencial: reaproveita obterAccessTokenDrive() (ADR-017) por
      // import direto, não por injeção — mesmo padrão já usado hoje em googleDriveClient.ts.
      return new ProvedorDeArmazenamentoGoogleDrive();
    default:
      throw new Error(`Provedor de armazenamento não suportado: ${tipo as string}`);
  }
}

export const servicoDeArmazenamento: ServicoDeArmazenamento = new ServicoDeArmazenamentoImpl(
  criarProvedorDeArmazenamento(env.storage.tipo),
  env.storage.googleDrive.pastaRaizId,
);

export type { ServicoDeArmazenamento } from "./servicoDeArmazenamento.js";
export * from "./erros.js";
