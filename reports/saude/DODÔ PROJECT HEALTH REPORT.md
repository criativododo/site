# DODÔ PROJECT HEALTH REPORT

Data: 01/08/2026, 09:40:51

---

# Health Score

75/100

- ⚠ Projeto acima de 500 MB
- ⚠ Working Tree possui alterações
- ⚠ Arquivo muito grande encontrado

---

# Sistema

```json
{
  "hostname": "Mac.lan",
  "platform": "darwin",
  "release": "25.5.0",
  "arch": "arm64",
  "cpus": 10,
  "memoryGB": "16.00",
  "freeMemoryGB": "0.24",
  "uptimeHours": "53.04",
  "node": "v26.4.0"
}
```

---

# Git

```json
{
  "branch": "main",
  "status": "M .githooks/pre-commit\n M app/public/sitemap.xml\n M app/vite.config.ts\n?? .ai/\n?? .githooks/pre-push\n?? .github/CODEOWNERS\n?? .github/ISSUE_TEMPLATE/\n?? .github/PULL_REQUEST_TEMPLATE/\n?? .github/dependabot.yml\n?? .github/workflows/.gitkeep\n?? .knowledge/\n?? .playwright-mcp/\n?? .serena/\n?? BRIEFING-jescri-linha-noiva.md\n?? PROPOSTA-linha-noiva-jescri.md\n?? app/jescri/\n?? app/src/pages/\n?? apresentacao-linha-noiva-jescri.pdf\n?? biome.json\n?? docs/dominios/\n?? docs/tools/\n?? reports/\n?? scripts/SAUDE.md\n?? scripts/collectors/\n?? scripts/config/\n?? scripts/core/\n?? scripts/render/\n?? scripts/saude",
  "lastCommit": "5e0acb0 2026-07-31 design-system: repointa pin pro projeto DESIGN SYSTEM DODÔ - 2026 (5724e6f6)",
  "gitSize": "43M",
  "objectCount": "count: 1671\nsize: 43.16 MiB\nin-pack: 0\npacks: 0\nsize-pack: 0 bytes\nprune-packable: 0\ngarbage: 0\nsize-garbage: 0 bytes",
  "workingTreeDirty": true
}
```

---

# Projeto

```json
{
  "size": "509M",
  "files": "14676",
  "directories": "2005",
  "biggest": "509M\t.\n164M\t./portal-frontend\n162M\t./portal-frontend/node_modules\n132M\t./app\n121M\t./app/node_modules\n 90M\t./portal-backend\n 89M\t./portal-backend/node_modules\n 43M\t./.git/objects\n 43M\t./.git\n 41M\t./referencias",
  "sizeMB": 509
}
```

---

# Dependências

```json
{
  "projects": [
    {
      "project": "app",
      "dependencies": 3,
      "devDependencies": 12,
      "optionalDependencies": 0,
      "peerDependencies": 0
    },
    {
      "project": "portal-frontend",
      "dependencies": 3,
      "devDependencies": 9,
      "optionalDependencies": 0,
      "peerDependencies": 0
    },
    {
      "project": "portal-backend",
      "dependencies": 9,
      "devDependencies": 11,
      "optionalDependencies": 0,
      "peerDependencies": 0
    },
    {
      "project": "design-system",
      "dependencies": 0,
      "devDependencies": 0,
      "optionalDependencies": 0,
      "peerDependencies": 0
    },
    {
      "project": "design-system/.ds-sync",
      "dependencies": 3,
      "devDependencies": 0,
      "optionalDependencies": 0,
      "peerDependencies": 0
    }
  ]
}
```

---

# Build

