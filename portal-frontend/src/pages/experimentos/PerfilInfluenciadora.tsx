import { Link } from "react-router-dom";
import { useSession } from "../../lib/session";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
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
 * Lacuna declarada (ADR-003, não presumida): "chave"/nome artístico, data de início da parceria e
 * o resumo de colaborações concluídas não existem em `SessaoParceira` hoje — fixture nesta sessão,
 * como em todas as telas anteriores da família. O nome em si vem da sessão real (`sessao.nome`).
 *
 * Rota própria (`/identidade`, não `/perfil`) porque `/perfil` já é servida por `pages/Perfil.tsx`
 * (formulário operacional de PIX/endereço, dentro do PortalLayout) — mesmo padrão de desambiguação
 * já usado para `/reconhecimento` vs. `/financeiro` legado.
 */

interface EntradaJornada {
	id: string;
	titulo: string;
	detalhe: string;
	foco: string;
}

const contexto = {
	chave: "Bia Lima",
	parceiraDesde: "março de 2026",
	colaboracoesConcluidas: 3,
	jornada: [
		{
			id: "agosto",
			titulo: "colaboração de agosto · essência labial",
			detalhe: "publicada · reconhecida",
			foco: "center 22%",
		},
		{
			id: "julho",
			titulo: "carrossel de julho",
			detalhe: "publicado",
			foco: "center 22%",
		},
	] satisfies EntradaJornada[],
};

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
				<p className="identidade-assinatura">assina como "{contexto.chave}"</p>
				<p className="identidade-vinculo">
					parceira da criativo dodô desde {contexto.parceiraDesde}
				</p>
			</div>

			<div className="identidade-corpo">
				<section className="identidade-secao" aria-labelledby="secao-jornada">
					<p id="secao-jornada" className="identidade-secao-titulo">
						sua jornada até aqui
					</p>
					<p className="identidade-jornada-resumo">
						{contexto.colaboracoesConcluidas} colaborações concluídas desde que você
						chegou.
					</p>
					<ul className="identidade-jornada-lista">
						{contexto.jornada.map((entrada) => (
							<li key={entrada.id} className="identidade-jornada-item">
								<div className="identidade-jornada-foto" aria-hidden="true">
									<img
										src={imagemCampanha}
										alt=""
										style={{ objectPosition: entrada.foco }}
									/>
								</div>
								<div className="identidade-jornada-conteudo">
									<span className="identidade-jornada-titulo">{entrada.titulo}</span>
									<span className="identidade-jornada-detalhe">{entrada.detalhe}</span>
								</div>
							</li>
						))}
					</ul>
					<button type="button" className="identidade-acao-secundaria">
						ver todo o histórico
					</button>
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
