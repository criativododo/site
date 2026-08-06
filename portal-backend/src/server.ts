import { app } from "./app.js";
import { env } from "./config/env.js";
import { logErro } from "./shared/log.js";

/**
 * Handlers de nível de processo (sprint de observabilidade) — cobrem a única classe de falha
 * que `middleware/errorHandler.ts` não alcança: exceção/rejeição fora do ciclo de uma
 * requisição HTTP (timer, listener de baixo nível, etc.), que hoje derruba o processo sem
 * nenhum log.
 *
 * Política adotada: registrar tudo o que for útil para diagnóstico e então encerrar o
 * processo (`process.exit(1)`) — nunca tentar continuar rodando. A documentação do próprio
 * Node.js recomenda não retomar a execução normal após um `uncaughtException`: o processo fica
 * em estado indefinido (pilha parcialmente desenrolada, closures/referências possivelmente
 * inconsistentes), e continuar arrisca corrupção silenciosa de dado ou vazamento de recurso —
 * estritamente pior do que um restart limpo. Este backend já roda sob PM2 com
 * `autorestart: true` e uma única instância em modo fork (`ecosystem.config.cjs`): um
 * `exit(1)` é exatamente o sinal que o PM2 espera para reiniciar automaticamente um processo
 * saudável, sem intervenção manual.
 *
 * O `setImmediate` antes do `exit` dá uma volta do event loop para o `console.error` (que o
 * PM2 encaminha por pipe, potencialmente assíncrono em Linux) esvaziar o buffer antes do
 * processo morrer — sem isso a última linha de log, exatamente a mais importante, corre risco
 * de ser truncada.
 *
 * Não implementado nesta sprint (deliberadamente fora de escopo): shutdown gracioso
 * (`server.close()` esperando requisições em voo terminarem antes do `exit`). É uma evolução
 * legítima, mas exige coordenar o drain de conexões vivas sob um único fork do PM2 sem testes
 * dedicados — risco de introduzir um novo modo de falha (processo pendurado) que essa sprint,
 * focada em visibilidade e não em mudança de comportamento, não deve correr.
 */
function encerrarAposFalhaFatal(contexto: string, motivo: unknown): void {
  const erro = motivo instanceof Error ? motivo : new Error(String(motivo));
  logErro(contexto, {
    timestamp: new Date().toISOString(),
    versao: env.versao,
    mensagem: erro.message,
  });
  if (erro.stack) {
    console.error(erro.stack);
  }
  process.exitCode = 1;
  setImmediate(() => process.exit(1));
}

process.on("uncaughtException", (erro) => {
  encerrarAposFalhaFatal("processo-uncaught-exception", erro);
});

process.on("unhandledRejection", (motivo) => {
  encerrarAposFalhaFatal("processo-unhandled-rejection", motivo);
});

app.listen(env.port, () => {
  console.log(
    `Portal backend ouvindo em http://localhost:${env.port} versao=${env.versao}`,
  );
});
