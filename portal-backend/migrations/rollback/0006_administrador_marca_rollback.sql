ALTER TABLE identidades DROP CONSTRAINT identidades_papel_ator_check;
ALTER TABLE identidades ADD CONSTRAINT identidades_papel_ator_check
  CHECK (papel_ator IN ('ADMINISTRADOR', 'INFLUENCIADORA'));
