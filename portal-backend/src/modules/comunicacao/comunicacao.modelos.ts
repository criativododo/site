import type { CategoriaModeloMensagem, ModeloMensagem, VariavelSuportada } from "./comunicacao.types.js";

/**
 * Variáveis suportadas nos modelos (spec da tela Comunicação, Sprint 2). A substituição em si
 * acontece no cliente (`pages/CentralInfluenciadora.tsx`), que já tem o contexto da Ficha
 * carregado — esta lista é só a referência exibida na tela e usada para validar o texto.
 *
 * `{{valor}}` resolve para o valor da obrigação pendente mais próxima da Parceira; na ausência
 * de pendência, cai para o valor mensal contratado (Condição Comercial) — decisão desta sessão,
 * já que a spec não distinguiu os dois casos.
 * `{{prazo}}` resolve para o próximo prazo de entrega/postagem da Ficha, se existir; sem prazo
 * futuro, o cliente deixa a variável sem substituição visível (texto de fallback), nunca uma
 * data inventada.
 */
export const VARIAVEIS_SUPORTADAS: VariavelSuportada[] = [
  { variavel: "{{nome}}", descricao: "nome da parceira" },
  { variavel: "{{campanha}}", descricao: "competência atual (ex.: agosto de 2026)" },
  { variavel: "{{valor}}", descricao: "valor do pagamento pendente mais próximo, ou valor mensal contratado se não houver pendência" },
  { variavel: "{{pix}}", descricao: "chave pix cadastrada da parceira" },
  { variavel: "{{prazo}}", descricao: "próximo prazo de entrega ou postagem, quando existir" },
  { variavel: "{{cupom}}", descricao: "cupom/chave da parceira" },
];

/** 1 modelo por categoria (Sprint 2) — sem CRUD: ampliar exige nova sessão de Produto. */
export const MODELOS_MENSAGEM: ModeloMensagem[] = [
  {
    id: "boas-vindas-padrao",
    categoria: "BOAS_VINDAS",
    titulo: "boas-vindas",
    corpo: "Oi, {{nome}}! Que alegria ter você como parceira da Criativo Dodô 💛 Em breve você recebe o briefing da nossa próxima colaboração. Qualquer dúvida, é só chamar por aqui!",
  },
  {
    id: "briefing-disponivel",
    categoria: "BRIEFING",
    titulo: "briefing disponível",
    corpo: "Oi, {{nome}}! O briefing da campanha de {{campanha}} já está disponível no seu portal. Dá uma olhada quando puder e qualquer dúvida me chama por aqui.",
  },
  {
    id: "lembrete-prazo",
    categoria: "LEMBRETE",
    titulo: "lembrete de prazo",
    corpo: "Oi, {{nome}}! Passando para lembrar que o prazo de envio do material está chegando: {{prazo}}. Qualquer imprevisto, me avisa 🙂",
  },
  {
    id: "aprovacao-material",
    categoria: "APROVACAO",
    titulo: "retorno de aprovação",
    corpo: "Oi, {{nome}}! Seu material já foi revisado pela equipe. Dá uma olhada no portal para ver o retorno da aprovação.",
  },
  {
    id: "solicitar-nota-fiscal",
    categoria: "NOTA_FISCAL",
    titulo: "solicitar nota fiscal",
    corpo: "Oi, {{nome}}! Para seguirmos com o pagamento da competência, precisamos da nota fiscal referente a {{campanha}}, no valor de {{valor}}. Pode nos enviar por aqui?",
  },
  {
    id: "pagamento-confirmado",
    categoria: "PAGAMENTO",
    titulo: "pagamento confirmado",
    corpo: "Oi, {{nome}}! Seu pagamento de {{valor}} referente à colaboração de {{campanha}} já foi processado para o Pix {{pix}}.",
  },
  {
    id: "kit-enviado",
    categoria: "LOGISTICA",
    titulo: "kit enviado",
    corpo: "Oi, {{nome}}! Seu kit da campanha de {{campanha}} já foi enviado. Assim que chegar, nos avisa por aqui, combinado?",
  },
  {
    id: "encerramento-colaboracao",
    categoria: "ENCERRAMENTO",
    titulo: "encerramento da colaboração",
    corpo: "Oi, {{nome}}! Fechamos por aqui a colaboração de {{campanha}}. Muito obrigada por todo o cuidado com o conteúdo — até a próxima! Use sempre o cupom {{cupom}} 💛",
  },
];

export function agruparModelosPorCategoria(): Record<CategoriaModeloMensagem, ModeloMensagem[]> {
  const agrupado = {} as Record<CategoriaModeloMensagem, ModeloMensagem[]>;
  for (const modelo of MODELOS_MENSAGEM) {
    (agrupado[modelo.categoria] ??= []).push(modelo);
  }
  return agrupado;
}
