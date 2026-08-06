import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSession } from "../../lib/session";
import {
	type Etapa,
	ORDEM_ETAPAS,
	ROTULO_STATUS,
	ROTULO_TRANSPORTADORA,
	URL_RASTREAMENTO_TRANSPORTADORA,
	buscarEnvio,
	calcularAlerta,
} from "./logisticaFixture";
import "./LogisticaEnvioDetalhe.css";

/**
 * Detalhe de um envio de Logística (`/admin/logistica/:id`) — mesmo padrão de rota de
 * `/admin/parceiras/:id` (CentralInfluenciadora): a lista fica enxuta, tudo que é extenso
 * (timeline completa, rastreamento, observações, comprovante, ações) mora aqui.
 *
 * Ações são todas não-destrutivas (decisão do responsável do projeto, 2026-08-06): a tela
 * continua só leitura enquanto não existir módulo real de rastreamento no backend (ADR-003).
 * Nenhum botão "marcar como entregue"/"confirmar recebimento" — abrir WhatsApp, copiar código,
 * abrir a página oficial da transportadora e ver a campanha são links/ações que já funcionam de
 * verdade hoje, sem depender de persistência.
 */

const MENSAGEM_WHATSAPP: Partial<Record<Etapa, string>> = {
	enviado: "oi! seu kit da campanha já foi enviado — em breve você recebe o código de rastreio por aqui.",
	transporte: "oi! seu kit está a caminho. assim que sair para entrega, avisamos por aqui.",
	saiu_entrega: "oi! seu kit saiu para entrega hoje — fique de olho.",
	entregue: "oi! nosso registro mostra que o kit já chegou até você. pode confirmar o recebimento por aqui?",
};

