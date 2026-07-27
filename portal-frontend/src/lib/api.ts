const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

/**
 * Wrapper único de acesso à API do Portal. Sempre envia credentials (cookie de sessão) —
 * nunca envia/aceita parceiraId como parâmetro de cliente (ADR-010 / PORTAL_ARQUITETURA.md §7:
 * o isolamento por Parceira é resolvido pelo backend a partir da sessão, nunca pelo cliente).
 */
export async function apiFetch<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	// FormData define seu próprio Content-Type (com boundary) — o navegador precisa calculá-lo,
	// nunca fixá-lo aqui, senão o multipart chega malformado ao backend.
	const ehFormData = init?.body instanceof FormData;

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...init,
		credentials: "include",
		headers: {
			...(ehFormData ? {} : { "Content-Type": "application/json" }),
			...init?.headers,
		},
	});

	if (!response.ok) {
		const body = await response
			.json()
			.catch(() => ({ error: response.statusText }));
		throw new ApiError(response.status, body.error ?? response.statusText);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}
