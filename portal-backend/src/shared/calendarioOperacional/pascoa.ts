/**
 * Algoritmo de Gauss/Meeus (anônimo gregoriano) para o domingo de Páscoa — determinístico,
 * sem dependência externa, válido para qualquer ano do calendário gregoriano. Usado para
 * derivar os feriados nacionais móveis (ADR-014): Carnaval, Sexta-feira Santa, Corpus Christi.
 */
export function calcularDomingoDePascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const numero = h + l - 7 * m + 114;
  const mes = Math.floor(numero / 31); // 3 = março, 4 = abril
  const dia = (numero % 31) + 1;

  return new Date(Date.UTC(ano, mes - 1, dia));
}
