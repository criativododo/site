import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import type { DocumentoEmitido, StatusDocumentoEmitido, Template, TemplateVersao, TipoDocumentoEmitido } from "./documentos.types.js";

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

interface LinhaTemplate {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

function paraTemplate(linha: LinhaTemplate): Template {
  return {
    id: linha.id,
    nome: linha.nome,
    descricao: linha.descricao,
    ativo: linha.ativo,
    dataCriacao: linha.dataCriacao.toISOString(),
    dataAtualizacao: linha.dataAtualizacao.toISOString(),
  };
}

const SELECT_COLUNAS_TEMPLATE = `
  id, nome, descricao, ativo, data_criacao AS "dataCriacao", data_atualizacao AS "dataAtualizacao"
`;

/** Fase 5 do Plano Mestre: mesma interface pública da versão em memória (padrão do módulo briefing). */
export class TemplateRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async listarTodos(): Promise<Template[]> {
    const resultado = await this.db.query<LinhaTemplate>(`SELECT ${SELECT_COLUNAS_TEMPLATE} FROM templates`);
    return resultado.rows.map(paraTemplate);
  }

  async buscarPorId(id: string): Promise<Template | null> {
    const resultado = await this.db.query<LinhaTemplate>(
      `SELECT ${SELECT_COLUNAS_TEMPLATE} FROM templates WHERE id = $1`,
      [id],
    );
    return resultado.rows[0] ? paraTemplate(resultado.rows[0]) : null;
  }

  async criar(template: Template): Promise<Template> {
    const resultado = await this.db.query<LinhaTemplate>(
      `INSERT INTO templates (id, nome, descricao, ativo, data_criacao, data_atualizacao)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${SELECT_COLUNAS_TEMPLATE}`,
      [template.id, template.nome, template.descricao, template.ativo, template.dataCriacao, template.dataAtualizacao],
    );
    return paraTemplate(resultado.rows[0]);
  }

  async atualizar(templateAtualizado: Template): Promise<Template> {
    const resultado = await this.db.query<LinhaTemplate>(
      `UPDATE templates SET
         nome = $2, descricao = $3, ativo = $4, data_atualizacao = now()
       WHERE id = $1
       RETURNING ${SELECT_COLUNAS_TEMPLATE}`,
      [templateAtualizado.id, templateAtualizado.nome, templateAtualizado.descricao, templateAtualizado.ativo],
    );
    if (!resultado.rows[0]) {
      throw new Error(`Template inexistente para atualização: ${templateAtualizado.id}`);
    }
    return paraTemplate(resultado.rows[0]);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.db.query(`DELETE FROM templates WHERE id = $1`, [id]);
    if (resultado.rowCount === 0) {
      throw new Error(`Template inexistente para remoção: ${id}`);
    }
  }
}

export const templateRepositorio = new TemplateRepositorioPostgres(pool);

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
 * é texto sem FK por consistência de padrão de schema (não por limitação técnica — ver
 * comentário completo em `migrations/0003_template_versoes.sql`), mesma convenção de
 * `parceira_id`. Continua assim mesmo após a migração 0004 dar tabela Postgres a `Template`.
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

/**
 * Histórico imutável (motor §1.3): sem `atualizar`/`remover` de propósito — mesma decisão de
 * `TemplateVersaoRepositorioEmMemoria`. Transição de `status` (motor §1.7) é workflow de
 * emissão, fora do escopo desta etapa; quando existir, é um método novo, não uma reabertura
 * desta imutabilidade. `hash` único é reforçado aqui em memória para manter o mesmo contrato
 * da versão Postgres (`UNIQUE`, migração 0005).
 */
export class DocumentoEmitidoRepositorioEmMemoria {
  private documentos: DocumentoEmitido[];

  constructor(documentos: DocumentoEmitido[] = []) {
    this.documentos = documentos;
  }

  async listarPorParceiraId(parceiraId: string): Promise<DocumentoEmitido[]> {
    return this.documentos.filter((documento) => documento.parceiraId === parceiraId).map((documento) => ({ ...documento }));
  }

