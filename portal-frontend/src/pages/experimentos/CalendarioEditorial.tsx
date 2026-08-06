import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatarDiaMes, formatarDiaSemana } from "../../lib/formatters";
import { useSession } from "../../lib/session";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
import "./CalendarioEditorial.css";

/**
 * Calendário Editorial (DOC SPRINT #2, item 8) — décima tela da família, mesmo padrão aditivo
 * das nove anteriores. Rota própria (`/admin/calendario`, sem colisão com nenhuma rota legada).
 *
 * Direção (auditoria visual obrigatória — Publicação/Envio/Identidade/Painel da Marca/Mesa da
 * Campanha/Central de Influenciadoras lidas antes de qualquer decisão de layout):
 * 1. Mesma abertura da família "página inteira de campanha" (Mesa da Campanha/Painel da Marca):
 *    nav própria, fotografia editorial, eyebrow + assunto + frase de estado + narrativa. Eyebrow
 *    mostra o nome da tela (mesma convenção de `AdminCampanhaPage`, uma ferramenta operacional,
 *    não o retrato da campanha em si).
 * 2. Anti-princípio do doc de origem ("não utilizamos componentes padrão que criem grades
 *    simétricas e frias") proíbe uma grade de mês tradicional. Os três "modos de visualização"
 *    (agenda/semana/mês) mudam apenas o recorte temporal de uma mesma lista cronológica agrupada
 *    por dia — a mesma espinha dorsal de timeline já usada em toda a família — nunca introduzem
 *    um componente de grid novo.
 * 3. Identidade de categoria é tipográfica (rótulo por extenso antes do título), não uma paleta
 *    de cores nova: a escala de tokens só define grafite + cherry, e "Lógica Cherry" (doc de
 *    origem) restringe vermelho a itens atrasados/críticos — inventar 5 cores de categoria seria
 *    linguagem visual nova sem aprovação. Cherry fica reservado ao dia de hoje (mesmo uso de
 *    "próximo item" que `is-atual` já tem no restante da família).
 * 4. Alternador de modo e filtro de categoria são texto com sublinhado ao ativar/hover — mesma
 *    interação de `.campanha-nav-sair`/`.marca-nav-sair` (sublinhado que cresce da direita),
 *    reaproveitada como controle de estado em vez de criar um componente de abas/pílulas novo
 *    (nenhum padrão existente de aba/toggle existe na família; esta é a extensão mínima
 *    justificada pela regra de auditoria).
 * 5. "Adicionar à agenda" gera um `.ics` real no cliente (`data:` URI, sem round-trip ao
 *    backend) — funcionalidade genuína, não fixture: não depende de nenhuma API que ainda não
 *    existe.
 * 6. Lacuna declarada (ADR-003, mesmo padrão de `MarcaDashboard.tsx`/`AdminCampanha.tsx`): não
 *    existe hoje nenhuma tabela/rota de evento de campanha no backend — a lista de compromissos
 *    abaixo é fixture, só para validar a hierarquia visual proposta. Integração automática com
 *    campanha/briefing/logística/pagamentos (doc de origem) é trabalho de backend futuro.
 * 7. Gate de acesso: Administrador e Administrador da Marca (mesmo padrão de duplo gate de
 *    `RelatorioCampanhaPage`/`MarcaDashboardPage`) — o doc de origem descreve DODÔ e marca
 *    acompanhando o mesmo calendário.
 */

type Categoria = "publicacao" | "aprovacao" | "logistica" | "pagamento" | "briefing";
type Modo = "agenda" | "semana" | "mes";

interface EventoCalendario {
	id: string;
	data: string;
	categoria: Categoria;
	titulo: string;
	parceiraNome: string;
}

const ROTULO_CATEGORIA: Record<Categoria, string> = {
	publicacao: "publicação",
	aprovacao: "aprovação",
	logistica: "logística",
	pagamento: "pagamento",
	briefing: "briefing",
};

/** Plural irregular de "-ção" não segue a concatenação simples de "s" usada no restante. */
const ROTULO_CATEGORIA_PLURAL: Record<Categoria, string> = {
	publicacao: "publicações",
	aprovacao: "aprovações",
	logistica: "logísticas",
	pagamento: "pagamentos",
	briefing: "briefings",
};

