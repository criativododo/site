import { entregaRepositorio } from "../conteudo/entrega.repository.js";
import { obrigacaoRepositorio } from "../financeiro/obrigacao.repository.js";
import { perfilRepositorio } from "../perfil/perfil.repository.js";

/**
 * ADR-010 ponto 5 (LGPD, direitos do titular — acesso/portabilidade): agrega todo dado
 * pessoal e operacional que o Portal mantém sobre a Parceira, num único documento estruturado.
 * Fachada de leitura pura — não modifica nenhum dado, só agrega o que os módulos já expõem.
 */
export async function exportarDadosDaParceira(parceiraId: string) {
  const [perfil, entregas, obrigacoes] = await Promise.all([
    perfilRepositorio.buscarPorParceira(parceiraId),
    entregaRepositorio.listarPorParceira(parceiraId),
    obrigacaoRepositorio.listarPorParceira(parceiraId),
  ]);

  return {
    geradoEm: new Date().toISOString(),
    parceiraId,
    perfil,
    entregas,
    obrigacoesFinanceiras: obrigacoes,
  };
}
