/**
 * ADR-011: link de convite pré-aprovado — quem se cadastra por ele pula a fila de moderação
 * (`PENDING`) e vai direto para `ACTIVE` ao enviar o cadastro.
 */
export interface ConviteCadastro {
  token: string;
  criadoPor: string;
  criadoEm: string;
  usadoEm: string | null;
  usadoPorSub: string | null;
}
