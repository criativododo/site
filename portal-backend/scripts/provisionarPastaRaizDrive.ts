import { env } from "../src/config/env.js";
import { ProvedorDeArmazenamentoGoogleDrive } from "../src/shared/storage/googleDrive/provedorGoogleDrive.js";

/**
 * Provisionamento único da pasta raiz do Portal no Google Drive (Fase 4, Gate 3,
 * `docs/TDD_STORAGE_GOOGLE_DRIVE.md` §3.3) — só a raiz precisa disso; toda pasta abaixo dela
 * (`Parceiras`, `{parceiraId}`, `{mesReferencia}`) é resolvida/criada sob demanda pelo
 * próprio `ServicoDeArmazenamento` (§3.2). Análogo a `testarOAuthGoogleDrive.ts`: não roda em
 * tempo de request, não fica registrado como fluxo permanente do produto.
 */

const NOME_PASTA_RAIZ = "Portal DODÔ — Storage";

async function main() {
  const provedor = new ProvedorDeArmazenamentoGoogleDrive();
  const idConfigurado = env.storage.googleDrive.pastaRaizId;

  if (idConfigurado) {
    console.log(`GOOGLE_DRIVE_ROOT_FOLDER_ID já configurado (${idConfigurado}). Confirmando que a pasta existe...`);
    const pasta = await provedor.obterMetadados(idConfigurado);
    console.log(`   OK — pasta "${pasta.nome}" (id: ${pasta.id}) encontrada. Nada a fazer.`);
    return;
  }

  console.log("GOOGLE_DRIVE_ROOT_FOLDER_ID ainda não configurado. Criando pasta raiz...");
  const pasta = await provedor.criarPasta(NOME_PASTA_RAIZ, null);
  console.log(`   OK — pasta raiz criada (id: ${pasta.id}).`);
  console.log("\nAdicione ao .env (nunca commitar):");
  console.log(`GOOGLE_DRIVE_ROOT_FOLDER_ID=${pasta.id}`);
}

main().catch((erro) => {
  console.error(`\nFALHA: ${erro instanceof Error ? erro.message : String(erro)}`);
  process.exitCode = 1;
});
