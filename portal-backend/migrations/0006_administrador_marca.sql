-- ADR-022 (supersede ADR-008): ator "Marca" entra no MVP como segundo nível administrativo
-- (`ADMINISTRADOR_MARCA`, nível 2), ao lado de `ADMINISTRADOR` (nível 5) e `INFLUENCIADORA`.
-- Sistema permanece single-tenant — este papel não introduz `tenant_id` nem particionamento
-- de dados, só um valor novo permitido em `identidades.papel_ator`.

ALTER TABLE identidades DROP CONSTRAINT identidades_papel_ator_check;
ALTER TABLE identidades ADD CONSTRAINT identidades_papel_ator_check
  CHECK (papel_ator IN ('ADMINISTRADOR', 'ADMINISTRADOR_MARCA', 'INFLUENCIADORA'));
