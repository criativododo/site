import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // dist/ é build de produção (sem .test.ts, ver tsconfig.json exclude) — nunca deve ser
    // fonte de teste; exclusão explícita evita reexecução duplicada caso dist/ fique stale.
    exclude: ["**/node_modules/**", "**/dist/**"],
    /**
     * Fase 2 do Plano Mestre (ADR-015): muitos `*.service.test.ts` usam o singleton de
     * repositório compartilhado (não uma instância isolada) — antes, isso era seguro porque
     * cada arquivo de teste reimportava um Map em memória vazio. Agora o singleton aponta
     * para PostgreSQL real, um recurso verdadeiramente compartilhado entre arquivos — rodar
     * arquivos em paralelo arriscaria corrida entre eles. Execução sequencial elimina o
     * risco sem exigir reescrever a suíte existente.
     */
    fileParallelism: false,
    globalSetup: ["./scripts/testGlobalSetup.ts"],
  },
});
