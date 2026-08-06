type CampoDeLog = string | number | boolean | undefined;

function formatarCampos(campos: Record<string, CampoDeLog>): string {
	return Object.entries(campos)
		.filter(([, valor]) => valor !== undefined)
		.map(([chave, valor]) => `${chave}=${valor}`)
		.join(" ");
}

/**
 * Ponto único de captura de erros não tratados do frontend (sprint 2 de observabilidade) —
 * mesma tag (`[erro-nao-tratado]`) já usada em `errorHandler.ts` no backend, para que os dois
 * lados fiquem correlacionáveis por grep. Só `console.error` (sem telemetria remota, decisão
 * explícita desta sprint): útil hoje via DevTools e via qualquer coletor de log de cliente que
 * já exista/venha a existir, sem acoplar este ponto a um serviço específico.
 */
export function relatarErroFrontend(
	contexto: string,
	erro: unknown,
	camposExtras: Record<string, CampoDeLog> = {},
): void {
	const erroNormalizado =
		erro instanceof Error ? erro : new Error(String(erro));

	console.error(
		`[erro-nao-tratado] contexto=${contexto} timestamp=${new Date().toISOString()} ` +
			`mensagem=${JSON.stringify(erroNormalizado.message)} ${formatarCampos(camposExtras)}`.trimEnd(),
	);
	if (erroNormalizado.stack) {
		console.error(erroNormalizado.stack);
	}
}

let handlersInstalados = false;

/**
 * Chamado uma única vez em `main.tsx`. Cobre a classe de falha que `ErrorBoundary` (erro de
 * render) não alcança: exceção fora da árvore do React (script solto, listener, timer) e
 * Promise rejeitada sem `.catch`. `addEventListener` (não `window.onerror =`/
 * `window.onunhandledrejection =`) para não sobrescrever outros consumidores desses eventos
 * (extensões do navegador, ferramentas de dev). Guard de idempotência evita listener duplicado
 * sob HMR do Vite.
 */
export function instalarCapturaGlobalDeErros(): void {
	if (handlersInstalados) {
		return;
	}
	handlersInstalados = true;

	window.addEventListener("error", (evento) => {
		relatarErroFrontend("window-onerror", evento.error ?? evento.message, {
			arquivo: evento.filename || undefined,
			linha: evento.lineno || undefined,
		});
	});

	window.addEventListener("unhandledrejection", (evento) => {
		relatarErroFrontend(
			"unhandled-rejection",
			(evento as PromiseRejectionEvent).reason,
		);
	});
}