```json
{
  "dist": "5,8M\t./app/dist\n 48K\t./app/node_modules/tinyglobby/dist\n 32K\t./app/node_modules/@rolldown/pluginutils/dist\n 64K\t./app/node_modules/eslint-scope/dist\n8,0K\t./app/node_modules/escalade/dist\n 48K\t./app/node_modules/balanced-match/dist\n316K\t./app/node_modules/@eslint/config-array/dist\n 76K\t./app/node_modules/@eslint/config-helpers/dist\n 80K\t./app/node_modules/@eslint/core/dist\n 60K\t./app/node_modules/@eslint/object-schema/dist\n104K\t./app/node_modules/@eslint/plugin-kit/dist\n520K\t./app/node_modules/acorn/dist\n868K\t./app/node_modules/rolldown/dist\n1,1M\t./app/node_modules/hermes-parser/dist\n 52K\t./app/node_modules/typescript-eslint/dist\n108K\t./app/node_modules/baseline-browser-mapping/dist\n 28K\t./app/node_modules/@typescript-eslint/project-service/dist\n 24K\t./app/node_modules/@typescript-eslint/tsconfig-utils/dist\n132K\t./app/node_modules/@typescript-eslint/types/dist\n608K\t./app/node_modules/@typescript-eslint/typescript-estree/dist\n412K\t./app/node_modules/@typescript-eslint/utils/dist\n 20K\t./app/node_modules/@typescript-eslint/parser/dist\n208K\t./app/node_modules/@typescript-eslint/type-utils/dist\n1,6M\t./app/node_modules/@typescript-eslint/scope-manager/dist\n3,3M\t./app/node_modules/@typescript-eslint/eslint-plugin/dist\n 32K\t./app/node_modules/@typescript-eslint/visitor-keys/dist\n 20K\t./app/node_modules/eslint-visitor-keys/dist\n 60K\t./app/node_modules/@humanwhocodes/retry/dist\n 16K\t./app/node_modules/@humanwhocodes/module-importer/dist\n 36K\t./app/node_modules/@vitejs/plugin-react/dist\n 56K\t./app/node_modules/fdir/dist\n 88K\t./app/node_modules/brace-expansion/dist\n2,0M\t./app/node_modules/vite/dist\n360K\t./app/node_modules/hermes-estree/dist\n636K\t./app/node_modules/minimatch/dist\n 36K\t./app/node_modules/@humanfs/core/dist\n 24K\t./app/node_modules/@humanfs/node/dist\n172K\t./app/node_modules/json5/dist\n464K\t./app/node_modules/uri-js/dist\n 52K\t./app/node_modules/espree/dist\n1,0M\t./app/node_modules/esquery/dist\n4,1M\t./app/node_modules/gsap/dist\n 56K\t./app/node_modules/@jridgewell/sourcemap-codec/dist\n 60K\t./app/node_modules/@jridgewell/trace-mapping/dist\n 52K\t./app/node_modules/@jridgewell/gen-mapping/dist\n 60K\t./app/node_modules/@jridgewell/resolve-uri/dist\n 24K\t./app/node_modules/@jridgewell/remapping/dist\n 40K\t./app/node_modules/caniuse-lite/dist\n536K\t./app/node_modules/ajv/dist\n 20K\t./app/node_modules/@eslint-community/eslint-utils/node_modules/eslint-visitor-keys/dist\n884K\t./portal-frontend/dist\n 48K\t./portal-frontend/node_modules/tinyglobby/dist\n1,6M\t./portal-frontend/node_modules/jiti/dist\n 32K\t./portal-frontend/node_modules/@rolldown/pluginutils/dist\n 40K\t./portal-frontend/node_modules/walk-up-path/dist\n868K\t./portal-frontend/node_modules/rolldown/dist\n4,9M\t./portal-frontend/node_modules/knip/dist\n212K\t./portal-frontend/node_modules/smol-toml/dist\n1,6M\t./portal-frontend/node_modules/oxlint/dist\n 36K\t./portal-frontend/node_modules/@vitejs/plugin-react/dist\n 56K\t./portal-frontend/node_modules/fdir/dist\n2,0M\t./portal-frontend/node_modules/vite/dist\n796K\t./portal-frontend/node_modules/yaml/dist\n448K\t./portal-frontend/node_modules/yaml/browser/dist\n 16K\t./portal-frontend/node_modules/react-router-dom/dist\n 48K\t./portal-frontend/node_modules/cookie/dist\n216K\t./portal-frontend/node_modules/unbash/dist\n 16K\t./portal-frontend/node_modules/resolve-pkg-maps/dist\n4,1M\t./portal-frontend/node_modules/react-router/dist\n152K\t./portal-frontend/node_modules/get-tsconfig/dist\n436K\t./portal-backend/dist\n 48K\t./portal-backend/node_modules/tinyglobby/dist\n 92K\t./portal-backend/node_modules/formidable/dist\n 28K\t./portal-backend/node_modules/obug/dist\n 32K\t./portal-backend/node_modules/@rolldown/pluginutils/dist\n 12K\t./portal-backend/node_modules/std-env/dist\n312K\t./portal-backend/node_modules/ip-address/dist\n196K\t./portal-backend/node_modules/pg-protocol/dist\n868K\t./portal-backend/node_modules/rolldown/dist\n2,0M\t./portal-backend/node_modules/vitest/dist\n452K\t./portal-backend/node_modules/magic-string/dist\n652K\t./portal-backend/node_modules/tsx/dist\n3,1M\t./portal-backend/node_modules/typescript/dist\n 32K\t./portal-backend/node_modules/pg-cloudflare/dist\n 52K\t./portal-backend/node_modules/qs/dist\n 52K\t./portal-backend/node_modules/path-to-regexp/dist\n164K\t./portal-backend/node_modules/superagent/dist\n 24K\t./portal-backend/node_modules/type-is/node_modules/content-type/dist\n432K\t./portal-backend/node_modules/jose/dist\n 56K\t./portal-backend/node_modules/fdir/dist\n 56K\t./portal-backend/node_modules/tinybench/dist\n2,0M\t./portal-backend/node_modules/vite/dist\n 24K\t./portal-backend/node_modules/body-parser/node_modules/content-type/dist\n148K\t./portal-backend/node_modules/express-rate-limit/dist\n112K\t./portal-backend/node_modules/expect-type/dist\n128K\t./portal-backend/node_modules/es-module-lexer/dist\n 20K\t./portal-backend/node_modules/@standard-schema/spec/dist\n 40K\t./portal-backend/node_modules/@vitest/spy/dist\n 72K\t./portal-backend/node_modules/@vitest/snapshot/dist\n208K\t./portal-backend/node_modules/@vitest/runner/dist\n240K\t./portal-backend/node_modules/@vitest/utils/dist\n256K\t./portal-backend/node_modules/@vitest/mocker/dist\n 52K\t./portal-backend/node_modules/@vitest/pretty-format/dist\n104K\t./portal-backend/node_modules/@vitest/expect/dist\n 56K\t./portal-backend/node_modules/@jridgewell/sourcemap-codec/dist\n 16K\t./portal-backend/node_modules/tinyexec/dist\n 72K\t./portal-backend/node_modules/pathe/dist\n8,0K\t./portal-backend/node_modules/tinyrainbow/dist\n8,0K\t./design-system/dist\n 48K\t./design-system/.ds-sync/node_modules/tinyglobby/dist\n936K\t./design-system/.ds-sync/node_modules/ts-morph/dist\n 12M\t./design-system/.ds-sync/node_modules/@ts-morph/common/dist\n 48K\t./design-system/.ds-sync/node_modules/balanced-match/dist\n 56K\t./design-system/.ds-sync/node_modules/fdir/dist\n 96K\t./design-system/.ds-sync/node_modules/brace-expansion/dist\n636K\t./design-system/.ds-sync/node_modules/minimatch/dist",
  "build": "308K\t./portal-backend/node_modules/oauth4webapi/build\n212K\t./portal-backend/node_modules/openid-client/build\n4,0K\t./scripts/collectors/build"
}
```