  async buscarPorId(id: string): Promise<DocumentoEmitido | null> {
    const documento = this.documentos.find((d) => d.id === id) ?? null;
    return documento ? { ...documento } : null;
  }

  async criar(documento: DocumentoEmitido): Promise<DocumentoEmitido> {
    if (this.documentos.some((d) => d.hash === documento.hash)) {
      throw new Error(`Hash já registrado em outro DocumentoEmitido: ${documento.hash}`);
    }
    const copia = { ...documento };
    this.documentos.push(copia);
    return { ...copia };
  }
}

interface LinhaDocumentoEmitido {
  id: string;
  tipo: TipoDocumentoEmitido;
  templateVersaoId: string;
  parceiraId: string;
  colaboracaoMensalId: string | null;
  geradoEm: Date;
  geradoPor: string;
  status: StatusDocumentoEmitido;
  hash: string;
  urlStorage: string;
  storageFileId: string;
}

function paraDocumentoEmitido(linha: LinhaDocumentoEmitido): DocumentoEmitido {
  return {
    id: linha.id,
    tipo: linha.tipo,
    templateVersaoId: linha.templateVersaoId,
    parceiraId: linha.parceiraId,
    colaboracaoMensalId: linha.colaboracaoMensalId,
    geradoEm: linha.geradoEm.toISOString(),
    geradoPor: linha.geradoPor,
    status: linha.status,
    hash: linha.hash,
    urlStorage: linha.urlStorage,
    storageFileId: linha.storageFileId,
  };
}

const SELECT_COLUNAS_DOCUMENTO_EMITIDO = `
  id, tipo, template_versao_id AS "templateVersaoId", parceira_id AS "parceiraId",
  colaboracao_mensal_id AS "colaboracaoMensalId", gerado_em AS "geradoEm", gerado_por AS "geradoPor",
  status, hash, url_storage AS "urlStorage", storage_file_id AS "storageFileId"
`;

/** Fase 5 do Plano Mestre: mesma interface pública da versão em memória (padrão do módulo briefing). */
export class DocumentoEmitidoRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async listarPorParceiraId(parceiraId: string): Promise<DocumentoEmitido[]> {
    const resultado = await this.db.query<LinhaDocumentoEmitido>(
      `SELECT ${SELECT_COLUNAS_DOCUMENTO_EMITIDO} FROM documentos_emitidos WHERE parceira_id = $1 ORDER BY gerado_em`,
      [parceiraId],
    );
    return resultado.rows.map(paraDocumentoEmitido);
  }

  async buscarPorId(id: string): Promise<DocumentoEmitido | null> {
    const resultado = await this.db.query<LinhaDocumentoEmitido>(
      `SELECT ${SELECT_COLUNAS_DOCUMENTO_EMITIDO} FROM documentos_emitidos WHERE id = $1`,
      [id],
    );
    return resultado.rows[0] ? paraDocumentoEmitido(resultado.rows[0]) : null;
  }

  async criar(documento: DocumentoEmitido): Promise<DocumentoEmitido> {
    const resultado = await this.db.query<LinhaDocumentoEmitido>(
      `INSERT INTO documentos_emitidos
         (id, tipo, template_versao_id, parceira_id, colaboracao_mensal_id, gerado_em, gerado_por, status, hash, url_storage, storage_file_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${SELECT_COLUNAS_DOCUMENTO_EMITIDO}`,
      [
        documento.id,
        documento.tipo,
        documento.templateVersaoId,
        documento.parceiraId,
        documento.colaboracaoMensalId,
        documento.geradoEm,
        documento.geradoPor,
        documento.status,
        documento.hash,
        documento.urlStorage,
        documento.storageFileId,
      ],
    );
    return paraDocumentoEmitido(resultado.rows[0]);
  }
}

export const documentoEmitidoRepositorio = new DocumentoEmitidoRepositorioPostgres(pool);
