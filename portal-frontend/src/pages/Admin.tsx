import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import { useSession } from "../lib/session";

interface ContaPendente {
  subProvider: string;
  email: string;
  nome: string;
  papelAtor: string;
  dataCriacao: string;
}

interface SolicitacaoExclusao {
  id: string;
  parceiraId: string;
  dataPedido: string;
  status: "PENDENTE" | "APROVADA" | "NEGADA";
}

function FilaDeExclusao({ responsavelAnalise }: { responsavelAnalise: string }) {
  const [pendentes, setPendentes] = useState<SolicitacaoExclusao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [emAcao, setEmAcao] = useState<string | null>(null);

  function carregar() {
    setCarregando(true);
    apiFetch<{ itens: SolicitacaoExclusao[] }>("/api/admin/lgpd/exclusao/pendentes")
      .then((dados) => setPendentes(dados.itens))
      .catch((erroCapturado) => {
        setErro(erroCapturado instanceof ApiError ? erroCapturado.message : "Falha ao carregar.");
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function decidir(id: string, aprovada: boolean) {
    const fundamentoJuridico = window.prompt(
      aprovada
        ? "Fundamento jurídico da aprovação (ex.: sem obrigação legal de retenção):"
        : "Fundamento jurídico da negativa (ex.: obrigação fiscal de retenção por 5 anos):",
    );
    if (!fundamentoJuridico) return;

    setEmAcao(id);
    try {
      await apiFetch(`/api/admin/lgpd/exclusao/${id}/decidir`, {
        method: "PATCH",
        body: JSON.stringify({ aprovada, fundamentoJuridico, responsavelAnalise }),
      });
      carregar();
    } catch (erroCapturado) {
      setErro(erroCapturado instanceof ApiError ? erroCapturado.message : "Falha ao decidir.");
    } finally {
      setEmAcao(null);
    }
  }

  return (
    <div style={{ marginTop: 40 }}>
      <h2 className="title-editorial" style={{ fontSize: 20, marginBottom: 16 }}>
        Solicitações de exclusão de conta (LGPD)
      </h2>

      {carregando && <p style={{ fontSize: 15 }}>Carregando...</p>}
      {!carregando && erro && <p style={{ fontSize: 15, color: "var(--color-cherry)" }}>{erro}</p>}
      {!carregando && !erro && pendentes && pendentes.length === 0 && (
        <p style={{ fontSize: 15 }}>Nenhuma solicitação de exclusão pendente.</p>
      )}

      {!carregando && !erro && pendentes && pendentes.length > 0 && (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {pendentes.map((solicitacao) => (
            <li
              key={solicitacao.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                border: "1px solid rgba(27, 23, 23, 0.1)",
                borderRadius: 12,
              }}
            >
              <div>
                <strong style={{ fontFamily: "var(--font-display)" }}>{solicitacao.parceiraId}</strong>
                <p style={{ fontSize: 14, opacity: 0.8 }}>Pedido em {solicitacao.dataPedido}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={emAcao === solicitacao.id}
                  onClick={() => void decidir(solicitacao.id, true)}
                  style={{ height: 36, padding: "0 20px", fontSize: 13 }}
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  disabled={emAcao === solicitacao.id}
                  onClick={() => void decidir(solicitacao.id, false)}
                  style={{
                    height: 36,
                    padding: "0 20px",
                    fontSize: 13,
                    borderRadius: 24,
                    border: "1px solid var(--color-cherry)",
                    background: "none",
                    color: "var(--color-cherry)",
                  }}
                >
                  Negar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminPage() {
  const { sessao } = useSession();
  const [pendentes, setPendentes] = useState<ContaPendente[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [emAcao, setEmAcao] = useState<string | null>(null);

  function carregar() {
    setCarregando(true);
    apiFetch<{ itens: ContaPendente[] }>("/api/admin/identidades/pendentes")
      .then((dados) => setPendentes(dados.itens))
      .catch((erroCapturado) => {
        setErro(erroCapturado instanceof ApiError ? erroCapturado.message : "Falha ao carregar.");
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function decidir(subProvider: string, decisao: "aprovar" | "rejeitar") {
    setEmAcao(subProvider);
    try {
      await apiFetch(`/api/admin/identidades/${subProvider}/${decisao}`, { method: "PATCH" });
      carregar();
    } catch (erroCapturado) {
      setErro(erroCapturado instanceof ApiError ? erroCapturado.message : "Falha ao decidir.");
    } finally {
      setEmAcao(null);
    }
  }

  if (sessao?.papelAtor !== "ADMINISTRADOR") {
    return (
      <section>
        <p style={{ fontSize: 15 }}>Área restrita a Administradores.</p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="title-editorial" style={{ fontSize: 28, marginBottom: 16 }}>
        Moderação de cadastros
      </h1>

      {carregando && <p style={{ fontSize: 15 }}>Carregando...</p>}
      {!carregando && erro && <p style={{ fontSize: 15, color: "var(--color-cherry)" }}>{erro}</p>}

      {!carregando && !erro && pendentes && pendentes.length === 0 && (
        <p style={{ fontSize: 15 }}>Nenhum cadastro aguardando aprovação.</p>
      )}

      {!carregando && !erro && pendentes && pendentes.length > 0 && (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {pendentes.map((conta) => (
            <li
              key={conta.subProvider}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                border: "1px solid rgba(27, 23, 23, 0.1)",
                borderRadius: 12,
              }}
            >
              <div>
                <strong style={{ fontFamily: "var(--font-display)" }}>{conta.nome}</strong>
                <p style={{ fontSize: 14, opacity: 0.8 }}>{conta.email}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={emAcao === conta.subProvider}
                  onClick={() => void decidir(conta.subProvider, "aprovar")}
                  style={{ height: 36, padding: "0 20px", fontSize: 13 }}
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  disabled={emAcao === conta.subProvider}
                  onClick={() => void decidir(conta.subProvider, "rejeitar")}
                  style={{
                    height: 36,
                    padding: "0 20px",
                    fontSize: 13,
                    borderRadius: 24,
                    border: "1px solid var(--color-cherry)",
                    background: "none",
                    color: "var(--color-cherry)",
                  }}
                >
                  Rejeitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FilaDeExclusao responsavelAnalise={sessao.email} />
    </section>
  );
}
