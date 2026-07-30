import type { Template } from "./documentos.types.js";

/**
 * Fase 5 (scaffold): só a versão em memória. Persistência Postgres + migração ficam para a
 * próxima etapa desta fase, junto com `TemplateVersao` (imutável).
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
