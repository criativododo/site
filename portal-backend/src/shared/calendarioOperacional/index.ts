import { CALENDARIO_OPERACIONAL_PADRAO } from "./configuracaoPadrao.js";
import { CalendarioOperacionalProvider } from "./provider.js";

export type {
  ConfiguracaoCalendarioOperacional,
  FeriadoInstitucional,
  FeriadoRecorrente,
  ProvedorDeCalendarioOperacional,
} from "./tipos.js";
export { CALENDARIO_OPERACIONAL_PADRAO } from "./configuracaoPadrao.js";
export { CalendarioOperacionalProvider } from "./provider.js";
export { calcularDomingoDePascoa } from "./pascoa.js";
export { ehFeriadoNacional, feriadosNacionaisMoveisDoAno, FERIADOS_NACIONAIS_FIXOS } from "./feriadosNacionais.js";

/** Instância única do calendário operacional do Portal (Nova Friburgo/RJ, ADR-014). */
export const calendarioOperacionalPadrao = new CalendarioOperacionalProvider(CALENDARIO_OPERACIONAL_PADRAO);
