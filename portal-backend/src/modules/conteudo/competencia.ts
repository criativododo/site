/** MesReferencia da competência corrente, formato `AAAA-MM` (SPEC-005 ADR-001 §3). */
export function competenciaCorrente(referencia: Date = new Date()): string {
  const ano = referencia.getUTCFullYear();
  const mes = String(referencia.getUTCMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

/** MesReferencia imediatamente anterior a `mesReferencia` (`AAAA-MM`). */
export function competenciaAnterior(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 2, 1));
  return competenciaCorrente(data);
}
