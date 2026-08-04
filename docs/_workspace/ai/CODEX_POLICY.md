# CODEX_POLICY — Vinculação do Julgamento Independente ao Fornecedor Atual

> **Estabilidade:** Volátil/Experimental — de propósito
> **Depende de:** [CAPABILITY_MODEL.md](./CAPABILITY_MODEL.md) (capacidade C4), [MODEL_ROUTING.md](./MODEL_ROUTING.md)
> **Dependido por:** [ROADMAP.md](./ROADMAP.md)
> **Frequência esperada de alteração:** alta

---

## Aviso de escopo

Este é o único documento, além do bloco de vinculação de `MODEL_ROUTING.md`, onde um fornecedor de IA específico é nomeado deliberadamente. Se este fornecedor deixar de existir ou for substituído, **este documento morre por completo** e é reescrito do zero — nenhum outro documento desta família precisa mudar por causa disso. Essa é a razão de ele existir separado: conter 100% do detalhe específico de fornecedor num único lugar pequeno e descartável.

## Fornecedor vinculado hoje

O plugin oficial "Codex" (OpenAI), integrado como plugin da plataforma de desenvolvimento em uso, autenticado via login próprio, versão auditada na fase de arquitetura desta plataforma.

## Vinculação por modo de C4

| Modo | Comando do fornecedor | Quando obrigatório | Nível de esforço |
|---|---|---|---|
| C4a — Confirmatório | Comando de revisão técnica de rotina do plugin | Diff não trivial (mais que ~1-2 arquivos), antes de virar decisão final | Padrão do fornecedor (nível intermediário) |
| C4b — Adversarial | Comando de revisão adversarial do plugin | Sempre que a mudança já exigiria registro formal de decisão arquitetural (arquitetura, domínio, autenticação, integração) | Alto/máximo — nunca o nível padrão |
| C4c — Investigativo | Comando/subagente de investigação e resgate do plugin | Quando a primeira tentativa de investigação (na sessão principal) não resolveu o bloqueio | Alto, escalando ao máximo se persistir |

## Regras fixas desta vinculação

1. **O fornecedor nunca decide Produto** (capacidade C0), nunca aplica correção sozinho, nunca cria seus próprios sub-mecanismos de paralelismo dentro de uma chamada vinda da plataforma principal — isso duplicaria custo sem necessidade.
2. **O portão automático de revisão obrigatória antes de encerrar sessão permanece desligado.** Revisão adversarial rotineira em mudanças de baixo risco é o principal risco documentado de custo descontrolado — reservada estritamente ao critério da tabela acima.
3. **Execução em background é preferida** para qualquer revisão não trivial — evita bloquear a linha de trabalho principal.
4. **O custo deste fornecedor é um livro-razão separado** do custo da plataforma principal — não existe orçamento compartilhado entre os dois hoje.
5. **Este fornecedor não vê a constituição do projeto por padrão** — a correção para isso é o arquivo de convenção externa especificado em `AGENTS_POLICY.md`, ainda não criado (ver Ponto em aberto).

## O que este documento não define

Os comandos técnicos exatos, versão do CLI, e passo a passo operacional de uso deste fornecedor pertencem a documentação técnica operacional própria (fora desta família de documentos de arquitetura), não a este arquivo — este arquivo é política de quando/quanto usar, não manual de operação.

## Ponto em aberto

- O arquivo de convenção externa (capacidade descrita em `AGENTS_POLICY.md`) ainda não foi criado — este fornecedor hoje revisa sem visibilidade da hierarquia de decisão do projeto. Fica registrado como pendência para a fase em que a relação com este fornecedor for ativada operacionalmente (ver `ROADMAP.md`).
- Nenhum teste real de uso (uma revisão de rotina rodada sobre um diff existente) foi executado ainda dentro do escopo desta arquitetura — a vinculação acima é normativa, não validada em uso.
