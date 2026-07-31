import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import type { Template, TemplateVersao } from "./documentos.types.js";

/**
 * Fase 5 (scaffold): só a versão em memória. Persistência Postgres + migração de `Template`
 * ficam para uma próxima etapa desta fase — fora do escopo da etapa que implementou
 * `TemplateVersao` (imutável, com persistência Postgres própria mais abaixo).
 */
export class TemplateRepositorioEmMemoria {
  private templates: Template[];

  constructor(templates: Template[] = []) {
    this.templates = templates;
  }

  async listarTodos(): Promise<Template[]> {
    return this.templates;
  }

  async buscarPorId(id: string): Promise<Template | null> {
    return this.templates.find((template) => template.id === id) ?? null;
  }

  async criar(template: Template): Promise<Template> {
    this.templates.push(template);
    return template;
  }

  async atualizar(templateAtualizado: Template): Promise<Template> {
    const indice = this.templates.findIndex((template) => template.id === templateAtualizado.id);
    if (indice === -1) {
      throw new Error(`Template inexistente para atualização: ${templateAtualizado.id}`);
    }
    const atualizado: Template = { ...templateAtualizado, dataAtualizacao: new Date().toISOString() };
    this.templates[indice] = atualizado;
    return atualizado;
  }

  async remover(id: string): Promise<void> {
    const indice = this.templates.findIndex((template) => template.id === id);
    if (indice === -1) {
      throw new Error(`Template inexistente para remoção: ${id}`);
    }
    this.templates.splice(indice, 1);
  }
}

/**
 * Sem `atualizar`/`remover` de propósito: `TemplateVersao` é imutável (ver comentário em
 * `documentos.types.ts`). Cópia defensiva em `criar`/`buscarPorId` para que mutar o objeto
 * original ou o retornado nunca altere o que está persistido.
 */
export class TemplateVersaoRepositorioEmMemoria {
  private versoes: TemplateVersao[];

  constructor(versoes: TemplateVersao[] = []) {
    this.versoes = versoes;
  }

  async listarPorTemplateId(templateId: string): Promise<TemplateVersao[]> {
    return this.versoes.filter((versao) => versao.templateId === templateId).map((versao) => ({ ...versao }));
  }

  async buscarPorId(id: string): Promise<TemplateVersao | null> {
    const versao = this.versoes.find((v) => v.id === id) ?? null;
    return versao ? { ...versao } : null;
  }

  async criar(versao: TemplateVersao): Promise<TemplateVersao> {
    const copia = { ...versao };
    this.versoes.push(copia);
    return { ...copia };
  }
}

interface LinhaTemplateVersao {
  id: string;
  templateId: string;
  numeroVersao: number;
  conteudo: string;
  dataCriacao: Date;
}

function paraTemplateVersao(linha: LinhaTemplateVersao): TemplateVersao {
  return {
    id: linha.id,
    templateId: linha.templateId,
    numeroVersao: linha.numeroVersao,
    conteudo: linha.conteudo,
    dataCriacao: linha.dataCriacao.toISOString(),
  };
}

const SELECT_COLUNAS_VERSAO = `
  id, template_id AS "templateId", numero_versao AS "numeroVersao", conteudo,
  data_criacao AS "dataCriacao"
`;

/**
 * Sem `atualizar`/`remover` — mesma imutabilidade estrutural da versão em memória. `template_id`
 * é texto sem FK: `templates` ainda não tem tabela Postgres (Template segue só em memória),
 * mesma convenção já usada em `parceira_id` nas migrações da Fase 1/2.
 */
export class TemplateVersaoRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async listarPorTemplateId(templateId: string): Promise<TemplateVersao[]> {
    const resultado = await this.db.query<LinhaTemplateVersao>(
      `SELECT ${SELECT_COLUNAS_VERSAO} FROM template_versoes WHERE template_id = $1 ORDER BY numero_versao`,
      [templateId],
    );
    return resultado.rows.map(paraTemplateVersao);
  }

  async buscarPorId(id: string): Promise<TemplateVersao | null> {
    const resultado = await this.db.query<LinhaTemplateVersao>(
      `SELECT ${SELECT_COLUNAS_VERSAO} FROM template_versoes WHERE id = $1`,
      [id],
    );
    return resultado.rows[0] ? paraTemplateVersao(resultado.rows[0]) : null;
  }

  async criar(versao: TemplateVersao): Promise<TemplateVersao> {
    const resultado = await this.db.query<LinhaTemplateVersao>(
      `INSERT INTO template_versoes (id, template_id, numero_versao, conteudo, data_criacao)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${SELECT_COLUNAS_VERSAO}`,
      [versao.id, versao.templateId, versao.numeroVersao, versao.conteudo, versao.dataCriacao],
    );
    return paraTemplateVersao(resultado.rows[0]);
  }
}

export const templateVersaoRepositorio = new TemplateVersaoRepositorioPostgres(pool);