---

# Cache

```json
{
  "cache": "3,2M\t./app/node_modules/.vite\n4,0K\t./portal-frontend/node_modules/.cache\n3,6M\t./portal-frontend/node_modules/.vite\n8,0K\t./portal-backend/node_modules/.vite\n4,0K\t./node_modules/.vite\n4,0K\t./design-system/.design-sync/.cache"
}
```

---

# Arquivos Grandes

```
37130187 ./referencias/GitHub-BrandGuidelines-2026.pdf
5681591 ./referencias/2025-Hulu-Brand-Guidelines.pdf
5008415 ./app/public/hero-video.mp4
1148111 ./Design System/DESIGN_SYSTEM.pdf
1111957 ./design-system/ds-bundle/_vendor/react.js
976433 ./.playwright-mcp/page-2026-07-31T10-09-36-167Z.png
845194 ./Design System/DESIGN_SYSTEM.html
359628 ./portal-frontend/public/fonts/WorkSans.ttf
359628 ./design-system/fonts/WorkSans.ttf
359628 ./design-system/ds-bundle/fonts/WorkSans.ttf
359628 ./app/public/fonts/WorkSans.ttf
357196 ./knowledge/Workspace/TASK_ROUTER.md
188300 ./knowledge/Historico/TEAR_V2_OFICIAL.xlsx
188136 ./portal-frontend/public/fonts/ElmsSans.ttf
188136 ./design-system/fonts/ElmsSans.ttf
188136 ./design-system/ds-bundle/fonts/ElmsSans.ttf
188136 ./app/public/fonts/ElmsSans.ttf
135232 ./.playwright-mcp/page-2026-07-31T09-40-22-876Z.png
133342 ./portal-backend/uploads/92de0e4e-cc99-4eb7-8777-d1f99a793203-2d59c838-b602-4509-b362-5d4e6efb9ada.png
132072 ./portal-backend/package-lock.json
```

---

# Prompt para IA

```text

Você é um Engenheiro de Software Sênior especializado em auditoria de repositórios, arquitetura limpa e DevOps.

Abaixo está o DODÔ PROJECT HEALTH REPORT, gerado automaticamente pelo terminal.

A ferramenta SAÚDE apenas coleta dados.
Sua função é interpretar.

Analise:

1. Lixo técnico acumulado.
2. Crescimento anormal do projeto.
3. Builds e caches desnecessários.
4. Arquivos grandes que não deveriam estar versionados.
5. Dependências duplicadas ou problemas no monorepo.
6. Problemas de Git.
7. Riscos futuros de manutenção.
8. Melhorias reais de organização.

Regras:

- Não sugira refatorações prematuras.
- Não sugira troca de framework sem evidência.
- Foque em saúde operacional.
- Priorize ações por impacto.

Entregue:

1. Diagnóstico geral.
2. Problemas encontrados.
3. Severidade.
4. Plano de ação ordenado.


```

