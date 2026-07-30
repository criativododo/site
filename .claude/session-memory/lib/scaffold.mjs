import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { withMarker } from './documents.mjs';
import { dateParts, nowIso } from './core.mjs';

function writeIfAbsent(filePath, content) {
  if (!existsSync(filePath)) writeFileSync(filePath, content, 'utf8');
}

export function createInitialMemory(memoryPath, source) {
  for (const path of ['journals', 'project', 'templates', 'migration', 'releases']) mkdirSync(join(memoryPath, path), { recursive: true });
  const createdAt = nowIso();
  const status = {
    schemaVersion: 1,
    updatedAt: createdAt,
    project: 'Portal DODÔ',
    phase: 'Fase 4 — Armazenamento + Workspace Provisioning',
    sprint: 'Não formalizada',
    lastJournal: null,
    lastCommit: source.head,
    lastAdr: 'ADR-017',
    blockers: ['Conflito de escopo OAuth do Google Drive: drive.file versus ADR-017 legado.'],
    nextTask: 'Resolver a decisão arquitetural do modelo de provisionamento e do escopo OAuth do Google Drive.',
    summary: 'Fases 1 a 3 concluídas; Fase 4 iniciada com OAuth do Google Drive validado.',
  };
  const roadmap = {
    schemaVersion: 1,
    source: 'PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md (29/07/2026)',
    phases: [
      ['Fase 1', 'Fechamentos de baixo risco', 'complete'],
      ['Fase 2', 'Persistência real (PostgreSQL)', 'complete'],
      ['Fase 3', 'Colaboração Mensal', 'complete'],
      ['Fase 4', 'Armazenamento + Workspace Provisioning', 'in_progress'],
      ['Fase 5', 'Motor de Documentos', 'pending'],
      ['Fase 6', 'Motor de Comunicação', 'pending'],
      ['Fase 7', 'Motor de Briefings', 'pending'],
      ['Fase 8', 'Módulo de Envios', 'pending'],
      ['Fase 9', 'Motor de Planejamento Editorial', 'pending'],
      ['Fase 10', 'Endurecimento transversal', 'pending'],
      ['Fase 11', 'Preparação para produção / go-live', 'pending'],
    ].map(([id, title, status]) => ({ id, title, status })),
  };
  const adr = {
    schemaVersion: 1,
    updatedAt: createdAt,
    lastAdr: 'ADR-017',
    affected: ['ADR-017 — OAuth dedicado do Google Drive'],
    attention: 'Há conflito documentado entre ADR-017 vigente e ADR-017 legado sobre o escopo do Drive.',
  };
  writeIfAbsent(join(memoryPath, 'README.md'), `# Memória operacional — Portal DODÔ\n\nRepositório privado de continuidade de contexto. Não contém código da aplicação, credenciais nem artefatos de deploy.\n\nUse os comandos versionados no repositório da aplicação: \`/inicio\`, \`/fim\`, \`/status\`, \`/journal\`, \`/roadmap\`, \`/check\` e \`/release\`.\n`);
  writeIfAbsent(join(memoryPath, 'journals/INDEX.md'), '# Índice de journals\n\n> Gerado pelo Session Memory. Não editar manualmente.\n\n| Encerramento | Objetivo | Fase | Sprint | Commit |\n| --- | --- | --- | --- | --- |\n| — | Nenhum journal registrado | — | — | — |\n');
  writeIfAbsent(join(memoryPath, 'project/PROJECT_STATUS.md'), withMarker(`# Estado atual\n\n- **Projeto:** ${status.project}\n- **Fase:** ${status.phase}\n- **Sprint:** ${status.sprint}\n- **Último commit relevante:** ${status.lastCommit.slice(0, 7)}\n- **Última ADR:** ${status.lastAdr}\n\n## Resumo\n\n${status.summary}\n\n## Bloqueios\n\n${status.blockers.map((item) => `- ${item}`).join('\n')}\n\n## Próxima tarefa\n\n${status.nextTask}\n`, status));
  writeIfAbsent(join(memoryPath, 'project/START_HERE_NEXT_SESSION.md'), withMarker(`# Comece aqui\n\n1. Execute \`/inicio <objetivo>\` no repositório da aplicação.\n2. Leia o resumo retornado e resolva bloqueios antes de alterar arquitetura.\n3. Ao encerrar, execute \`/fim\`.\n\n## Próxima tarefa\n\n${status.nextTask}\n`, status));
  writeIfAbsent(join(memoryPath, 'project/ROADMAP.md'), withMarker(`# Roadmap\n\n> Progresso calculado por fases integralmente concluídas; fases em andamento são exibidas separadamente.\n\n| Fase | Objetivo | Estado |\n| --- | --- | --- |\n${roadmap.phases.map((phase) => `| ${phase.id} | ${phase.title} | ${phase.status} |`).join('\n')}\n`, roadmap));
  writeIfAbsent(join(memoryPath, 'project/ADR_STATUS.md'), withMarker(`# Estado das ADRs\n\n- **Última ADR:** ${adr.lastAdr}\n- **Atenção:** ${adr.attention}\n\nEsta é uma lista de referências; ADRs completos continuam no repositório da aplicação.\n`, adr));
  writeIfAbsent(join(memoryPath, 'project/ARCHITECTURE.md'), `# Arquitetura do sistema de memória\n\n- O repositório da aplicação contém skills e o CLI sem dependências externas.\n- Este repositório contém apenas documentação operacional versionada.\n- \`/inicio\` faz sync seguro e cria o baseline; \`/fim\` compila o journal e publica somente após validação.\n- \`pull --ff-only\` e push fast-forward impedem sobrescrita de trabalho remoto.\n`);
  writeIfAbsent(join(memoryPath, 'migration/LEGACY_HANDOFFS.md'), `# Handoffs legados\n\nOs documentos abaixo permanecem no repositório da aplicação como histórico somente-leitura. A partir da ativação deste sistema, o estado canônico vive neste repositório.\n\n- \`START_HERE_NEXT_SESSION.md\`\n- \`docs/handoff/PROJECT_STATUS.md\`\n- \`docs/handoff/*.md\`\n- \`docs/_workspace/\`\n\nFonte consolidada em ${dateParts(createdAt).localDate}; commit de origem: ${source.head}.\n`);
  writeIfAbsent(join(memoryPath, 'templates/JOURNAL_TEMPLATE.md'), `# Journal — {{objective}}\n\n<!-- session-memory\n{{metadata}}\n-->\n\n${['Objetivo', 'Contexto', 'Trabalhos realizados', 'Arquivos alterados', 'Arquivos criados', 'Arquivos removidos', 'Commits', 'Testes', 'Decisões', 'ADRs afetadas', 'Problemas encontrados', 'Bloqueios', 'Próxima tarefa', 'Observações', 'Confiança da IA'].map((heading) => `## ${heading}\n\n- {{preencher}}\n`).join('\n')}`);
  writeIfAbsent(join(memoryPath, 'templates/PROJECT_STATUS_TEMPLATE.md'), '# Estado atual\n\nAtualizado pelo `/fim`; manter fatos presentes, nunca histórico extenso.\n');
  writeIfAbsent(join(memoryPath, 'templates/START_SESSION_TEMPLATE.md'), '# Comece aqui\n\nExecutar `/inicio <objetivo>` antes de trabalhar.\n');
}