function construirLinkWhatsapp(telefone: string, etapaAtual: Etapa): string {
	const mensagem = MENSAGEM_WHATSAPP[etapaAtual] ?? "oi! passando para falar sobre o envio da campanha.";
	return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

type EstadoCopia = "ocioso" | "copiado" | "falhou";

export function LogisticaEnvioDetalhePage() {
	const { sessao, logout } = useSession();
	const { id } = useParams<{ id: string }>();
	const [estadoCopia, setEstadoCopia] = useState<EstadoCopia>("ocioso");

	if (sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<div className="logistica-detalhe-tela">
				<p style={{ padding: 32 }}>área restrita à equipe dodô.</p>
			</div>
		);
	}

	const envio = id ? buscarEnvio(id) : undefined;

	if (!envio) {
		return (
			<div className="logistica-detalhe-tela">
				<header className="logistica-detalhe-nav">
					<span className="logistica-detalhe-nav-marca">criativo dodô</span>
					<Link to="/admin/logistica" className="logistica-detalhe-nav-link">
						voltar à logística
					</Link>
				</header>
				<p className="logistica-detalhe-vazio">envio não encontrado.</p>
			</div>
		);
	}

	const alerta = calcularAlerta(envio);
	const indiceAtual = ORDEM_ETAPAS.indexOf(envio.etapaAtual);
	const temComprovante = envio.etapaAtual === "entregue" || envio.etapaAtual === "confirmado";

	async function copiarRastreio() {
		if (!envio!.codigoRastreio) return;
		try {
			await navigator.clipboard.writeText(envio!.codigoRastreio);
			setEstadoCopia("copiado");
		} catch {
			// Permissão de clipboard negada pelo navegador — feedback honesto em vez de falha silenciosa.
			setEstadoCopia("falhou");
		}
		setTimeout(() => setEstadoCopia("ocioso"), 2000);
	}

	return (
		<div className="logistica-detalhe-tela">
			<header className="logistica-detalhe-nav">
				<span className="logistica-detalhe-nav-marca">criativo dodô</span>
				<div className="logistica-detalhe-nav-acoes">
					<Link to="/admin/logistica" className="logistica-detalhe-nav-link">
						voltar à logística
					</Link>
					<button type="button" className="logistica-detalhe-nav-sair" onClick={() => void logout()}>
						sair
					</button>
				</div>
			</header>

			<div className="logistica-detalhe-cabecalho">
				<p className="logistica-detalhe-eyebrow">logística · {envio.campanha}</p>
				<h1 className="logistica-detalhe-parceira">{envio.parceiraNome}</h1>
				<p className="logistica-detalhe-status">{ROTULO_STATUS[envio.etapaAtual]}</p>
				<p className="logistica-detalhe-kit">{envio.kit}</p>

				{alerta && (
					<div className="logistica-detalhe-alerta">
						<span className="logistica-detalhe-alerta-marcador" aria-hidden="true" />
						<p className="logistica-detalhe-alerta-texto">{alerta.motivo}</p>
					</div>
				)}
			</div>

			<div className="logistica-detalhe-corpo">
				<section className="logistica-detalhe-secao" aria-labelledby="secao-rastreamento">
					<p id="secao-rastreamento" className="logistica-detalhe-secao-titulo">
						rastreamento
					</p>
					{envio.transportadora && envio.codigoRastreio ? (
						<>
							<p className="logistica-detalhe-secao-texto">
								{ROTULO_TRANSPORTADORA[envio.transportadora]} · {envio.codigoRastreio}
							</p>
							<div className="logistica-detalhe-acoes-linha">
								<button type="button" className="logistica-detalhe-acao" onClick={() => void copiarRastreio()}>
									{estadoCopia === "copiado"
										? "código copiado"
										: estadoCopia === "falhou"
											? "não foi possível copiar — selecione manualmente"
											: "copiar código de rastreio"}
								</button>
								<a
									href={URL_RASTREAMENTO_TRANSPORTADORA[envio.transportadora]}
									target="_blank"
									rel="noreferrer"
									className="logistica-detalhe-acao"
								>
									abrir site da transportadora
								</a>
							</div>
						</>
					) : (
						<p className="logistica-detalhe-secao-texto is-vazio">ainda sem código de rastreio.</p>
					)}
				</section>

				<section className="logistica-detalhe-secao" aria-labelledby="secao-timeline">
					<p id="secao-timeline" className="logistica-detalhe-secao-titulo">
						jornada completa
					</p>
					<ol className="logistica-detalhe-timeline">
						{envio.passos.map((passo) => {
							const indicePasso = ORDEM_ETAPAS.indexOf(passo.etapa);
							const estado = indicePasso < indiceAtual ? "is-concluido" : indicePasso === indiceAtual ? "is-atual" : "";
							return (
								<li key={passo.etapa} className={`logistica-detalhe-timeline-passo ${estado}`.trim()}>
									<span className="logistica-detalhe-timeline-marcador" aria-hidden="true" />
									<div className="logistica-detalhe-timeline-conteudo">
										<span className="logistica-detalhe-timeline-titulo">{passo.rotulo}</span>
										{passo.data && <span className="logistica-detalhe-timeline-detalhe">{passo.data}</span>}
									</div>
								</li>
							);
						})}
					</ol>
				</section>

				<section className="logistica-detalhe-secao" aria-labelledby="secao-observacoes">
					<p id="secao-observacoes" className="logistica-detalhe-secao-titulo">
						observações
					</p>
					<p className="logistica-detalhe-secao-texto">
						{envio.observacao ?? envio.excecaoTransportadora ?? "nenhuma observação registrada para este envio."}
					</p>
				</section>

				<section className="logistica-detalhe-secao" aria-labelledby="secao-comprovante">
					<p id="secao-comprovante" className="logistica-detalhe-secao-titulo">
						comprovante
					</p>
					<p className="logistica-detalhe-secao-texto is-vazio">
						{temComprovante
							? "comprovante de entrega ainda não disponível neste ambiente — upload real é trabalho de backend futuro (ADR-003)."
							: "comprovante fica disponível aqui assim que o kit for entregue."}
					</p>
				</section>

				<section className="logistica-detalhe-secao" aria-labelledby="secao-acoes">
					<p id="secao-acoes" className="logistica-detalhe-secao-titulo">
						ações
					</p>
					<div className="logistica-detalhe-acoes-linha">
						<a
							href={construirLinkWhatsapp(envio.parceiraTelefone, envio.etapaAtual)}
							target="_blank"
							rel="noreferrer"
							className="logistica-detalhe-acao"
						>
							abrir whatsapp
						</a>
						<Link to="/admin/campanha" className="logistica-detalhe-acao">
							ver campanha relacionada
						</Link>
					</div>
				</section>
			</div>
		</div>
	);
}
