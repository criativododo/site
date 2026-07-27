import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export interface ItemDeBreadcrumb {
	label: string;
	to?: string;
}

interface PageHeaderContextValue {
	breadcrumb: ItemDeBreadcrumb[];
	acoes: ReactNode;
	definirBreadcrumb: (itens: ItemDeBreadcrumb[]) => void;
	definirAcoes: (acoes: ReactNode) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(
	undefined,
);

/**
 * Fica no PortalLayout, acima do <Outlet/>. Cada página usa usePageHeader() para publicar
 * seu próprio breadcrumb/ações — o layout não sabe nada sobre o conteúdo de nenhuma tela.
 */
export function PageHeaderProvider({ children }: { children: ReactNode }) {
	const [breadcrumb, setBreadcrumb] = useState<ItemDeBreadcrumb[]>([]);
	const [acoes, setAcoes] = useState<ReactNode>(null);

	const valor = useMemo(
		() => ({
			breadcrumb,
			acoes,
			definirBreadcrumb: setBreadcrumb,
			definirAcoes: setAcoes,
		}),
		[breadcrumb, acoes],
	);

	return (
		<PageHeaderContext.Provider value={valor}>
			{children}
		</PageHeaderContext.Provider>
	);
}

function usePageHeaderContext(): PageHeaderContextValue {
	const contexto = useContext(PageHeaderContext);
	if (!contexto) {
		throw new Error("usePageHeader precisa estar dentro de <PortalLayout>");
	}
	return contexto;
}

/**
 * Publica breadcrumb/ações da página atual no PortalLayout; limpa ao desmontar (troca de rota).
 *
 * Contrato: `breadcrumb` e `acoes` precisam ser referências estáveis (useMemo/useState no
 * chamador), não literais recriados a cada render — como em qualquer array de dependências de
 * useEffect. Passar um literal novo a cada render aqui cria um loop (o efeito publica no
 * contexto, o contexto re-renderiza esta página, que recria o literal, que dispara o efeito de
 * novo).
 */
export function usePageHeader(opcoes: {
	breadcrumb?: ItemDeBreadcrumb[];
	acoes?: ReactNode;
}) {
	const { definirBreadcrumb, definirAcoes } = usePageHeaderContext();
	const breadcrumb = opcoes.breadcrumb ?? SEM_BREADCRUMB;
	const acoes = opcoes.acoes ?? null;

	useEffect(() => {
		definirBreadcrumb(breadcrumb);
		definirAcoes(acoes);
		return () => {
			definirBreadcrumb(SEM_BREADCRUMB);
			definirAcoes(null);
		};
	}, [breadcrumb, acoes, definirBreadcrumb, definirAcoes]);
}

const SEM_BREADCRUMB: ItemDeBreadcrumb[] = [];

export function usePageHeaderSlots(): {
	breadcrumb: ItemDeBreadcrumb[];
	acoes: ReactNode;
} {
	const { breadcrumb, acoes } = usePageHeaderContext();
	return { breadcrumb, acoes };
}
