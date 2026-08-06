import type { SessaoAutenticada } from "../middleware/session.js";

declare global {
	namespace Express {
		interface Request {
			sessao?: SessaoAutenticada;
			requestId?: string;
		}
	}
}
