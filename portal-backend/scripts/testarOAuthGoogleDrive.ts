import { obterAccessTokenDrive, ErroOAuthGoogleDrive } from "../src/shared/googleDrive/googleDriveClient.js";

/**
 * Script de validação do OAuth do Google Drive (ADR-017) — só prova conectividade e
 * permissão de escrita sob o escopo `drive.file`. Não é parte da Storage em si (sem rota,
 * sem persistência de domínio) e não fica registrado em `npm run` como fluxo permanente do
 * produto — equivalente à etapa "Validar" do fluxo obrigatório (auditoria → plano →
 * execução → validação → commit).
 */

const DRIVE_API = "https://www.googleapis.com/drive/v3";

async function chamarDrive(accessToken: string, caminho: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${DRIVE_API}${caminho}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function main() {
  console.log("1) Trocando refresh token por access token...");
  const accessToken = await obterAccessTokenDrive();
  console.log("   OK — access token obtido.");

  console.log("2) Consultando identidade/quota da conta Drive (about)...");
  const respostaAbout = await chamarDrive(accessToken, "/about?fields=user,storageQuota");
  if (!respostaAbout.ok) {
    throw new Error(`Falha em /about: HTTP ${respostaAbout.status} — ${await respostaAbout.text()}`);
  }
  const about = await respostaAbout.json();
  console.log(`   OK — conta: ${about.user?.emailAddress ?? "(sem e-mail retornado)"}`);

  console.log("3) Criando pasta temporária de teste...");
  const respostaCriar = await chamarDrive(accessToken, "/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `teste-oauth-adr-017-${Date.now()}`,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  if (!respostaCriar.ok) {
    throw new Error(`Falha ao criar pasta: HTTP ${respostaCriar.status} — ${await respostaCriar.text()}`);
  }
  const pasta = await respostaCriar.json();
  console.log(`   OK — pasta criada (id: ${pasta.id}).`);

  console.log("4) Removendo pasta temporária...");
  const respostaRemover = await chamarDrive(accessToken, `/files/${pasta.id}`, { method: "DELETE" });
  if (!respostaRemover.ok && respostaRemover.status !== 204) {
    throw new Error(`Falha ao remover pasta de teste: HTTP ${respostaRemover.status} — ${await respostaRemover.text()}`);
  }
  console.log("   OK — pasta de teste removida, sem resíduo na conta Drive.");

  console.log("\nOAuth do Google Drive validado: leitura e escrita sob drive.file funcionando.");
}

main().catch((erro) => {
  if (erro instanceof ErroOAuthGoogleDrive) {
    console.error(`\nFALHA OAuth: ${erro.message}`);
  } else {
    console.error(`\nFALHA: ${erro instanceof Error ? erro.message : String(erro)}`);
  }
  process.exitCode = 1;
});
