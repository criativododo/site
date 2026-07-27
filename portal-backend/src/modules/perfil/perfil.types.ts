/**
 * Vocabulário desta camada segue SPEC-032 (Perfil) e SPEC-002 (agregado Parceira, PII —
 * PIX/Endereco, Contrato Soberano §5). SPEC-002 em si não está implementada neste EPIC — só
 * o recorte de perfil que o Portal lê/edita (PORTAL_BACKLOG.md EPIC 4 permite stub/seed).
 */

export interface Endereco {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
  numero: string;
  complemento: string;
}

export interface PerfilParceira {
  parceiraId: string;
  pix: string;
  email: string;
  endereco: Endereco | null;
}
