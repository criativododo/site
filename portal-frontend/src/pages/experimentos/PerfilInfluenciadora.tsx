import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiFetch } from "../../lib/api";
import { useSession } from "../../lib/session";
import { formatarCompetencia } from "../../lib/formatters";
import "./PerfilInfluenciadora.css";

/**
 * Perfil ("identidade") — oitava tela da família, fecha a jornada principal aberta pelo Login:
 * `Login.tsx` promete "acompanhar conteúdos, pagamentos e seu perfil" — Dashboard e Reconhecimento
 * já cumpriram as duas primeiras, esta tela cumpre a terceira.
 *
 * Direção (sessão de aprovação editorial, aprovação do responsável do projeto):
 * 1. Mudança de escala deliberada: todas as telas anteriores contam um capítulo (a colaboração do
 *    mês); esta conta o livro inteiro — por isso o nome da parceira é o h1, não a campanha
 *    (inversão do padrão das sete telas anteriores, onde o h1 sempre fala do material).
 * 2. Fotografia da campanha sai do papel de protagonista: a regra "uma única fotografia editorial
 *    por campanha, nunca trocada" rege telas dentro do capítulo de uma colaboração — esta tela sai
 *    desse escopo. A foto reaparece só como miniatura de arquivo dentro de "sua jornada até aqui",
 *    mesmo rebaixamento visual já estabelecido em FinanceiroInfluenciadora.tsx.
 * 3. Monograma editorial substitui avatar/foto pessoal: não existe retrato real da parceira nos
 *    dados hoje (lacuna declarada, ADR-003); um avatar com upload introduziria o padrão de
 *    configurações de conta que a diretriz do projeto proíbe. Iniciais do nome real da sessão,
 *    mesma família tipográfica do wordmark da marca.
 * 4. Sem CNPJ/PIX/CEP: são dados operacionais de pagamento (pertencem a `Cadastro.tsx`), não
 *    identidade editorial — misturá-los reintroduziria a metáfora "formulário" que esta tela
 *    deliberadamente não é.
 * 5. Jornada mostra só um resumo (2-3 entradas), nunca a lista completa — mesmo princípio já usado
 *    em FinanceiroInfluenciadora.tsx: não presumir o papel da futura tela Histórico. "ver todo o
 *    histórico" existe para validar a hierarquia visual, sem rota real ainda (mesma disciplina do
 *    "ver comprovante" em Reconhecimento).
 * 6. "Sair" mora no rodapé desta tela: fecha simetricamente a jornada aberta no Login. Chama
 *    `logout()` de `useSession` sem navegação manual — `RotaProtegida` já redireciona para
 *    `/login` assim que a sessão fica nula.
 *
 * Wiring real (DOC SPRINT #2, sessão de implementação): "chave" e "parceira desde" já
 * existiam em `Parceira` (SPEC-002 §6.2) e agora são expostos por
 * `GET /api/portal/perfil` (`PerfilComIdentidade`, additivo — `PATCH` continua só
 * pix/email, RN-04). Vêm da mesma rota que `pages/Perfil.tsx` já consome.
 *
 * Lacuna declarada (ADR-003, não presumida, ainda de pé): não existe endpoint que agregue
 * "colaborações concluídas" no tempo — `listarPendencias` só cobre a competência corrente.
 * A seção "sua jornada até aqui" fica como estado vazio explícito, nunca dado inventado.
 *
 * Rota própria (`/identidade`, não `/perfil`) porque `/perfil` já é servida por `pages/Perfil.tsx`
 * (formulário operacional de PIX/endereço, dentro do PortalLayout) — mesmo padrão de desambiguação
 * já usado para `/reconhecimento` vs. `/financeiro` legado.
 */

interface PerfilComIdentidade {
	chave: string;
	parceiraDesde: string;
}

function obterIniciais(nome: string): string {
	const partes = nome.trim().split(/\s+/).filter(Boolean);
	if (partes.length === 0) {
		return "";
	}
	const primeira = partes[0]?.[0] ?? "";
	const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
	return (primeira + ultima).toUpperCase();
}

export function PerfilInfluenciadoraPage() {
	const { sessao, logout } = useSession();
	const [identidade, setIdentidade] = useState<PerfilComIdentidade | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		if (sessao?.papelAtor !== "INFLUENCIADORA") return;
		let ativo = true;
		apiFetch<PerfilComIdentidade>("/api/portal/perfil")
			.then((dados) => ativo && setIdentidade(dados))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError ? erroCapturado.message : "não foi possível carregar.",
				);
			})
			.finally(() => ativo && setCarregando(false));
		return () => {
			ativo = false;
		};
	}, [sessao?.papelAtor]);

	if (sessao?.papelAtor !== "INFLUENCIADORA") {
		return (
			<section className="identidade-tela">
				<p style={{ padding: 32 }}>área restrita a parceiras.</p>
			</section>
		);
	}

	const iniciais = obterIniciais(sessao.nome);

	return (
		<div className="identidade-tela">
			<header className="identidade-nav">
				<span className="identidade-nav-marca">criativo dodô</span>
				<Link to="/hoje" className="identidade-nav-link">
					voltar à sua mesa
				</Link>
			</header>

			<div className="identidade-contexto">
				<div className="identidade-monograma" aria-hidden="true">
					<span>{iniciais}</span>
				</div>
				<p className="identidade-eyebrow">seu perfil</p>
				<h1 className="identidade-nome">{sessao.nome}</h1>
				{carregando ? (
					<p className="identidade-assinatura">carregando</p>
				) : erro || !identidade ? (
					<p className="identidade-assinatura">{erro ?? "não foi possível carregar."}</p>
				) : (
					<>
						<p className="identidade-assinatura">assina como "{identidade.chave}"</p>
						<p className="identidade-vinculo">
							parceira da criativo dodô desde{" "}
							{formatarCompetencia(identidade.parceiraDesde.slice(0, 7))}
						</p>
					</>
				)}
			</div>

			<div className="identidade-corpo">
				<section className="identidade-secao" aria-labelledby="secao-jornada">
					<p id="secao-jornada" className="identidade-secao-titulo">
						sua jornada até aqui
					</p>
					<p className="identidade-jornada-resumo">
						histórico consolidado de colaborações concluídas ainda não tem endpoint —
						lacuna declarada, ver relatório da sessão.
					</p>
				</section>
			</div>

			<section className="identidade-rodape" aria-label="fechamento">
				<p className="identidade-rodape-nota">
					esse espaço é seu — ele cresce a cada colaboração.
				</p>
				<div className="identidade-rodape-acoes">
					<button type="button" className="identidade-divergencia">
						algo desatualizado aqui? avisar a agência
					</button>
					<button
						type="button"
						className="identidade-sair"
						onClick={() => void logout()}
					>
						sair
					</button>
				</div>
			</section>
		</div>
	);
}
