import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // dist/ é build de produção (sem .test.ts, ver tsconfig.json exclude) — nunca deve ser
    // fonte de teste; exclusão explícita evita reexecução duplicada caso dist/ fique stale.
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