const ORDEM_CATEGORIAS: Categoria[] = ["publicacao", "aprovacao", "logistica", "pagamento", "briefing"];

const ROTULO_MODO: Record<Modo, string> = {
	agenda: "agenda",
	semana: "semana",
	mes: "mês",
};

const ROTULO_PERIODO: Record<Modo, string> = {
	agenda: "pela frente",
	semana: "essa semana",
	mes: "em agosto",
};

const contexto = {
	campanha: "calendário editorial",
	assunto: "essência labial",
};

/** Data de referência fixa da fixture (mesmo recorte de "campanha de agosto" do resto da família). */
const HOJE_ISO = "2026-08-05";

const eventos: EventoCalendario[] = [
	{ id: "e1", data: "2026-08-01", categoria: "logistica", titulo: "kit da campanha separado para envio", parceiraNome: "Marina Duarte" },
	{ id: "e2", data: "2026-08-03", categoria: "briefing", titulo: "briefing revisado liberado para as parceiras", parceiraNome: "equipe dodô" },
	{ id: "e3", data: "2026-08-04", categoria: "logistica", titulo: "kit chegou até a parceira", parceiraNome: "Laura Ferreira" },
	{ id: "e4", data: "2026-08-05", categoria: "aprovacao", titulo: "conteúdo aguardando aprovação da marca", parceiraNome: "Bianca Alves" },
	{ id: "e5", data: "2026-08-05", categoria: "pagamento", titulo: "pagamento da competência liberado", parceiraNome: "Marina Duarte" },
	{ id: "e6", data: "2026-08-06", categoria: "publicacao", titulo: "story da campanha no ar", parceiraNome: "Laura Ferreira" },
	{ id: "e7", data: "2026-08-08", categoria: "publicacao", titulo: "reel programado para publicação", parceiraNome: "Bianca Alves" },
	{ id: "e8", data: "2026-08-10", categoria: "logistica", titulo: "remessa a caminho da parceira", parceiraNome: "Camila Rocha" },
	{ id: "e9", data: "2026-08-12", categoria: "aprovacao", titulo: "carrossel aguardando aprovação da marca", parceiraNome: "Camila Rocha" },
	{ id: "e10", data: "2026-08-14", categoria: "publicacao", titulo: "postagem principal da campanha", parceiraNome: "Marina Duarte" },
	{ id: "e11", data: "2026-08-18", categoria: "pagamento", titulo: "pagamento agendado para a competência", parceiraNome: "Laura Ferreira" },
	{ id: "e12", data: "2026-08-20", categoria: "briefing", titulo: "novo briefing liberado para a próxima etapa", parceiraNome: "equipe dodô" },
	{ id: "e13", data: "2026-08-24", categoria: "logistica", titulo: "confirmação de recebimento pendente", parceiraNome: "Bianca Alves" },
	{ id: "e14", data: "2026-08-29", categoria: "publicacao", titulo: "encerramento da campanha nas redes", parceiraNome: "todas as parceiras" },
];

function paraIso(d: Date): string {
	const ano = d.getUTCFullYear();
	const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
	const dia = String(d.getUTCDate()).padStart(2, "0");
	return `${ano}-${mes}-${dia}`;
}

function paraData(dataIso: string): Date {
	const [ano, mes, dia] = dataIso.split("-").map(Number);
	return new Date(Date.UTC(ano, mes - 1, dia));
}

function inicioDaSemana(dataIso: string): string {
	const d = paraData(dataIso);
	const diaSemana = d.getUTCDay();
	const offsetParaSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
	d.setUTCDate(d.getUTCDate() - offsetParaSegunda);
	return paraIso(d);
}

function fimDaSemana(dataIso: string): string {
	const d = paraData(inicioDaSemana(dataIso));
	d.setUTCDate(d.getUTCDate() + 6);
	return paraIso(d);
}

function inicioDoMes(dataIso: string): string {
	const [ano, mes] = dataIso.split("-");
	return `${ano}-${mes}-01`;
}

function fimDoMes(dataIso: string): string {
	const [ano, mes] = dataIso.split("-").map(Number);
	const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
	return `${ano}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
}

function intervaloDoModo(modo: Modo): { inicio: string; fim: string | null } {
	if (modo === "semana") {
		return { inicio: inicioDaSemana(HOJE_ISO), fim: fimDaSemana(HOJE_ISO) };
	}
	if (modo === "mes") {
		return { inicio: inicioDoMes(HOJE_ISO), fim: fimDoMes(HOJE_ISO) };
	}
	return { inicio: HOJE_ISO, fim: null };
}

function tituloComMaiuscula(texto: string): string {
	return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function fraseDeEstado(quantidade: number, modo: Modo): string {
	if (quantidade === 0) {
		return `nada programado ${ROTULO_PERIODO[modo]}.`;
	}
	const compromissos = quantidade === 1 ? "1 compromisso" : `${quantidade} compromissos`;
	return `${compromissos} ${ROTULO_PERIODO[modo]}.`;
}

function narrativaDeEstado(eventosFiltrados: EventoCalendario[]): string {
	if (eventosFiltrados.length === 0) {
		return "nenhum evento neste recorte — ajuste o modo ou o filtro de categoria acima.";
	}
	const porCategoria = new Map<Categoria, number>();
	for (const evento of eventosFiltrados) {
		porCategoria.set(evento.categoria, (porCategoria.get(evento.categoria) ?? 0) + 1);
	}
	const partes = ORDEM_CATEGORIAS.filter((categoria) => porCategoria.has(categoria)).map((categoria) => {
		const quantidade = porCategoria.get(categoria) ?? 0;
		return quantidade === 1
			? `1 ${ROTULO_CATEGORIA[categoria]}`
			: `${quantidade} ${ROTULO_CATEGORIA_PLURAL[categoria]}`;
	});
	return `${tituloComMaiuscula(partes.join(", "))}.`;
}

function gerarIcsHref(evento: EventoCalendario): string {
	const dataCompacta = evento.data.replace(/-/g, "");
	const conteudo = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Criativo Dodô//Calendário Editorial//PT",
		"BEGIN:VEVENT",
		`UID:${evento.id}@criativododo.com.br`,
		`DTSTAMP:${dataCompacta}T000000Z`,
		`DTSTART;VALUE=DATE:${dataCompacta}`,
		`SUMMARY:${evento.titulo}`,
		`DESCRIPTION:${ROTULO_CATEGORIA[evento.categoria]} · ${evento.parceiraNome}`,
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");
	return `data:text/calendar;charset=utf-8,${encodeURIComponent(conteudo)}`;
}

export function CalendarioEditorialPage() {
	const { sessao, logout } = useSession();
	const [modo, setModo] = useState<Modo>("agenda");
	const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria | "todas">("todas");

	const eventosFiltrados = useMemo(() => {
		const { inicio, fim } = intervaloDoModo(modo);
		return eventos
			.filter((evento) => evento.data >= inicio && (fim === null || evento.data <= fim))
			.filter((evento) => categoriaAtiva === "todas" || evento.categoria === categoriaAtiva)
			.sort((a, b) => a.data.localeCompare(b.data));
	}, [modo, categoriaAtiva]);

	const diasAgrupados = useMemo(() => {
		const grupos = new Map<string, EventoCalendario[]>();
		for (const evento of eventosFiltrados) {
			const lista = grupos.get(evento.data) ?? [];
			lista.push(evento);
			grupos.set(evento.data, lista);
		}
		return Array.from(grupos.entries());
	}, [eventosFiltrados]);

	if (sessao?.papelAtor !== "ADMINISTRADOR_MARCA" && sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<div className="calendario-tela">
				<p style={{ padding: 32 }}>área restrita ao administrador da marca.</p>
			</div>
		);
	}

	return (
		<div className="calendario-tela">
			<header className="calendario-nav">
				<span className="calendario-nav-marca">criativo dodô</span>
				<button type="button" className="calendario-nav-sair" onClick={() => void logout()}>
					sair
				</button>
			</header>

			<figure className="calendario-foto">
				<img src={imagemCampanha} alt="" aria-hidden="true" style={{ objectPosition: "center 45%" }} />
			</figure>

			<div className="calendario-contexto">
				<p className="calendario-eyebrow">{contexto.campanha}</p>
				<p className="calendario-assunto">{contexto.assunto}</p>
				<h1 className="calendario-frase">{fraseDeEstado(eventosFiltrados.length, modo)}</h1>
				<p className="calendario-narrativa">{narrativaDeEstado(eventosFiltrados)}</p>
			</div>

			<div className="calendario-corpo">
				<section className="calendario-secao" aria-labelledby="secao-modo">
					<p id="secao-modo" className="calendario-secao-titulo">
						visualização
					</p>
					<div className="calendario-controles" role="group" aria-label="modo de visualização">
						{(Object.keys(ROTULO_MODO) as Modo[]).map((valor) => (
							<button
								key={valor}
								type="button"
								className={`calendario-controle${modo === valor ? " is-ativo" : ""}`}
								aria-pressed={modo === valor}
								onClick={() => setModo(valor)}
							>
								{ROTULO_MODO[valor]}
							</button>
						))}
					</div>
				</section>

				<section className="calendario-secao" aria-labelledby="secao-filtro">
					<p id="secao-filtro" className="calendario-secao-titulo">
						filtrar por
					</p>
					<div className="calendario-controles" role="group" aria-label="filtro de categoria">
						<button
							type="button"
							className={`calendario-controle${categoriaAtiva === "todas" ? " is-ativo" : ""}`}
							aria-pressed={categoriaAtiva === "todas"}
							onClick={() => setCategoriaAtiva("todas")}
						>
							todas
						</button>
						{ORDEM_CATEGORIAS.map((categoria) => (
							<button
								key={categoria}
								type="button"
								className={`calendario-controle${categoriaAtiva === categoria ? " is-ativo" : ""}`}
								aria-pressed={categoriaAtiva === categoria}
								onClick={() => setCategoriaAtiva(categoria)}
							>
								{ROTULO_CATEGORIA_PLURAL[categoria]}
							</button>
						))}
					</div>
				</section>

				<section className="calendario-secao" aria-labelledby="secao-compromissos">
					<p id="secao-compromissos" className="calendario-secao-titulo">
						compromissos
					</p>

					{diasAgrupados.length === 0 ? (
						<p className="calendario-vazio">nada neste recorte.</p>
					) : (
						<ol className="calendario-dias">
							{diasAgrupados.map(([data, eventosDoDia]) => (
								<li
									key={data}
									className={`calendario-dia${data === HOJE_ISO ? " is-hoje" : ""}`}
								>
									<p className="calendario-dia-titulo">
										{tituloComMaiuscula(formatarDiaSemana(data))} · {formatarDiaMes(data)}
										{data === HOJE_ISO && <span className="calendario-dia-marca">hoje</span>}
									</p>
									<ul className="calendario-eventos">
										{eventosDoDia.map((evento) => (
											<li key={evento.id} className="calendario-evento">
												<span className="calendario-evento-marcador" aria-hidden="true" />
												<div className="calendario-evento-conteudo">
													<p className="calendario-evento-categoria">{ROTULO_CATEGORIA[evento.categoria]}</p>
													<p className="calendario-evento-titulo">{evento.titulo}</p>
													<p className="calendario-evento-parceira">{evento.parceiraNome}</p>
													<a
														href={gerarIcsHref(evento)}
														download={`${evento.id}.ics`}
														className="calendario-evento-agenda"
													>
														adicionar à agenda
													</a>
												</div>
											</li>
										))}
									</ul>
								</li>
							))}
						</ol>
					)}
				</section>

				<section className="calendario-secao" aria-labelledby="secao-campanha">
					<p id="secao-campanha" className="calendario-secao-titulo">
						contexto
					</p>
					<p className="calendario-secao-texto">
						este calendário reflete a campanha de agosto, a mesma acompanhada na mesa da campanha.
					</p>
					<Link to="/admin/campanha" className="calendario-secao-link">
						ver mesa da campanha
					</Link>
				</section>
			</div>

			<section className="calendario-rodape" aria-label="fechamento">
				<p className="calendario-rodape-nota">
					este calendário acompanha a campanha em andamento — atualizamos assim que algo mudar.
				</p>
			</section>
		</div>
	);
}
